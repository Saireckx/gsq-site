import React, { createContext, useContext, useState, useEffect } from 'react';
import { CubeColor } from '../components/admin/CubeIcon';
import { SERVER_INFO as DEFAULT_SERVER_INFO, MAP_URL as DEFAULT_MAP_URL } from '../lib/constants';
import { api } from '../lib/api';

export interface ProductItem {
  id: string;
  numericId: number;
  name: string;
  price: number;
  monthlyPrice?: number;
  oldPrice?: number;
  period: string; // 'навсегда', '1 месяц', '1 шт.'
  type: 'Предмет' | 'Привилегия' | 'Валюта' | 'Рулетка' | 'Другое';
  command: string;
  description: string;
  category: string;
  iconColor: CubeColor;
  hidden: boolean;
  offlineAllowed: boolean;
  popular?: boolean;
  features: string[];
}

export interface CouponItem {
  id: string;
  code: string;
  discount: number; // in %
  description: string;
  usesCount: number;
  maxUses?: number;
  applicableProductIds: string[]; // e.g. ['all'] or specific IDs
  active: boolean;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  nickname: string;
  productId: string;
  productName: string;
  amount: number;
  promoCode?: string;
  discountAmount?: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'canceled' | 'refunded';
  createdAt: string;
  iconColor: CubeColor;
  paymentUrl?: string;
}

interface ServerSettings {
  ip: string;
  version: string;
  onlinePlayers?: number;
  maxPlayers?: number;
  mapUrl: string;
}

