import { useState } from 'react';
import { api } from '../lib/api.js';
import { store } from '../lib/storage.js';
import { formatDate, formatTime12, isValidPhone } from '../lib/format.js';
import { RESTAURANT, waLink } from '../data/restaurant.js';
import { Field, Icon, Ornament } from '../components/Bits.jsx';
import tandoori from '../assets/curry.webp';

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function Reserve() {
  const saved = store.get('f3-customer', {});
  const [form, setForm] = useState({ name: saved.customerName || '', phone: saved.phone || '', guests: 2, date: todayISO(), time: '20:00', notes: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (!isValidPhone(form.phone)) er.phone = 'Please enter a valid 10-digit mobile number';
    if (!form.date) er.date = 'Choose a date';
    if (!form.time) er.time = 'Choose a time';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const r = await api.reserve({ ...form, guests: Number(form.guests) });
      store.set('f3-customer', { ...saved, customerName: form.name, phone: form.phone });
      setDone(r);
    } catch (err) {
      setServerError(err.status === 0
        ? `We couldn't reach our booking system. Please call ${RESTAURANT.phoneDisplay} or message us on WhatsApp.`
        : err.message);
      if (err.errors) setErrors(err.errors);
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="container narrow page-pad">
        <div className="confirm">
          <Ornament />
          <p className="eyebrow">Request received</p>
          <h1 className="confirm__code">{done.code}</h1>
          <p>Table for <strong>{done.guests}</strong> on <strong>{formatDate(done.date)}</strong> at <strong>{formatTime12(done.time)}</strong>.</p>
          <p className="muted">We'll call {form.phone} to confirm your table.</p>
        </div>
      </div>
    );
  }

  const waText = `Hi F3 Kitchen, I'd like to book a table for ${form.guests} on ${form.date} at ${form.time}. Name: ${form.name}`;

  return (
    <div className="container page-pad reserve">
      <div className="reserve__intro">
        <p className="eyebrow">Dine in</p>
        <h1>Book a table</h1>
        <p className="muted">Tell us when you're coming and how many of you there are. We'll call to confirm.</p>
        <img src={tandoori} alt="" aria-hidden="true" className="reserve__img" />
      </div>
      <form className="reserve__form panel" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Name" id="rname" error={errors.name}><input id="rname" autoComplete="name" value={form.name} onChange={set('name')} /></Field>
          <Field label="Mobile number" id="rphone" error={errors.phone}><input id="rphone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} /></Field>
        </div>
        <div className="form-grid form-grid--3">
          <Field label="Guests" id="guests" error={errors.guests}>
            <select id="guests" value={form.guests} onChange={set('guests')}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
            </select>
          </Field>
          <Field label="Date" id="date" error={errors.date}><input id="date" type="date" min={todayISO()} value={form.date} onChange={set('date')} /></Field>
          <Field label="Time" id="time" error={errors.time}><input id="time" type="time" step="900" value={form.time} onChange={set('time')} /></Field>
        </div>
        <Field label="Anything we should know? (optional)" id="rnotes" hint="Birthday, high chair, outdoor seating…">
          <textarea id="rnotes" rows={2} value={form.notes} onChange={set('notes')} />
        </Field>
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        <div className="checkout__actions">
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Sending…' : 'Request booking'}</button>
          <a className="btn btn--ghost" href={waLink(waText)} target="_blank" rel="noreferrer"><Icon.whatsapp /> Book on WhatsApp</a>
        </div>
        <p className="muted small">For more than 20 guests, call {RESTAURANT.phoneDisplay}.</p>
      </form>
    </div>
  );
}
