import { useEffect, useRef } from 'react';
import { useCart } from '../lib/cart.jsx';
import { useRouter } from '../lib/router.jsx';
import { rupees } from '../lib/format.js';
import { Icon, Stepper, VegMark } from './Bits.jsx';

export default function CartDrawer() {
  const cart = useCart();
  const { navigate, path } = useRouter();
  const panel = useRef(null);

  useEffect(() => {
    if (!cart.open) return;
    const onKey = (e) => e.key === 'Escape' && cart.setOpen(false);
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [cart.open]);

  useEffect(() => { cart.setOpen(false); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`drawer ${cart.open ? 'is-open' : ''}`} aria-hidden={!cart.open}>
      <div className="drawer__scrim" onClick={() => cart.setOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your order" tabIndex={-1} ref={panel}>
        <div className="drawer__head">
          <h2>Your order</h2>
          <button className="icon-btn" onClick={() => cart.setOpen(false)} aria-label="Close cart"><Icon.close /></button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Nothing here yet.</p>
            <button className="btn btn--ghost" onClick={() => navigate('/menu')}>Browse the menu</button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {cart.lines.map((l) => (
                <li key={`${l.itemId}-${l.option}`} className="cart-line">
                  <VegMark veg={l.veg} />
                  <div className="cart-line__name">
                    {l.name}
                    {l.option !== 'Regular' && <span className="cart-line__opt">{l.option}</span>}
                  </div>
                  <Stepper value={l.quantity} label={l.name} onChange={(q) => cart.setQty({ id: l.itemId, name: l.name, veg: l.veg }, l.option, l.price, q)} />
                  <div className="cart-line__price">{rupees(l.price * l.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="drawer__foot">
              <div className="total-row"><span>Total <small className="muted">incl. GST</small></span><strong>{rupees(cart.total)}</strong></div>
              <button className="btn btn--primary btn--block" onClick={() => navigate('/order')}>Checkout</button>
              <button className="btn btn--text" onClick={cart.clear}>Clear cart</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
