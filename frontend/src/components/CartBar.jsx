import { useCart } from '../lib/cart.jsx';
import { rupees } from '../lib/format.js';

/** Sticky reminder at the bottom of the menu while the cart has items. */
export default function CartBar() {
  const cart = useCart();
  if (!cart.count) return null;
  return (
    <div className="cartbar">
      <button className="cartbar__btn" onClick={() => cart.setOpen(true)}>
        <span>{cart.count} item{cart.count > 1 ? 's' : ''} · <strong>{rupees(cart.total)}</strong></span>
        <span>View order →</span>
      </button>
    </div>
  );
}
