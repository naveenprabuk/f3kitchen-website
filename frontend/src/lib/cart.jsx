import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { store } from './storage.js';

const CartCtx = createContext(null);
const KEY = 'f3-cart-v1';
const keyOf = (itemId, option) => `${itemId}::${option}`;

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => store.get(KEY, []));
  const [open, setOpen] = useState(false);

  useEffect(() => { store.set(KEY, lines); }, [lines]);

  const api = useMemo(() => {
    const qtyOf = (itemId, option) => lines.find((l) => keyOf(l.itemId, l.option) === keyOf(itemId, option))?.quantity || 0;
    const setQty = (item, option, price, quantity) => {
      setLines((prev) => {
        const k = keyOf(item.id, option);
        const exists = prev.find((l) => keyOf(l.itemId, l.option) === k);
        if (quantity <= 0) return prev.filter((l) => keyOf(l.itemId, l.option) !== k);
        if (exists) return prev.map((l) => (keyOf(l.itemId, l.option) === k ? { ...l, quantity: Math.min(quantity, 50) } : l));
        return [...prev, { itemId: item.id, name: item.name, veg: item.veg, option, price, quantity }];
      });
    };
    const add = (item, option, price) => setQty(item, option, price, qtyOf(item.id, option) + 1);
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const total = lines.reduce((s, l) => s + l.quantity * l.price, 0);
    return { lines, count, total, qtyOf, setQty, add, clear: () => setLines([]), replace: setLines, open, setOpen };
  }, [lines, open]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);

/** Keep cart prices/names in sync with the live menu; drop dishes that disappeared. */
export function useCartSync(categories, live) {
  const cart = useCart();
  useEffect(() => {
    if (!live || !cart.lines.length) return;
    const byId = new Map(categories.flatMap((c) => c.items).map((i) => [i.id, i]));
    let changed = false;
    const next = cart.lines.flatMap((l) => {
      const item = byId.get(l.itemId);
      const opt = item?.options.find((o) => o.label === l.option);
      if (!item || !item.available || !opt || opt.price == null) { changed = true; return []; }
      if (opt.price !== l.price || item.name !== l.name) { changed = true; return [{ ...l, price: opt.price, name: item.name }]; }
      return [l];
    });
    if (changed) cart.replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, live]);
}

export const cartToWhatsApp = (lines, total, extra = '') => {
  const body = lines
    .map((l) => `• ${l.quantity} × ${l.name}${l.option !== 'Regular' ? ` (${l.option})` : ''} — ₹${l.quantity * l.price}`)
    .join('\n');
  return `Hi F3 Kitchen, I'd like to order:\n${body}\nTotal: ₹${total}${extra ? `\n${extra}` : ''}`;
};
