/**
 * GSQ API Client for Node.js Backend
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '') + '/api'
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? '/api'
      : 'https://gsq-site.onrender.com/api');

export function getAuthToken(): string | null {
  return sessionStorage.getItem('gsq_admin_token') || sessionStorage.getItem('gsq_admin_pin') || null;
}

export function setAuthToken(token: string) {
  sessionStorage.setItem('gsq_admin_token', token);
}

export function clearAuthToken() {
  sessionStorage.removeItem('gsq_admin_token');
  sessionStorage.removeItem('gsq_admin_pin');
  sessionStorage.removeItem('gsq_admin_auth');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errMessage = errJson.error;
    } catch {}
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(pinOrPassword: string) {
    const data = await request<{ success: boolean; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin: pinOrPassword }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async verifyAuth(): Promise<boolean> {
    try {
      const data = await request<{ authenticated: boolean }>('/auth/verify');
      return !!data.authenticated;
    } catch {
      return false;
    }
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    clearAuthToken();
  },

  // Products
  async getProducts() {
    return request<any[]>('/products');
  },

  async addProduct(product: any) {
    return request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, updates: any) {
    return request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string) {
    return request<any>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Coupons
  async getCoupons() {
    return request<any[]>('/coupons');
  },

  async addCoupon(coupon: any) {
    return request<any>('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  },

  async updateCoupon(id: string, updates: any) {
    return request<any>(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteCoupon(id: string) {
    return request<any>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  async validateCoupon(code: string, productId?: string) {
    return request<{ valid: boolean; discount: number; message: string; coupon?: any }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, productId }),
    });
  },

  // Orders
  async getOrders() {
    return request<any[]>('/orders');
  },

  async createOrder(order: any) {
    return request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async completeOrder(orderNumber: string) {
    return request<any>(`/orders/${encodeURIComponent(orderNumber)}/complete`, {
      method: 'POST',
    });
  },

  async clearOrders() {
    return request<any>('/orders', {
      method: 'DELETE',
    });
  },

  async generateMockSale() {
    return request<any>('/orders/mock-sale', {
      method: 'POST',
    });
  },

  // Server Settings
  async getSettings() {
    return request<any>('/settings');
  },

  async updateSettings(settings: any) {
    return request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Stats
  async getStats() {
    return request<any>('/stats');
  },

  // YooKassa API
  async createYooKassaPayment(data: {
    nickname: string;
    productId: string;
    productName: string;
    amount: number;
    quantity?: number;
    promoCode?: string;
    period?: string;
    returnUrl?: string;
  }) {
    return request<{
      success: boolean;
      orderNumber: string;
      paymentId?: string;
      paymentUrl?: string;
      isDemo?: boolean;
      message?: string;
      status?: string;
    }>('/yookassa/create-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkYooKassaPayment(paymentId: string) {
    return request<{
      status: string;
      paid: boolean;
      order?: any;
    }>(`/yookassa/check/${paymentId}`);
  },

  async checkYooKassaOrder(orderNumber: string) {
    return request<{
      found: boolean;
      order?: any;
      paid: boolean;
    }>(`/yookassa/check-order/${orderNumber}`);
  },

  async getYooKassaSettings() {
    return request<{
      shopId: string;
      secretKey: string;
      hasSecretKey: boolean;
      testMode: boolean;
      enabled: boolean;
      isConfigured: boolean;
      webhookUrl: string;
    }>('/yookassa/settings');
  },

  async updateYooKassaSettings(settings: {
    shopId?: string;
    secretKey?: string;
    testMode?: boolean;
    enabled?: boolean;
  }) {
    return request<{
      success: boolean;
      isConfigured: boolean;
    }>('/yookassa/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
};
