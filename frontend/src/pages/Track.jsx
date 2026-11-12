import { useEffect, useState } from 'react';
import { useQuery } from '../lib/router.jsx';
import { api } from '../lib/api.js';
import { store } from '../lib/storage.js';
import { rupees, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, formatDateTime } from '../lib/format.js';
import { RESTAURANT } from '../data/restaurant.js';
import { Field, Icon, Ornament } from '../components/Bits.jsx';

const STEPS = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export default function Track() {
  const q = useQuery();
  const last = store.get('f3-last-order', {});
  const [code, setCode] = useState(q.get('code') || last.code || '');
  const [phone, setPhone] = useState(last.phone || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e?.preventDefault();
    if (!code.trim() || !phone.trim()) { setError('Enter your order code and phone number'); return; }
    setLoading(true); setError('');
    try { setOrder(await api.trackOrder(code.trim(), phone.trim())); }
    catch (err) { setError(err.message); setOrder(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (code && phone) lookup(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!order || ['COMPLETED', 'CANCELLED'].includes(order.status)) return;
    const t = setInterval(() => api.trackOrder(order.code, phone).then(setOrder).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, [order, phone]);

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="container narrow page-pad">
      <div className="section-head">
        <Ornament />
        <h1>Track your order</h1>
        <p className="muted">Use the code you got after ordering, like F3-301026-K7QM.</p>
      </div>
      <form className="track-form" onSubmit={lookup}>
        <Field label="Order code" id="code"><input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="F3-…" /></Field>
        <Field label="Mobile number" id="tphone"><input id="tphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <button className="btn btn--primary" disabled={loading}>{loading ? 'Checking…' : 'Check status'}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {order && (
        <div className="track-card">
          <div className="track-card__head">
            <div><span className="eyebrow">{ORDER_TYPE_LABEL[order.orderType]}</span><h2>{order.code}</h2></div>
            <span className={`status status--${order.status.toLowerCase()}`}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
          {order.status !== 'CANCELLED' ? (
            <ol className="steps">
              {STEPS.map((s, i) => <li key={s} className={i <= stepIndex ? 'is-done' : ''}>{ORDER_STATUS_LABEL[s]}</li>)}
            </ol>
          ) : (
            <p className="notice">This order was cancelled. Please call {RESTAURANT.phoneDisplay} if that's unexpected.</p>
          )}
          <ul className="confirm__lines">
            {order.lines.map((l, i) => <li key={i}><span>{l.quantity} × {l.itemName}{l.optionLabel !== 'Regular' ? ` (${l.optionLabel})` : ''}</span><span>{rupees(l.lineTotal)}</span></li>)}
            <li className="confirm__total"><span>Total</span><span>{rupees(order.total)}</span></li>
          </ul>
          <p className="muted small">Placed {formatDateTime(order.createdAt)} · updated {formatDateTime(order.updatedAt)} · refreshes automatically</p>
          <a className="link" href={`tel:${RESTAURANT.phoneTel}`}><Icon.phone /> Questions? Call {RESTAURANT.phoneDisplay}</a>
        </div>
      )}
    </div>
  );
}
