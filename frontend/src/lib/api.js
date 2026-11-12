const BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, { method = 'GET', body, auth } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Basic ${auth}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('Could not reach the restaurant server. Please check your connection.', 0);
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!res.ok) {
    const msg = res.status === 401 ? 'Wrong username or password' : data?.message || `Something went wrong (${res.status})`;
    throw new ApiError(msg, res.status, data?.errors);
  }
  return data;
}

export const api = {
  menu: () => request('/api/menu'),
  placeOrder: (order) => request('/api/orders', { method: 'POST', body: order }),
  trackOrder: (code, phone) => request(`/api/orders/${encodeURIComponent(code)}?phone=${encodeURIComponent(phone)}`),
  reserve: (r) => request('/api/reservations', { method: 'POST', body: r }),
  admin: {
    me: (auth) => request('/api/admin/me', { auth }),
    summary: (auth) => request('/api/admin/summary', { auth }),
    orders: (auth, status) => request(`/api/admin/orders${status ? `?status=${status}` : ''}`, { auth }),
    setOrderStatus: (auth, id, status) => request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, auth }),
    reservations: (auth, upcoming = true) => request(`/api/admin/reservations?upcoming=${upcoming}`, { auth }),
    setReservationStatus: (auth, id, status) => request(`/api/admin/reservations/${id}/status`, { method: 'PATCH', body: { status }, auth }),
    menu: (auth) => request('/api/admin/menu', { auth }),
    updateItem: (auth, id, patch) => request(`/api/admin/menu/items/${id}`, { method: 'PATCH', body: patch, auth }),
  },
};
