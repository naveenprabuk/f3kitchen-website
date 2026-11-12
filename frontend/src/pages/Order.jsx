import { useState } from 'react';
import { useCart, cartToWhatsApp } from '../lib/cart.jsx';
import { useMenu } from '../lib/menu.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { api } from '../lib/api.js';
import { store } from '../lib/storage.js';
import { rupees, ORDER_TYPE_LABEL, ORDER_STATUS_LABEL, isValidPhone } from '../lib/format.js';
import { RESTAURANT, waLink } from '../data/restaurant.js';
import { Field, Icon, Ornament, Stepper, VegMark } from '../components/Bits.jsx';

const TYPES = [
  { value: 'PICKUP', title: 'Pickup', text: 'Collect from the counter' },
  { value: 'DELIVERY', title: 'Delivery', text: "We'll call to confirm" },
  { value: 'DINE_IN', title: 'Dine-in', text: 'Ready when you sit down' },
];

export default function Order() {
  const cart = useCart();
  const { live } = useMenu();
  const { navigate } = useRouter();
  const saved = store.get('f3-customer', {});
  const [form, setForm] = useState({ customerName: saved.customerName || '', phone: saved.phone || '', orderType: 'PICKUP', address: saved.address || '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [placed, setPlaced] = useState(null);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };

  const validate = () => {
    const er = {};
    if (!form.customerName.trim()) er.customerName = 'Please enter your name';
    if (!isValidPhone(form.phone)) er.phone = 'Please enter a valid 10-digit mobile number';
    if (form.orderType === 'DELIVERY' && !form.address.trim()) er.address = 'Please enter a delivery address';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const extraForWhatsApp = () => [
    `Name: ${form.customerName}`,
    `Phone: ${form.phone}`,
    `Type: ${ORDER_TYPE_LABEL[form.orderType]}`,
    form.orderType === 'DELIVERY' ? `Address: ${form.address}` : '',
    form.notes ? `Notes: ${form.notes}` : '',
  ].filter(Boolean).join('\n');

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    store.set('f3-customer', { customerName: form.customerName, phone: form.phone, address: form.address });
    if (!live) {
      window.open(waLink(cartToWhatsApp(cart.lines, cart.total, extraForWhatsApp())), '_blank', 'noopener');
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.placeOrder({
        ...form,
        items: cart.lines.map((l) => ({ itemId: l.itemId, option: l.option, quantity: l.quantity })),
      });
      store.set('f3-last-order', { code: order.code, phone: form.phone });
      setPlaced(order);
      cart.clear();
    } catch (err) {
      setServerError(err.message);
      if (err.errors) setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="container narrow page-pad">
        <div className="confirm">
          <Ornament />
          <p className="eyebrow">Order received</p>
          <h1 className="confirm__code">{placed.code}</h1>
          <p>Thank you, {form.customerName.split(' ')[0]}. We've got your {ORDER_TYPE_LABEL[placed.orderType].toLowerCase()} order for <strong>{rupees(placed.total)}</strong>.</p>
          <p className="muted">Status: {ORDER_STATUS_LABEL[placed.status]}. We may call {form.phone} to confirm.</p>
          <ul className="confirm__lines">
            {placed.lines.map((l, i) => (
              <li key={i}><span>{l.quantity} × {l.itemName}{l.optionLabel !== 'Regular' ? ` (${l.optionLabel})` : ''}</span><span>{rupees(l.lineTotal)}</span></li>
            ))}
          </ul>
          <div className="hero__cta hero__cta--center">
            <Link className="btn btn--primary" to={`/track?code=${placed.code}`}>Track this order</Link>
            <a className="btn btn--ghost" href={`tel:${RESTAURANT.phoneTel}`}><Icon.phone /> Call the kitchen</a>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.lines.length) {
    return (
      <div className="container narrow page-pad">
        <div className="confirm">
          <Ornament />
          <h1>Your cart is empty</h1>
          <p className="muted">Pick a few dishes from the menu and come back here to check out.</p>
          <div className="hero__cta hero__cta--center"><Link className="btn btn--primary" to="/menu">Open the menu</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-pad checkout">
      <div className="checkout__form">
        <h1>Checkout</h1>
        {!live && <p className="notice">Online ordering is offline right now — your order will open in WhatsApp, ready to send.</p>}
        <form onSubmit={submit} noValidate>
          <fieldset className="type-picker">
            <legend className="field__label">How would you like it?</legend>
            {TYPES.map((t) => (
              <label key={t.value} className={`type-option ${form.orderType === t.value ? 'is-active' : ''}`}>
                <input type="radio" name="orderType" value={t.value} checked={form.orderType === t.value} onChange={set('orderType')} />
                <strong>{t.title}</strong>
                <span>{t.text}</span>
              </label>
            ))}
          </fieldset>
          <div className="form-grid">
            <Field label="Your name" id="name" error={errors.customerName}>
              <input id="name" autoComplete="name" value={form.customerName} onChange={set('customerName')} />
            </Field>
            <Field label="Mobile number" id="phone" error={errors.phone} hint="We'll call this number if we need to confirm">
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={set('phone')} />
            </Field>
          </div>
          {form.orderType === 'DELIVERY' && (
            <Field label="Delivery address" id="address" error={errors.address} hint="Flat / street / landmark near OMR, Navalur or Padur">
              <textarea id="address" rows={3} autoComplete="street-address" value={form.address} onChange={set('address')} />
            </Field>
          )}
          <Field label="Notes for the kitchen (optional)" id="notes" error={errors.notes} hint="Spice level, no onion, extra mayo…">
            <textarea id="notes" rows={2} value={form.notes} onChange={set('notes')} />
          </Field>
          <p className="muted small">Pay when you collect, at the table, or on delivery.</p>
          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          <div className="checkout__actions">
            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : live ? `Place order · ${rupees(cart.total)}` : 'Send order on WhatsApp'}
            </button>
            {live && (
              <a className="btn btn--ghost" target="_blank" rel="noreferrer"
                href={waLink(cartToWhatsApp(cart.lines, cart.total, extraForWhatsApp()))}>
                <Icon.whatsapp /> Or send on WhatsApp
              </a>
            )}
          </div>
        </form>
      </div>
      <aside className="checkout__summary">
        <h2>Your order</h2>
        <ul className="cart-lines">
          {cart.lines.map((l) => (
            <li key={`${l.itemId}-${l.option}`} className="cart-line">
              <VegMark veg={l.veg} />
              <div className="cart-line__name">{l.name}{l.option !== 'Regular' && <span className="cart-line__opt">{l.option}</span>}</div>
              <Stepper value={l.quantity} label={l.name} onChange={(q) => cart.setQty({ id: l.itemId, name: l.name, veg: l.veg }, l.option, l.price, q)} />
              <div className="cart-line__price">{rupees(l.price * l.quantity)}</div>
            </li>
          ))}
        </ul>
        <div className="total-row"><span>Total <small className="muted">incl. GST</small></span><strong>{rupees(cart.total)}</strong></div>
        <button className="btn btn--text" onClick={() => navigate('/menu')}>+ Add more dishes</button>
      </aside>
    </div>
  );
}