interface StoreContextType {
  products: ProductItem[];
  coupons: CouponItem[];
  orders: OrderItem[];
  serverSettings: ServerSettings;
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
  // Product management
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  addProduct: (product: Omit<ProductItem, 'id' | 'numericId'>) => ProductItem;
  deleteProduct: (id: string) => void;
  // Coupon management
  addCoupon: (coupon: Omit<CouponItem, 'id' | 'usesCount'>) => void;
  updateCoupon: (id: string, updates: Partial<CouponItem>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, productId?: string) => { valid: boolean; discount: number; message: string; coupon?: CouponItem };
  // Order management
  createOrder: (order: { nickname: string; productId: string; productName: string; amount: number; paymentMethod: string; promoCode?: string }) => OrderItem;
  createYooKassaPayment: (params: {
    nickname: string;
    productId: string;
    productName: string;
    amount: number;
    promoCode?: string;
    period?: string;
  }) => Promise<{
    success: boolean;
    orderNumber: string;
    paymentUrl?: string;
    paymentId?: string;
    isDemo?: boolean;
    message?: string;
  }>;
  completeOrder: (orderNumber: string) => void;
  generateMockSale: () => void;
  clearOrders: () => void;
  // Server settings
  updateServerSettings: (updates: Partial<ServerSettings>) => void;
  // Analytics
  getAnalytics: () => {
    salesToday: number;
    salesWeek: number;
    salesTotal: number;
    revenueToday: number;
    revenueWeek: number;
    revenueTotal: number;
    avgCheckToday: number;
    avgCheckWeek: number;
    visitsToday: number;
    visitsWeek: number;
  };
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'sub',
    numericId: 1060509,
    name: 'Подписка SUB 🍇',
    price: 299,
    monthlyPrice: 139,
    oldPrice: 349,
    period: 'навсегда',
    type: 'Привилегия',
    command: 'lp user {user} parent add sub',
    description: 'Базовая подписка: кастомная музыка, /rename, /relore, /hat, /crawl и поддержка проекта.',
    category: 'Подписки',
    iconColor: 'magenta',
    hidden: false,
    offlineAllowed: true,
    popular: false,
    features: [
      'Уникальный префикс в Табе',
      'Возможность ставить кастомную музыку на пластинках (/disc burn)',
      'Изменить название предмета и его лор (/rename и /relore)',
      'Поставить блок на голову (/hat)',
      'Возможность ползать (/crawl)',
      'Поддержка нашего сервера для дальнейшей работы',
    ],
  },
  {
    id: 'sub-plus',
    numericId: 1060508,
    name: 'Подписка SUB+ 🍎',
    price: 749,
    monthlyPrice: 289,
    oldPrice: 899,
    period: 'навсегда',
    type: 'Привилегия',
    command: 'lp user {user} parent add sub+',
    description: 'Максимальные возможности: /resize, /co near, /squaremap hide, кастомная музыка и светящийся префикс.',
    category: 'Подписки',
    iconColor: 'red',
    hidden: false,
    offlineAllowed: true,
    popular: true,
    features: [
      'Уникальный префикс в табе',
      'Возможность ставить кастомную музыку на пластинках (/disc burn)',
      'Изменение размера персонажа (/resize 0.8-1.15)',
      'Изменить название предмета и его лор (/rename и /relore)',
      'Поставить блок на голову (/hat)',
      'Просмотр недавных взаимодействий вокруг (/co near)',
      'Возможность ползать (/crawl)',
      'Скрыть себя с онлайн карты (/squaremap hide /squaremap show)',
      'Поддержка нашего сервера для дальнейшей работы',
    ],
  },
  {
    id: 'unban',
    numericId: 1060511,
    name: 'Разбан',
    price: 299,
    period: '1 шт.',
    type: 'Другое',
    command: 'unban {user}',
    description: 'Снятие блокировки с аккаунта (если это возможно).',
    category: 'Услуги',
    iconColor: 'green',
    hidden: false,
    offlineAllowed: true,
    features: ['Полное снятие блокировки с аккаунта'],
  },
  {
    id: 'unmute',
    numericId: 1060510,
    name: 'Размут',
    price: 199,
    period: '1 шт.',
    type: 'Другое',
    command: 'unmute {user}',
    description: 'Снятие мута с чата.',
    category: 'Услуги',
    iconColor: 'white',
    hidden: false,
    offlineAllowed: true,
    features: ['Снятие ограничений на отправку сообщений в чат'],
  },
  {
    id: 'hat-box',
    numericId: 1060515,
    name: 'Коробка со шляпой',
    price: 49,
    oldPrice: 79,
    period: '1 шт.',
    type: 'Рулетка',
    command: 'box give {user} hat_box 1',
    description: 'Кейс с аксессуарами: 17 шляп (70% Базовые, 25% Редкие, 5% Легендарные).',
    category: 'Кейсы',
    iconColor: 'gold',
    hidden: false,
    offlineAllowed: true,
    popular: true,
    features: [
      '17 уникальных шляп и аксессуаров',
      'Шанс 5% на легендарную вещь (Нимб, Сигарета, MLG очки)',
      'Шанс 25% на редкие маски, Алтын и эффекты огня',
      'Моментальное открытие и примерка',
    ],
  },
  {
    id: 'donate',
    numericId: 1060512,
    name: 'Пожертвование',
    price: 50,
    period: 'навсегда',
    type: 'Другое',
    command: 'broadcast Спасибо игроку {user} за поддержку сервера!',
    description: 'Поддержи сервер и получи благодарность всего сообщества!',
    category: 'Поддержка',
    iconColor: 'gold',
    hidden: false,
    offlineAllowed: true,
    features: ['Благодарность в чате и значок мецената в Discord'],
  },
];

const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: 'c1',
    code: 'TECH10',
    discount: 10,
    description: 'tech',
    usesCount: 0,
    applicableProductIds: ['all'],
    active: true,
  },
  {
    id: 'c2',
    code: 'KOT10',
    discount: 10,
    description: 'новости',
    usesCount: 0,
    applicableProductIds: ['all'],
    active: true,
  },
  {
    id: 'c3',
    code: 'CODE20',
    discount: 20,
    description: 'Скидка',
    usesCount: 0,
    applicableProductIds: ['unban', 'sub', 'sub-plus'],
    active: true,
  },
  {
    id: 'c4',
    code: 'END10',
    discount: 10,
    description: 'end10',
    usesCount: 0,
    applicableProductIds: ['all'],
    active: true,
  },
  {
    id: 'c5',
    code: 'GSQ',
    discount: 15,
    description: 'Фирменный промокод GSQ',
    usesCount: 0,
    applicableProductIds: ['all'],
    active: true,
  },
];

