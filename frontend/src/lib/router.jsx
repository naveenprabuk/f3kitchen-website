// A tiny History-API router: enough for a handful of pages without extra dependencies.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RouterCtx = createContext({ path: '/', search: '', navigate: () => {} });

export function RouterProvider({ children }) {
  const read = () => ({ path: window.location.pathname || '/', search: window.location.search, hash: window.location.hash });
  const [loc, setLoc] = useState(read);

  useEffect(() => {
    const onPop = () => setLoc(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === window.location.pathname + window.location.search + window.location.hash) return;
    try {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
    } catch { /* sandboxed preview: keep in-memory routing */ }
    const url = new URL(to, window.location.origin);
    setLoc({ path: url.pathname, search: url.search, hash: url.hash });
    if (!url.hash) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, []);

  return <RouterCtx.Provider value={{ ...loc, navigate }}>{children}</RouterCtx.Provider>;
}

export const useRouter = () => useContext(RouterCtx);

export function useQuery() {
  const { search } = useRouter();
  return new URLSearchParams(search);
}

export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter();
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
