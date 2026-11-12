import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { store } from '../lib/storage.js';
import { rupees, ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, formatDate, formatDateTime, formatTime12 } from '../lib/format.js';
import { Field, VegMark } from '../components/Bits.jsx';
import Logo from '../components/Logo.jsx';

const NEXT = { NEW: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'COMPLETED' };
const NEXT_LABEL = { NEW: 'Confirm', CONFIRMED: 'Start preparing', PREPARING: 'Mark ready', READY: 'Complete' };
const RES_STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED'];

function Login({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const token = btoa(`${u}:${p}`);
    try { await api.admin.me(token); onLogin(token); }
    catch (er) { setErr(er.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="container narrow page-pad">
      <form className="panel admin-login" onSubmit={submit}>
        <Logo />
        <h1>Staff login</h1>
        <Field label="Username" id="au"><input id="au" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} /></Field>
        <Field label="Password" id="ap"><input id="ap" type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} /></Field>
        {err && <p className="form-error" role="alert">{err}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

function Orders({ auth, onAuthFail }) {
  const [filter, setFilter] = useState('OPEN');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const all = await api.admin.orders(auth, filter === 'OPEN' || filter === 'ALL' ? '' : filter);
      setOrders(filter === 'OPEN' ? all.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)) : all);
      setError('');
    } catch (e) { if (e.status === 401) onAuthFail(); else setError(e.message); }
  }, [auth, filter, onAuthFail]);

  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const move = async (o, status) => {
    if (status === 'CANCELLED' && !window.confirm(`Cancel order ${o.code}?`)) return;
    try { await api.admin.setOrderStatus(auth, o.id, status); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="admin-bar">
        {['OPEN', 'NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'ALL'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>{f === 'OPEN' ? 'Open' : f === 'ALL' ? 'All' : ORDER_STATUS_LABEL[f]}</button>
        ))}
        <button className="btn btn--text" onClick={load}>Refresh</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {orders.length === 0 && <p className="muted">No orders here. This list refreshes every 20 seconds.</p>}
      <div className="admin-grid">
        {orders.map((o) => (
          <article key={o.id} className={`panel order-card order-card--${o.status.toLowerCase()}`}>
            <header>
              <div><strong>{o.code}</strong><span className="muted small"> · {formatDateTime(o.createdAt)}</span></div>
              <span className={`status status--${o.status.toLowerCase()}`}>{ORDER_STATUS_LABEL[o.status]}</span>
            </header>
            <p><strong>{o.customerName}</strong> · <a className="link" href={`tel:${o.phone}`}>{o.phone}</a> · {ORDER_TYPE_LABEL[o.orderType]}</p>
            {o.address && <p className="small">📍 {o.address}</p>}
            {o.notes && <p className="small note">“{o.notes}”</p>}
            <ul className="confirm__lines">
              {o.lines.map((l, i) => <li key={i}><span>{l.quantity} × {l.itemName}{l.optionLabel !== 'Regular' ? ` (${l.optionLabel})` : ''}</span><span>{rupees(l.lineTotal)}</span></li>)}
              <li className="confirm__total"><span>Total</span><span>{rupees(o.total)}</span></li>
            </ul>
            <div className="order-card__actions">
              {NEXT[o.status] && <button className="btn btn--primary btn--sm" onClick={() => move(o, NEXT[o.status])}>{NEXT_LABEL[o.status]}</button>}
              {!['COMPLETED', 'CANCELLED'].includes(o.status) && <button className="btn btn--text btn--sm" onClick={() => move(o, 'CANCELLED')}>Cancel</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Reservations({ auth, onAuthFail }) {
  const [list, setList] = useState([]);
  const [upcoming, setUpcoming] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setList(await api.admin.reservations(auth, upcoming)); setError(''); }
    catch (e) { if (e.status === 401) onAuthFail(); else setError(e.message); }
  }, [auth, upcoming, onAuthFail]);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (r, s) => { try { await api.admin.setReservationStatus(auth, r.id, s); load(); } catch (e) { setError(e.message); } };
  return (
    <div>
      <div className="admin-bar">
        <button className={`chip ${upcoming ? 'is-active' : ''}`} onClick={() => setUpcoming(true)}>Upcoming</button>
        <button className={`chip ${!upcoming ? 'is-active' : ''}`} onClick={() => setUpcoming(false)}>All</button>
        <button className="btn btn--text" onClick={load}>Refresh</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {list.length === 0 ? <p className="muted">No reservations.</p> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>When</th><th>Guest</th><th>Party</th><th>Notes</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}<br /><span className="muted">{formatTime12(r.time)}</span></td>
                  <td>{r.name}<br /><a className="link small" href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td>{r.guests}</td>
                  <td className="small">{r.notes || '—'}<br /><span className="muted">{r.code}</span></td>
                  <td>
                    <select value={r.status} onChange={(e) => setStatus(r, e.target.value)} aria-label={`Status for ${r.name}`}>
                      {RES_STATUSES.map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MenuEditor({ auth, onAuthFail }) {
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);
  const load = useCallback(async () => {
    try { setCats(await api.admin.menu(auth)); } catch (e) { if (e.status === 401) onAuthFail(); else setError(e.message); }
  }, [auth, onAuthFail]);
  useEffect(() => { load(); }, [load]);

  const patch = async (item, body) => {
    try {
      const updated = await api.admin.updateItem(auth, item.id, body);
      setCats((cs) => cs.map((c) => ({ ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) })));
      setSavedId(item.id); setTimeout(() => setSavedId(null), 1500);
    } catch (e) { setError(e.message); }
  };

  const savePrice = (item, idx, value) => {
    const price = value === '' ? null : Number(value);
    if (price != null && (Number.isNaN(price) || price < 0)) { setError('Enter a valid price'); return; }
    if (item.options[idx].price === price) return;
    patch(item, { options: item.options.map((o, i) => (i === idx ? { ...o, price } : o)) });
  };

  return (
    <div>
      <p className="muted small">Changes go live on the website straight away. Leave a price empty to show “Ask” (not orderable online).</p>
      {error && <p className="form-error">{error}</p>}
      {cats.map((c) => (
        <section key={c.id} className="admin-menu-cat">
          <h3>{c.name} <span className="muted small">{c.section}</span></h3>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>Dish</th><th>Prices (₹)</th><th>On menu</th><th>Chef's pick</th></tr></thead>
              <tbody>
                {c.items.map((i) => (
                  <tr key={i.id} className={!i.available ? 'is-off' : ''}>
                    <td><VegMark veg={i.veg} /> {i.name} {savedId === i.id && <span className="saved">Saved</span>}</td>
                    <td className="price-edit">
                      {i.options.map((o, idx) => (
                        <label key={`${i.id}-${o.label}-${o.price}`}>
                          <span>{o.label}</span>
                          <input type="number" min="0" defaultValue={o.price ?? ''} placeholder="Ask"
                            onBlur={(e) => savePrice(i, idx, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
                        </label>
                      ))}
                    </td>
                    <td><input type="checkbox" checked={i.available} onChange={(e) => patch(i, { available: e.target.checked })} aria-label={`${i.name} available`} /></td>
                    <td><input type="checkbox" checked={i.signature} onChange={(e) => patch(i, { signature: e.target.checked })} aria-label={`${i.name} chef's pick`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState(() => store.get('f3-admin', null, 'session'));
  const [tab, setTab] = useState('orders');
  const [summary, setSummary] = useState(null);

  const logout = useCallback(() => { store.remove('f3-admin', 'session'); setAuth(null); }, []);
  const login = (t) => { store.set('f3-admin', t, 'session'); setAuth(t); };

  useEffect(() => {
    if (!auth) return;
    const load = () => api.admin.summary(auth).then(setSummary).catch((e) => e.status === 401 && logout());
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [auth, logout, tab]);

  if (!auth) return <Login onLogin={login} />;

  return (
    <div className="container page-pad admin">
      <div className="admin__head">
        <h1>Kitchen dashboard</h1>
        <button className="btn btn--ghost btn--sm" onClick={logout}>Sign out</button>
      </div>
      {summary && (
        <div className="stats">
          <div className="stat"><span>Orders today</span><strong>{summary.ordersToday}</strong></div>
          <div className="stat"><span>Open orders</span><strong>{summary.openOrders}</strong></div>
          <div className="stat"><span>Sales today</span><strong>{rupees(summary.salesToday)}</strong></div>
          <div className="stat"><span>Upcoming tables</span><strong>{summary.upcomingReservations}</strong></div>
        </div>
      )}
      <div className="tabs" role="tablist">
        {[['orders', 'Orders'], ['reservations', 'Reservations'], ['menu', 'Menu & prices']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'orders' && <Orders auth={auth} onAuthFail={logout} />}
      {tab === 'reservations' && <Reservations auth={auth} onAuthFail={logout} />}
      {tab === 'menu' && <MenuEditor auth={auth} onAuthFail={logout} />}
    </div>
  );
}