const DEFAULT_ORDERS: OrderItem[] = [];

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or defaults
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('gsq_products');
      if (saved) {
        const parsed: ProductItem[] = JSON.parse(saved);
        const cleaned: ProductItem[] = parsed
          .map((p): ProductItem => {
            if (p.id === 'sub' && (p.price === 199 || !p.monthlyPrice)) {
              return {
                ...p,
                name: 'Подписка SUB 🍇',
                price: 299,
                monthlyPrice: 139,
                features: DEFAULT_PRODUCTS[0].features,
              };
            }
            if (p.id === 'sub-plus' && (p.price === 399 || !p.monthlyPrice)) {
              return {
                ...p,
                name: 'Подписка SUB+ 🍎',
                price: 749,
                monthlyPrice: 289,
                features: DEFAULT_PRODUCTS[1].features,
              };
            }
            return p;
          })
          .filter(
            (p) => Boolean(p) && p.id !== 'diamond-sword' && !p.id.includes('-1m')
          );

        // Ensure hat-box and all other default products are always present
        for (const def of DEFAULT_PRODUCTS) {
          if (!cleaned.some((p) => p.id === def.id)) {
            cleaned.push(def);
          }
        }

        if (cleaned.length > 0) return cleaned;
      }
    } catch {}
    return DEFAULT_PRODUCTS;
  });

  // Load coupons from localStorage or defaults
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    try {
      const saved = localStorage.getItem('gsq_coupons');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COUPONS;
  });

  // Load orders history from localStorage or defaults
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('gsq_orders');
      if (saved) {
        const parsed: OrderItem[] = JSON.parse(saved);
        // Purge legacy mock demo orders if present
        const nonMock = parsed.filter(
          (o) =>
            !['Armor_ykon', 'sicttik', 'Zaqul2912', 'RockyHydra45115', 'Notch_Fan', 'VoxelCrafter'].includes(o.nickname)
        );
        if (nonMock.length !== parsed.length) {
          localStorage.setItem('gsq_orders', JSON.stringify(nonMock));
        }
        return nonMock;
      }
    } catch {}
    return DEFAULT_ORDERS;
  });

  // Server settings
  const [serverSettings, setServerSettings] = useState<ServerSettings>(() => {
    try {
      const saved = localStorage.getItem('gsq_server_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === '1.21.x' || parsed.ip === 'play.gsq.ru' || parsed.ip === 'mc.gsq.ru') {
          parsed.version = '26.1.2';
          parsed.ip = 'play.mygsq.fun';
        }
        if (!parsed.mapUrl || parsed.mapUrl.includes('example.com')) {
          parsed.mapUrl = 'https://map.mygsq.fun/';
        }
        return parsed;
      }
    } catch {}
    return {
      ip: 'play.mygsq.fun',
      version: '26.1.2',
      onlinePlayers: 0,
      maxPlayers: 100,
      mapUrl: 'https://map.mygsq.fun/',
    };
  });

  // Test mode switcher matching screenshot 1
  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gsq_test_mode') === 'true';
    } catch {}
    return false;
  });

  // Initial backend fetch with graceful local cache fallback
  useEffect(() => {
    let active = true;
    const fetchBackend = async () => {
      try {
        const [prods, cps, ords, settings] = await Promise.all([
          api.getProducts().catch(() => null),
          api.getCoupons().catch(() => null),
          api.getOrders().catch(() => null),
          api.getSettings().catch(() => null),
        ]);

        if (!active) return;

        if (Array.isArray(prods) && prods.length > 0) {
          setProducts(prods);
        }
        if (Array.isArray(cps) && cps.length > 0) {
          setCoupons(cps);
        }
        if (Array.isArray(ords) && ords.length > 0) {
          setOrders(ords);
        }
        if (settings && settings.ip) {
          setServerSettings((prev) => ({ ...prev, ...settings }));
        }
      } catch (err) {
        // Backend offline, keep local cache
      }
    };
    fetchBackend();
    return () => {
      active = false;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gsq_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('gsq_coupons', JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('gsq_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('gsq_server_settings', JSON.stringify(serverSettings));
    } catch {}
  }, [serverSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('gsq_test_mode', String(isTestMode));
    } catch {}
  }, [isTestMode]);

  // Product actions
  const updateProduct = (id: string, updates: Partial<ProductItem>) => {
    const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setProducts(updated);
    const target = updated.find((p) => p.id === id);
    if (target) {
      api.updateProduct(id, target).catch(() => {});
    }
  };

  const addProduct = (product: Omit<ProductItem, 'id' | 'numericId'>): ProductItem => {
    const newId = 'prod-' + Date.now();
    const newNumericId = Math.floor(1060500 + Math.random() * 900);
    const newProd: ProductItem = {
      ...product,
      id: newId,
      numericId: newNumericId,
    };
    setProducts((prev) => [newProd, ...prev]);
    api.addProduct(newProd).catch(() => {});
    return newProd;
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    api.deleteProduct(id).catch(() => {});
  };

  // Coupon actions
  const addCoupon = (coupon: Omit<CouponItem, 'id' | 'usesCount'>) => {
    const newCoupon: CouponItem = {
      ...coupon,
      id: 'cp-' + Date.now(),
      usesCount: 0,
      code: coupon.code.toUpperCase().trim(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    api.addCoupon(newCoupon).catch(() => {});
  };

  const updateCoupon = (id: string, updates: Partial<CouponItem>) => {
    setCoupons((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              code: updates.code ? updates.code.toUpperCase().trim() : item.code,
            }
          : item
      );
      const target = updated.find((c) => c.id === id);
      if (target) {
        api.updateCoupon(id, target).catch(() => {});
      }
      return updated;
    });
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((item) => item.id !== id));
    api.deleteCoupon(id).catch(() => {});
  };

  const validateCoupon = (code: string, productId?: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { valid: false, discount: 0, message: '' };

    const found = coupons.find((c) => c.code === clean && c.active);
    if (!found) {
      return { valid: false, discount: 0, message: 'Недействительный промокод' };
    }

    if (found.maxUses && found.usesCount >= found.maxUses) {
      return { valid: false, discount: 0, message: 'Лимит промокода исчерпан' };
    }

    if (
      productId &&
      found.applicableProductIds.length > 0 &&
      !found.applicableProductIds.includes('all') &&
      !found.applicableProductIds.includes(productId)
    ) {
      return {
        valid: false,
        discount: 0,
        message: 'Промокод не действует на этот товар',
      };
    }

    return {
      valid: true,
      discount: found.discount,
      message: `Промокод применён! Скидка ${found.discount}%`,
      coupon: found,
    };
  };

  // Order actions
  const createOrder = ({
    nickname,
    productId,
    productName,
    amount,
    paymentMethod,
    promoCode,
  }: {
    nickname: string;
    productId: string;
    productName: string;
    amount: number;
    paymentMethod: string;
    promoCode?: string;
  }) => {
    const matchingProduct = products.find((p) => p.id === productId);
    const color: CubeColor = matchingProduct?.iconColor || 'magenta';

    const newOrder: OrderItem = {
      id: 'ord-' + Date.now(),
      orderNumber: 'GSQ-' + Math.floor(100000 + Math.random() * 900000),
      nickname,
      productId,
      productName,
      amount,
      promoCode,
      paymentMethod,
      status: 'completed',
      createdAt: 'Только что',
      iconColor: color,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Increment coupon use if promoCode was used
    if (promoCode) {
      const clean = promoCode.trim().toUpperCase();
      setCoupons((prev) =>
        prev.map((c) => (c.code === clean ? { ...c, usesCount: c.usesCount + 1 } : c))
      );
    }

    api.createOrder(newOrder).catch(() => {});

    return newOrder;
  };

  const createYooKassaPayment = async ({
    nickname,
    productId,
    productName,
    amount,
    promoCode,
    period,
  }: {
    nickname: string;
    productId: string;
    productName: string;
    amount: number;
    promoCode?: string;
    period?: string;
  }) => {
    const cleanNick = nickname.trim();
    const returnUrl = `${window.location.origin}${window.location.pathname}#/payment/result`;

    try {
      const res = await api.createYooKassaPayment({
        nickname: cleanNick,
        productId,
        productName,
        amount,
        promoCode,
        period,
        returnUrl,
      });

      if (res && res.orderNumber) {
        const matchingProduct = products.find((p) => p.id === productId);
        const newOrder: OrderItem = {
          id: 'ord-' + Date.now(),
          orderNumber: res.orderNumber,
          nickname: cleanNick,
          productId,
          productName,
          amount,
          promoCode: promoCode ? promoCode.trim().toUpperCase() : undefined,
          paymentMethod: 'ЮKassa',
          status: 'pending',
          createdAt: 'Только что',
          iconColor: matchingProduct?.iconColor || 'gold',
          paymentUrl: res.paymentUrl,
        };
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.orderNumber !== res.orderNumber)]);
      }

      return res;
    } catch (err: any) {
      console.warn('[YooKassa API unreachable, using client offline mode]:', err);
      const orderNumber = 'GSQ-' + Math.floor(100000 + Math.random() * 900000);
      const matchingProduct = products.find((p) => p.id === productId);
      const newOrder: OrderItem = {
        id: 'ord-' + Date.now(),
        orderNumber,
        nickname: cleanNick,
        productId,
        productName,
        amount,
        promoCode: promoCode ? promoCode.trim().toUpperCase() : undefined,
        paymentMethod: 'ЮKassa',
        status: 'pending',
        createdAt: 'Только что',
        iconColor: matchingProduct?.iconColor || 'gold',
        paymentUrl: `#/payment/result?orderNumber=${orderNumber}&demo=true`,
      };
      setOrders((prev) => [newOrder, ...prev]);

      return {
        success: true,
        orderNumber,
        isDemo: true,
        paymentUrl: `#/payment/result?orderNumber=${orderNumber}&demo=true`,
        message: 'ЮKassa готова к приёму платежей! Укажите ключи в панели управления.',
      };
    }
  };

  const completeOrder = (orderNumber: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNumber === orderNumber) {
          if (o.promoCode) {
            const clean = o.promoCode.trim().toUpperCase();
            setCoupons((cps) =>
              cps.map((c) => (c.code === clean ? { ...c, usesCount: c.usesCount + 1 } : c))
            );
          }
          return { ...o, status: 'completed' };
        }
        return o;
      })
    );
  };

  const generateMockSale = () => {
    const sampleNicknames = ['Danik_Pro', 'Miner_77', 'AlexCool', 'ShadowNinja', 'EnderGamer', 'CraftKing', 'Ksenia_MC'];
    const randomNick = sampleNicknames[Math.floor(Math.random() * sampleNicknames.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const methods = ['СБП', 'Банковская карта', 'Т-Банк'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];

    createOrder({
      nickname: randomNick,
      productId: randomProduct.id,
      productName: randomProduct.name,
      amount: randomProduct.price,
      paymentMethod: randomMethod,
    });
  };

  const clearOrders = () => {
    setOrders([]);
    api.clearOrders().catch(() => {});
  };

  const updateServerSettings = (updates: Partial<ServerSettings>) => {
    setServerSettings((prev) => {
      const updated = { ...prev, ...updates };
      api.updateSettings(updated).catch(() => {});
      return updated;
    });
  };

  // Analytics calculation based on real orders
  const getAnalytics = () => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalCount = completedOrders.length;

    // Filter today's real orders
    const todayDateStr = new Date().toLocaleDateString('ru-RU');
    const todayOrders = completedOrders.filter((o) => {
      if (o.createdAt.includes('Сегодня')) return true;
      try {
        const d = new Date(o.createdAt);
        return !isNaN(d.getTime()) && d.toLocaleDateString('ru-RU') === todayDateStr;
      } catch {
        return false;
      }
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);
    const weekOrders = completedOrders;
    const weekRevenue = totalRevenue;

    const avgToday = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0;
    const avgWeek = weekOrders.length > 0 ? Math.round(weekRevenue / weekOrders.length) : 0;

    return {
      salesToday: todayOrders.length,
      salesWeek: weekOrders.length,
      salesTotal: totalCount,
      revenueToday: Math.round(todayRevenue),
      revenueWeek: Math.round(weekRevenue),
      revenueTotal: Math.round(totalRevenue),
      avgCheckToday: avgToday,
      avgCheckWeek: avgWeek,
      visitsToday: 0,
      visitsWeek: 0,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        coupons,
        orders,
        serverSettings,
        isTestMode,
        setIsTestMode,
        updateProduct,
        addProduct,
        deleteProduct,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        createOrder,
        createYooKassaPayment,
        completeOrder,
        generateMockSale,
        clearOrders,
        updateServerSettings,
        getAnalytics,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
