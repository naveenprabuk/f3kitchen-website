// Browser storage can be unavailable (private mode, embedded views) — never let it crash the page.
export const store = {
  get(key, fallback, area = 'local') {
    try {
      const raw = (area === 'session' ? sessionStorage : localStorage).getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value, area = 'local') {
    try { (area === 'session' ? sessionStorage : localStorage).setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  },
  remove(key, area = 'local') {
    try { (area === 'session' ? sessionStorage : localStorage).removeItem(key); } catch { /* ignore */ }
  },
};
