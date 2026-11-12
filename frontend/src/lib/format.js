export const rupees = (n) => (n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`);

export const ORDER_TYPE_LABEL = { PICKUP: 'Pickup', DELIVERY: 'Delivery', DINE_IN: 'Dine-in' };

export const ORDER_STATUS_LABEL = {
  NEW: 'Received',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Being prepared',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const formatTime12 = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export const isValidPhone = (p) => /^(\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}$/.test(String(p || "").trim());
