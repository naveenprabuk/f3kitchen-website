import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import fallback from '../data/menu-fallback.json';

const MenuCtx = createContext(null);

/**
 * Loads the live menu from the API. If the server can't be reached, the printed menu
 * (bundled as JSON) is shown so visitors can still browse, and ordering switches to WhatsApp.
 */
export function MenuProvider({ children }) {
  const [state, setState] = useState({ categories: fallback, live: false, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const categories = await api.menu();
      setState({ categories, live: true, loading: false, error: null });
    } catch (e) {
      setState({ categories: fallback, live: false, loading: false, error: e.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <MenuCtx.Provider value={{ ...state, reload: load }}>{children}</MenuCtx.Provider>;
}

export const useMenu = () => useContext(MenuCtx);

export const minPrice = (category) => {
  const prices = category.items.flatMap((i) => i.options.map((o) => o.price)).filter((p) => p != null);
  return prices.length ? Math.min(...prices) : null;
};
