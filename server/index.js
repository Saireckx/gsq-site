import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const PORT = process.env.PORT || 4000;
const ADMIN_PIN = process.env.ADMIN_PIN || '982164';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gsq#Admin2026_9xK!';

// In-memory token store: token -> { expiresAt: number }
const activeSessions = new Map();

// Generate secure random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Ensure database file exists
async function ensureDb() {
  const dataDir = path.join(__dirname, 'data');
  if (!existsSync(dataDir)) {
    await fs.mkdir(dataDir, { recursive: true });
  }
  if (!existsSync(DB_FILE)) {
    const defaultData = {
      products: [],
      coupons: [],
      orders: [],
      serverSettings: {
        ip: 'play.mygsq.fun',
        version: '26.1.2',
        onlinePlayers: 0,
        maxPlayers: 100,
        mapUrl: 'https://map.mygsq.fun/',
      },
      admin: {
        pin: ADMIN_PIN,
        password: ADMIN_PASSWORD,
      },
      paymentGateway: {
        shopId: process.env.PAYMENT_SHOP_ID || '',
        secretKey: process.env.PAYMENT_SECRET_KEY || '',
        testMode: true,
        enabled: true,
      },
      giftLinks: [],
    };
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Database helper: Read DB
async function readDb() {
  await ensureDb();
  try {
    const content = await fs.readFile(DB_FILE, 'utf-8');
    const data = JSON.parse(content);
    if (!Array.isArray(data.giftLinks)) {
      data.giftLinks = [];
    }
    return data;
  } catch (err) {
    console.error('[DB] Error reading db.json:', err);
    throw err;
  }
}

// Database helper: Atomic Write DB
async function writeDb(data) {
  const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, DB_FILE);
}

// Parse request JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Protect against oversized payload (max 5MB)
      if (raw.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Response with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(JSON.stringify(data));
}

// Validate auth token from Authorization header
function isAuthorized(req, db) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  // Master tokens for dev/convenience
  if (token === ADMIN_PIN || token === ADMIN_PASSWORD || token === db?.admin?.pin || token === db?.admin?.password) {
    return true;
  }

  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

// Calculate Dashboard Stats
function calculateStats(orders) {
  const completed = (orders || []).filter((o) => o.status === 'completed');
  const totalRevenue = completed.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalCount = completed.length;

  const todayOrders = completed.slice(0, Math.min(3, completed.length));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const avgToday = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0;
  const avgWeek = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  return {
    salesToday: todayOrders.length,
    salesWeek: completed.length,
    salesTotal: totalCount,
    revenueToday: Math.round(todayRevenue),
    revenueWeek: Math.round(totalRevenue),
    revenueTotal: Math.round(totalRevenue),
    avgCheckToday: avgToday,
    avgCheckWeek: avgWeek,
    visitsToday: 0,
    visitsWeek: 0,
  };
}

// Static File MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

// Serve static build from dist folder in production
async function serveStatic(req, res, pathname) {
  if (!existsSync(DIST_DIR)) {
    sendJson(res, 404, { error: 'Static frontend not built yet. Run npm run build.' });
    return;
  }

  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: ensure path is within DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  if (!existsSync(filePath) || (await fs.stat(filePath)).isDirectory()) {
    // SPA fallback: return index.html for browser routes
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const stat = await fs.stat(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    sendJson(res, 500, { error: 'Failed to read file' });
  }
}

// Main HTTP Server
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // =========================================================================
  // API ROUTING (/api/...)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    try {
      const db = await readDb();

      // ---------------------------------------------------------------------
      // Health check & Server Status
      // ---------------------------------------------------------------------
      if (pathname === '/api/status' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'ok',
          uptime: process.uptime(),
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        });
      }

      // ---------------------------------------------------------------------
      // Auth Endpoints
      // ---------------------------------------------------------------------
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJsonBody(req);
        const pin = String(body.pin || body.password || '').trim();
        const validPins = [
          ADMIN_PIN,
          ADMIN_PASSWORD,
          db.admin?.pin,
          db.admin?.password,
        ].filter(Boolean);

        if (validPins.includes(pin)) {
          const token = generateToken();
          // Session valid for 7 days
          activeSessions.set(token, { expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
          return sendJson(res, 200, {
            success: true,
            token,
            user: { role: 'admin', username: 'GSQ Admin' },
          });
        }
        return sendJson(res, 401, { success: false, error: 'Неверный PIN-код или пароль' });
      }

      if (pathname === '/api/auth/verify' && method === 'GET') {
        const valid = isAuthorized(req, db);
        return sendJson(res, 200, { authenticated: valid });
      }

      if (pathname === '/api/auth/logout' && method === 'POST') {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          const token = authHeader.replace(/^Bearer\s+/i, '').trim();
          activeSessions.delete(token);
        }
        return sendJson(res, 200, { success: true });
      }

      // ---------------------------------------------------------------------
      // Products Endpoints
      // ---------------------------------------------------------------------
      if (pathname === '/api/products') {
        if (method === 'GET') {
          return sendJson(res, 200, db.products || []);
        }

        if (method === 'POST') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          const newProd = {
            ...body,
            id: body.id || `prod-${Date.now()}`,
            numericId: body.numericId || Math.floor(1060500 + Math.random() * 900),
          };
          db.products.unshift(newProd);
          await writeDb(db);
          return sendJson(res, 201, newProd);
        }
      }

      if (pathname.startsWith('/api/products/')) {
        const prodId = pathname.replace('/api/products/', '');

        if (method === 'PUT') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          const idx = db.products.findIndex((p) => p.id === prodId);
          if (idx === -1) {
            // If not found, add it
            db.products.push({ ...body, id: prodId });
          } else {
            db.products[idx] = { ...db.products[idx], ...body, id: prodId };
          }
          await writeDb(db);
          return sendJson(res, 200, db.products.find((p) => p.id === prodId));
        }

        if (method === 'DELETE') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          db.products = db.products.filter((p) => p.id !== prodId);
          await writeDb(db);
          return sendJson(res, 200, { success: true, id: prodId });
        }
      }

      // ---------------------------------------------------------------------
      // Coupons Endpoints
      // ---------------------------------------------------------------------
      if (pathname === '/api/coupons') {
        if (method === 'GET') {
          // Exclude legacy mock coupons
          const activeCoupons = (db.coupons || []).filter(
            (c) => !['TECH10', 'KOT10', 'CODE20', 'END10', 'GSQ'].includes(c.code?.toUpperCase())
          );
          if (activeCoupons.length !== (db.coupons || []).length) {
            db.coupons = activeCoupons;
            await writeDb(db);
          }
          return sendJson(res, 200, activeCoupons);
        }

        if (method === 'POST') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          const cleanCode = String(body.code || '').trim().toUpperCase();
          const newCoupon = {
            id: body.id || `cp-${Date.now()}`,
            code: cleanCode,
            discount: Number(body.discount) || 10,
            description: String(body.description || '').trim(),
            usesCount: 0,
            maxUses: body.maxUses ? Number(body.maxUses) : undefined,
            applicableProductIds: Array.isArray(body.applicableProductIds) ? body.applicableProductIds : ['all'],
            active: body.active !== false,
          };
          db.coupons = (db.coupons || []).filter((c) => c.code?.toUpperCase() !== cleanCode);
          db.coupons.unshift(newCoupon);
          await writeDb(db);
          return sendJson(res, 201, newCoupon);
        }
      }

      if (pathname === '/api/coupons/validate' && method === 'POST') {
        const body = await parseJsonBody(req);
        const code = String(body.code || '').trim().toUpperCase();
        const productId = body.productId;

        if (!code || ['TECH10', 'KOT10', 'CODE20', 'END10', 'GSQ'].includes(code)) {
          return sendJson(res, 200, { valid: false, discount: 0, message: 'Недействительный промокод' });
        }

        const coupon = (db.coupons || []).find((c) => c.code?.toUpperCase() === code && c.active);
        if (!coupon) {
          return sendJson(res, 200, { valid: false, discount: 0, message: 'Недействительный промокод' });
        }

        if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
          return sendJson(res, 200, { valid: false, discount: 0, message: 'Лимит промокода исчерпан' });
        }

        if (
          productId &&
          coupon.applicableProductIds?.length > 0 &&
          !coupon.applicableProductIds.includes('all') &&
          !coupon.applicableProductIds.includes(productId)
        ) {
          return sendJson(res, 200, {
            valid: false,
            discount: 0,
            message: 'Промокод не действует на этот товар',
          });
        }

        return sendJson(res, 200, {
          valid: true,
          discount: coupon.discount,
          message: `Промокод применён! Скидка ${coupon.discount}%`,
          coupon,
        });
      }

      if (pathname.startsWith('/api/coupons/')) {
        const couponId = pathname.replace('/api/coupons/', '');
        const search = decodeURIComponent(couponId).trim().toUpperCase();

        if (method === 'PUT') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          const idx = (db.coupons || []).findIndex((c) => c.id === couponId || c.code?.toUpperCase() === search);
          if (idx !== -1) {
            db.coupons[idx] = {
              ...db.coupons[idx],
              ...body,
              code: body.code ? String(body.code).trim().toUpperCase() : db.coupons[idx].code,
              id: db.coupons[idx].id,
            };
            await writeDb(db);
            return sendJson(res, 200, db.coupons[idx]);
          }
          return sendJson(res, 404, { error: 'Coupon not found' });
        }

        if (method === 'DELETE') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          db.coupons = (db.coupons || []).filter(
            (c) => c.id !== couponId && c.code?.toUpperCase() !== search
          );
          await writeDb(db);
          return sendJson(res, 200, { success: true, id: couponId });
        }
      }

      // ---------------------------------------------------------------------
      // Orders Endpoints
      // ---------------------------------------------------------------------
      if (pathname === '/api/orders') {
        if (method === 'GET') {
          return sendJson(res, 200, db.orders || []);
        }

        if (method === 'POST') {
          const body = await parseJsonBody(req);
          const matchingProduct = (db.products || []).find((p) => p.id === body.productId);

          const newOrder = {
            id: `ord-${Date.now()}`,
            orderNumber: `GSQ-${Math.floor(100000 + Math.random() * 900000)}`,
            nickname: String(body.nickname || 'Unknown').trim(),
            productId: body.productId,
            productName: body.productName || matchingProduct?.name || 'Товар',
            amount: Number(body.amount) || matchingProduct?.price || 0,
            promoCode: body.promoCode ? String(body.promoCode).trim().toUpperCase() : undefined,
            discountAmount: body.discountAmount ? Number(body.discountAmount) : undefined,
            paymentMethod: body.paymentMethod || 'СБП',
            status: 'completed',
            createdAt: 'Только что',
            iconColor: matchingProduct?.iconColor || 'magenta',
          };

          db.orders.unshift(newOrder);

          // Increment coupon counter if used
          if (newOrder.promoCode) {
            const cp = (db.coupons || []).find((c) => c.code === newOrder.promoCode);
            if (cp) {
              cp.usesCount = (cp.usesCount || 0) + 1;
            }
          }

          await writeDb(db);
          return sendJson(res, 201, newOrder);
        }

        if (method === 'DELETE') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          db.orders = [];
          await writeDb(db);
          return sendJson(res, 200, { success: true, count: 0 });
        }
      }

      // Complete order endpoint
      if (pathname.startsWith('/api/orders/') && pathname.endsWith('/complete') && method === 'POST') {
        const orderIdOrNumber = decodeURIComponent(
          pathname.replace('/api/orders/', '').replace('/complete', '')
        );
        const order = (db.orders || []).find(
          (o) => o.orderNumber === orderIdOrNumber || o.id === orderIdOrNumber
        );

        if (!order) {
          return sendJson(res, 404, { error: 'Order not found' });
        }

        order.status = 'completed';
        order.paidAt = new Date().toISOString();

        if (order.promoCode) {
          const cp = (db.coupons || []).find((c) => c.code === order.promoCode);
          if (cp) {
            cp.usesCount = (cp.usesCount || 0) + 1;
          }
        }

        const targetProduct = (db.products || []).find((p) => p.id === order.productId);
        if (targetProduct?.command) {
          const mcCommand = targetProduct.command.replace('{user}', order.nickname);
          console.log(`[ORDER COMPLETED] Order ${order.orderNumber} for ${order.nickname}: Executing command ${mcCommand}`);
        }

        await writeDb(db);
        return sendJson(res, 200, { success: true, order });
      }

      // Update order endpoint
      if (
        pathname.startsWith('/api/orders/') &&
        !pathname.endsWith('/complete') &&
        pathname !== '/api/orders/mock-sale' &&
        method === 'PUT'
      ) {
        const orderIdOrNumber = decodeURIComponent(pathname.replace('/api/orders/', ''));
        const body = await parseJsonBody(req);
        const order = (db.orders || []).find(
          (o) => o.orderNumber === orderIdOrNumber || o.id === orderIdOrNumber
        );
        if (!order) {
          return sendJson(res, 404, { error: 'Order not found' });
        }
        Object.assign(order, body);
        await writeDb(db);
        return sendJson(res, 200, order);
      }

      if (pathname === '/api/orders/mock-sale' && method === 'POST') {
        if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
        const sampleNicknames = ['Danik_Pro', 'Miner_77', 'AlexCool', 'ShadowNinja', 'EnderGamer', 'CraftKing', 'Ksenia_MC'];
        const randomNick = sampleNicknames[Math.floor(Math.random() * sampleNicknames.length)];
        const randomProduct = (db.products || [])[Math.floor(Math.random() * db.products.length)];
        const methods = ['СБП', 'Банковская карта', 'Т-Банк'];
        const randomMethod = methods[Math.floor(Math.random() * methods.length)];

        const newOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: `GSQ-${Math.floor(100000 + Math.random() * 900000)}`,
          nickname: randomNick,
          productId: randomProduct?.id || 'sub',
          productName: randomProduct?.name || 'Подписка SUB',
          amount: randomProduct?.price || 199,
          paymentMethod: randomMethod,
          status: 'completed',
          createdAt: 'Только что',
          iconColor: randomProduct?.iconColor || 'magenta',
        };

        db.orders.unshift(newOrder);
        await writeDb(db);
        return sendJson(res, 201, newOrder);
      }

      // ---------------------------------------------------------------------
      // Payment Gateway Integration (/api/payment)
      // ---------------------------------------------------------------------

      // 1. Get Payment Gateway configuration (Admin only for full details)
      if (pathname === '/api/payment/settings') {
        if (method === 'GET') {
          const pg = db.paymentGateway || {
            shopId: process.env.PAYMENT_SHOP_ID || '',
            secretKey: process.env.PAYMENT_SECRET_KEY || '',
            testMode: true,
            enabled: true,
          };
          const host = req.headers.host || 'play.mygsq.fun';
          const proto = req.headers['x-forwarded-proto'] || 'https';
          const currentShopId = pg.shopId || process.env.PAYMENT_SHOP_ID || '';
          const currentSecret = pg.secretKey || process.env.PAYMENT_SECRET_KEY || '';

          return sendJson(res, 200, {
            shopId: currentShopId,
            secretKey: currentSecret ? (currentSecret.slice(0, 8) + '••••••••••••') : '',
            hasSecretKey: !!currentSecret,
            testMode: pg.testMode ?? true,
            enabled: pg.enabled ?? true,
            isConfigured: !!(currentShopId && currentSecret),
            webhookUrl: `${proto}://${host}/api/payment/webhook`,
          });
        }

        if (method === 'POST') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          db.paymentGateway = {
            ...(db.paymentGateway || {}),
            shopId: body.shopId !== undefined ? String(body.shopId).trim() : (db.paymentGateway?.shopId || ''),
            secretKey: body.secretKey && !body.secretKey.includes('•••') ? String(body.secretKey).trim() : (db.paymentGateway?.secretKey || ''),
            testMode: body.testMode !== undefined ? Boolean(body.testMode) : true,
            enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
          };
          await writeDb(db);
          return sendJson(res, 200, {
            success: true,
            isConfigured: !!(db.paymentGateway.shopId && db.paymentGateway.secretKey),
          });
        }
      }

      // 2. Create payment in Payment Gateway
      if ((pathname === '/api/payment/create' || pathname === '/api/payment/create-payment') && method === 'POST') {
        const body = await parseJsonBody(req);
        const { nickname, productId, productName, amount, promoCode, period, returnUrl, quantity } = body;

        const cleanNick = String(nickname || '').trim();
        if (!cleanNick || cleanNick.length < 3 || cleanNick.length > 16) {
          return sendJson(res, 400, { error: 'Никнейм должен содержать от 3 до 16 символов' });
        }

        const matchingProduct = (db.products || []).find((p) => p.id === productId);
        const finalAmount = Math.max(1, Math.round(Number(amount) || matchingProduct?.price || 50));
        const orderNumber = `GSQ-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderId = `ord-${Date.now()}`;
        const qty = Math.max(1, Math.min(100, Number(quantity) || 1));

        const pgConfig = db.paymentGateway || {};
        const shopId = process.env.PAYMENT_SHOP_ID || pgConfig.shopId;
        const secretKey = process.env.PAYMENT_SECRET_KEY || pgConfig.secretKey;
        const host = req.headers.host || 'play.mygsq.fun';
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const defaultReturnUrl = returnUrl || `${proto}://${host}/#/payment/result?orderNumber=${orderNumber}`;

        const newOrder = {
          id: orderId,
          orderNumber,
          nickname: cleanNick,
          productId: productId || 'item',
          productName: productName || matchingProduct?.name || 'Товар',
          amount: finalAmount,
          quantity: qty,
          promoCode: promoCode ? String(promoCode).trim().toUpperCase() : undefined,
          paymentMethod: 'Онлайн-оплата',
          status: 'pending',
          createdAt: 'Только что',
          createdAtIso: new Date().toISOString(),
          iconColor: matchingProduct?.iconColor || 'gold',
        };

        // If credentials are configured, connect to payment API
        if (shopId && secretKey) {
          try {
            const idempotenceKey = crypto.randomUUID();
            const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
            const apiUrl = process.env.PAYMENT_API_URL || 'https://api.platega.com/v1/payments';

            const gatewayRes = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotenceKey,
                'Authorization': authHeader,
              },
              body: JSON.stringify({
                amount: {
                  value: `${finalAmount}.00`,
                  currency: 'RUB',
                },
                capture: true,
                confirmation: {
                  type: 'redirect',
                  return_url: defaultReturnUrl,
                },
                description: `GSQ: ${newOrder.productName} (Ник: ${cleanNick}, Заказ: ${orderNumber})`,
                metadata: {
                  nickname: cleanNick,
                  productId: productId || '',
                  orderNumber,
                  promoCode: newOrder.promoCode || '',
                },
              }),
            });

            const gatewayData = await gatewayRes.json();

            if (!gatewayRes.ok) {
              console.error('[Payment Gateway Error]:', gatewayData);
              return sendJson(res, 400, {
                error: gatewayData.description || 'Ошибка при создании платежа',
                details: gatewayData,
              });
            }

            newOrder.paymentGatewayId = gatewayData.id;
            newOrder.paymentUrl = gatewayData.confirmation?.confirmation_url;
            newOrder.gatewayStatus = gatewayData.status;

            db.orders.unshift(newOrder);
            await writeDb(db);

            return sendJson(res, 201, {
              success: true,
              orderNumber,
              paymentId: gatewayData.id,
              paymentUrl: gatewayData.confirmation?.confirmation_url,
              status: gatewayData.status,
            });
          } catch (apiErr) {
            console.error('[Payment Gateway Request Error]:', apiErr);
            return sendJson(res, 502, { error: 'Не удалось связаться с платёжным сервером: ' + apiErr.message });
          }
        }

        // If payment gateway keys are not configured yet, do not give free goods
        return sendJson(res, 503, {
          success: false,
          error: 'Платёжный шлюз временно не настроен администратором. Онлайн-оплата будет доступна после подключения платёжной системы.',
        });
      }

      // 3. Payment Gateway Webhook endpoint
      if (pathname === '/api/payment/webhook' && method === 'POST') {
        const body = await parseJsonBody(req);
        const event = body.event;
        const paymentObj = body.object;

        if (paymentObj) {
          const paymentId = paymentObj.id;
          const orderNumber = paymentObj.metadata?.orderNumber;

          const order = (db.orders || []).find(
            (o) => o.paymentGatewayId === paymentId || (orderNumber && o.orderNumber === orderNumber)
          );

          if (order) {
            if (event === 'payment.succeeded') {
              order.status = 'completed';
              order.paidAt = new Date().toISOString();
              if (paymentObj.payment_method?.title) {
                order.paymentMethod = paymentObj.payment_method.title;
              }

              // Increment promo code usage if used
              if (order.promoCode) {
                const cp = (db.coupons || []).find((c) => c.code === order.promoCode);
                if (cp) cp.usesCount = (cp.usesCount || 0) + 1;
              }

              // Execute Minecraft server command if set
              const targetProduct = (db.products || []).find((p) => p.id === order.productId);
              if (targetProduct?.command) {
                const mcCommand = targetProduct.command.replace('{user}', order.nickname);
                console.log(`[PAYMENT SUCCESS] Order ${order.orderNumber} for ${order.nickname} PAID! Executing command: ${mcCommand}`);
              }
            } else if (event === 'payment.canceled') {
              order.status = 'canceled';
              order.canceledReason = paymentObj.cancellation_details?.reason;
            }

            await writeDb(db);
          }
        }

        return sendJson(res, 200, { status: 'OK' });
      }

      // 4. Status Check by Payment ID or Order Number
      if (pathname.startsWith('/api/payment/check/')) {
        const paymentId = pathname.replace('/api/payment/check/', '');
        const order = (db.orders || []).find((o) => o.paymentGatewayId === paymentId || o.id === paymentId);

        const pgConfig = db.paymentGateway || {};
        const shopId = process.env.PAYMENT_SHOP_ID || pgConfig.shopId;
        const secretKey = process.env.PAYMENT_SECRET_KEY || pgConfig.secretKey;

        if (shopId && secretKey && paymentId && !order?.isDemo) {
          try {
            const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
            const apiUrl = process.env.PAYMENT_API_URL || 'https://api.platega.com/v1/payments';
            const checkRes = await fetch(`${apiUrl}/${paymentId}`, {
              headers: { 'Authorization': authHeader },
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.status === 'succeeded' && order && order.status !== 'completed') {
                order.status = 'completed';
                await writeDb(db);
              }
              return sendJson(res, 200, {
                status: checkData.status,
                paid: checkData.paid,
                order,
              });
            }
          } catch {}
        }

        return sendJson(res, 200, {
          status: order?.status || 'not_found',
          paid: order?.status === 'completed',
          order,
        });
      }

      if (pathname.startsWith('/api/payment/check-order/')) {
        const orderNumber = pathname.replace('/api/payment/check-order/', '');
        const order = (db.orders || []).find((o) => o.orderNumber === orderNumber);
        return sendJson(res, 200, {
          found: !!order,
          order,
          paid: order?.status === 'completed',
        });
      }

      // Backwards-compatible legacy webhook endpoint
      if (pathname === '/api/payments/webhook' && (method === 'POST' || method === 'GET')) {
        return sendJson(res, 200, { status: 'OK' });
      }

      // ---------------------------------------------------------------------
      // Server Settings Endpoints
      // ---------------------------------------------------------------------
      if (pathname === '/api/settings') {
        if (method === 'GET') {
          return sendJson(res, 200, db.serverSettings || {});
        }

        if (method === 'PUT') {
          if (!isAuthorized(req, db)) return sendJson(res, 401, { error: 'Unauthorized' });
          const body = await parseJsonBody(req);
          db.serverSettings = {
            ...db.serverSettings,
            ...body,
          };
          await writeDb(db);
          return sendJson(res, 200, db.serverSettings);
        }
      }

      // ---------------------------------------------------------------------
      // Stats / Analytics Endpoint
      // ---------------------------------------------------------------------
      if (pathname === '/api/stats' && method === 'GET') {
        const stats = calculateStats(db.orders);
        return sendJson(res, 200, stats);
      }

      // ---------------------------------------------------------------------
      // Gift Links Endpoints (Discord tickets / Manual crate links)
      // ---------------------------------------------------------------------
      const SERVER_HATS = [
        { id: 'sombrero', name: 'Сомбреро', rarity: 'common', emoji: '👒', image: '/hats/sombrero.png' },
        { id: 'mushroom_hat', name: 'Грибная шляпа', rarity: 'common', emoji: '🍄', image: '/hats/mushroom_hat.png' },
        { id: 'toad', name: 'Жаба', rarity: 'common', emoji: '🐸', image: '/hats/toad.png' },
        { id: 'beer_helmet', name: 'Пивной шлем', rarity: 'common', emoji: '🍺', image: '/hats/beer_helmet.png' },
        { id: 'gold_crown', name: 'Золотая корона', rarity: 'common', emoji: '👑', image: '/hats/gold_crown.png' },
        { id: 'ushanka', name: 'Шапка-ушанка', rarity: 'common', emoji: '🪆', image: '/hats/ushanka.png' },
        { id: 'welder_mask', name: 'Сварочная маска', rarity: 'common', emoji: '🥽', image: '/hats/welder_mask.png' },
        { id: 'altyn_helmet', name: 'Шлем «Алтын»', rarity: 'rare', emoji: '🪖', image: '/hats/altyn_helmet.png' },
        { id: 'fire_red', name: 'Огонь на голове (красный)', rarity: 'rare', emoji: '🔥', image: '/hats/fire_red.png', subtitle: 'Анимировано' },
        { id: 'fire_blue', name: 'Огонь на голове (синий)', rarity: 'rare', emoji: '💠', image: '/hats/fire_blue.png', subtitle: 'Анимировано' },
        { id: 'bear_hat', name: 'Медвежья шапка', rarity: 'rare', emoji: '🐻', image: '/hats/bear_hat.png' },
        { id: 'fox_hat', name: 'Лисья шапка', rarity: 'rare', emoji: '🦊', image: '/hats/fox_hat.png' },
        { id: 'propeller_cap', name: 'Кепка с пропеллером', rarity: 'rare', emoji: '🧢', image: '/hats/propeller_cap.png', subtitle: 'Анимировано' },
        { id: 'kabuto_helmet', name: 'Шлем «Кабуто»', rarity: 'rare', emoji: '🥷', image: '/hats/kabuto_helmet.png' },
        { id: 'halo', name: 'Нимб', rarity: 'legendary', emoji: '😇', image: '/hats/halo.png' },
        { id: 'cigarette', name: 'Сигарета', rarity: 'legendary', emoji: '🚬', image: '/hats/cigarette.png', subtitle: 'Анимировано' },
        { id: 'mlg_glasses', name: 'MLG очки', rarity: 'legendary', emoji: '🕶️', image: '/hats/mlg_glasses.png' },
      ];

      function getRandomHatServer(excludedIds = []) {
        const excludedSet = new Set(excludedIds);
        let available = SERVER_HATS.filter((h) => !excludedSet.has(h.id));
        if (available.length === 0) available = SERVER_HATS;

        const commonCount = available.filter((h) => h.rarity === 'common').length;
        const rareCount = available.filter((h) => h.rarity === 'rare').length;
        const legCount = available.filter((h) => h.rarity === 'legendary').length;

        const weights = available.map((h) => {
          if (h.rarity === 'common') return commonCount > 0 ? 70 / commonCount : 0;
          if (h.rarity === 'rare') return rareCount > 0 ? 25 / rareCount : 0;
          return legCount > 0 ? 5 / legCount : 0;
        });

        const totalWeight = weights.reduce((s, w) => s + w, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;
        for (let i = 0; i < available.length; i++) {
          cumulative += weights[i];
          if (rand <= cumulative) return available[i];
        }
        return available[0];
      }

      // 1. Get all gift links (Admin)
      if (pathname === '/api/gift-links' && method === 'GET') {
        return sendJson(res, 200, db.giftLinks || []);
      }

      // 2. Create gift link (Admin)
      if (pathname === '/api/gift-links' && method === 'POST') {
        const body = await parseJsonBody(req);
        const totalBoxes = Math.max(1, Math.min(100, Number(body.totalBoxes) || 1));
        const durationMinutes = Number(body.durationMinutes) || 15;
        const createdAt = Date.now();
        const expiresAt = createdAt + durationMinutes * 60 * 1000;
        const linkId = `gift-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Smart-token encoding matching client algorithm
        const payloadStr = JSON.stringify({
          i: linkId,
          n: body.nickname ? String(body.nickname).trim() : '',
          b: totalBoxes,
          c: createdAt,
          e: expiresAt,
          d: durationMinutes,
          s: Math.random().toString(36).substring(2, 8),
        });

        const encoded = Buffer.from(payloadStr)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        let hash = 0x811c9dc5;
        for (let i = 0; i < payloadStr.length; i++) {
          hash ^= payloadStr.charCodeAt(i);
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        const checksum = (hash >>> 0).toString(36);
        const token = `gsq_${encoded}_${checksum}`;

        const newGiftLink = {
          id: linkId,
          token,
          nickname: body.nickname ? String(body.nickname).trim() : undefined,
          totalBoxes,
          remainingBoxes: totalBoxes,
          wonHats: [],
          createdAt,
          expiresAt,
          durationMinutes,
          note: body.note ? String(body.note).trim() : undefined,
          isRevoked: false,
        };

        db.giftLinks = db.giftLinks || [];
        db.giftLinks.unshift(newGiftLink);
        await writeDb(db);

        return sendJson(res, 201, newGiftLink);
      }

      // 3. Get single gift link by token (Public player query)
      if (pathname.startsWith('/api/gift-links/') && !pathname.endsWith('/open') && method === 'GET') {
        const tokenOrId = decodeURIComponent(pathname.replace('/api/gift-links/', ''));
        const link = (db.giftLinks || []).find((l) => l.token === tokenOrId || l.id === tokenOrId);

        if (!link) {
          return sendJson(res, 404, { error: 'Ссылка не найдена' });
        }

        const isExpired = Date.now() > link.expiresAt;
        const isCompleted = link.remainingBoxes <= 0;

        return sendJson(res, 200, {
          link,
          isExpired,
          isCompleted,
        });
      }

      // 4. Open crate for gift link (Public player spin)
      if (pathname.startsWith('/api/gift-links/') && pathname.endsWith('/open') && method === 'POST') {
        const tokenOrId = decodeURIComponent(
          pathname.replace('/api/gift-links/', '').replace('/open', '')
        );
        const link = (db.giftLinks || []).find((l) => l.token === tokenOrId || l.id === tokenOrId);

        if (!link) {
          return sendJson(res, 404, { error: 'Ссылка не найдена' });
        }

        if (link.isRevoked) {
          return sendJson(res, 403, { error: 'Ссылка была отозвана администратором' });
        }

        if (Date.now() > link.expiresAt) {
          return sendJson(res, 410, { error: 'Срок действия ссылки (15 минут) истёк' });
        }

        if (link.remainingBoxes <= 0) {
          return sendJson(res, 400, { error: 'Все коробки по этой ссылке уже открыты' });
        }

        const body = await parseJsonBody(req);
        const excludedIds = Array.isArray(body.excludedHatIds)
          ? body.excludedHatIds
          : (link.wonHats || []).map((h) => h.id);

        const wonHat = body.wonHat || getRandomHatServer(excludedIds);

        link.wonHats = link.wonHats || [];
        link.wonHats.push(wonHat);
        link.remainingBoxes = Math.max(0, link.remainingBoxes - 1);

        await writeDb(db);

        return sendJson(res, 200, {
          success: true,
          wonHat,
          remainingBoxes: link.remainingBoxes,
          wonHats: link.wonHats,
          isCompleted: link.remainingBoxes <= 0,
        });
      }

      // 5. Delete or Revoke gift link (Admin)
      if (pathname.startsWith('/api/gift-links/') && method === 'DELETE') {
        const tokenOrId = decodeURIComponent(pathname.replace('/api/gift-links/', ''));
        db.giftLinks = (db.giftLinks || []).filter((l) => l.id !== tokenOrId && l.token !== tokenOrId);
        await writeDb(db);
        return sendJson(res, 200, { success: true });
      }

      // If no API route matched
      return sendJson(res, 404, { error: `Endpoint ${method} ${pathname} not found` });
    } catch (err) {
      console.error('[API Error]:', err);
      return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
    }
  }

  // =========================================================================
  // STATIC FRONTEND SERVING (Production Mode)
  // =========================================================================
  return serveStatic(req, res, pathname);
});

// Start listening
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` GSQ Production Backend Server is running!`);
  console.log(` Port:    http://localhost:${PORT}`);
  console.log(` API:     http://localhost:${PORT}/api/status`);
  console.log(` DB File: ${DB_FILE}`);
  console.log(` PIN:     ${ADMIN_PIN}`);
  console.log(`====================================================`);
});
