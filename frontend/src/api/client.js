const rawBase = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;
function getCartId() {
  let cartId = localStorage.getItem('apnamart_cart_id');
  if (!cartId) {
    cartId = `web_cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem('apnamart_cart_id', cartId);
  }
  return cartId;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-cart-id': getCartId(),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || 'Request failed');
  }
  return data;
}

export const api = {
  searchProducts(params = {}) {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.brand) qs.set('brand', params.brand);
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return request(`/products/search?${qs.toString()}`);
  },

  getCategories() {
    return request('/products/categories');
  },

  checkServiceability(pincode) {
    return request(`/stores/serviceability/${encodeURIComponent(pincode)}`);
  },

  listStores(city = '') {
    const qs = city ? `?city=${encodeURIComponent(city)}` : '';
    return request(`/stores${qs}`);
  },

  getCart() {
    return request('/cart');
  },

  addToCart(productId, quantity = 1) {
    return request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  removeFromCart(productId) {
    return request(`/cart/items/${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
  },

  clearCart() {
    return request('/cart/clear', {
      method: 'POST'
    });
  },

  createOrder(payload) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  trackOrder(orderId) {
    return request(`/orders/track/${encodeURIComponent(orderId)}`);
  }
};
