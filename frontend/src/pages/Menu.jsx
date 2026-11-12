import { useEffect, useMemo, useState } from 'react';
import { useMenu } from '../lib/menu.jsx';
import { useCart } from '../lib/cart.jsx';
import { useRouter } from '../lib/router.jsx';
import { rupees } from '../lib/format.js';
import { RESTAURANT } from '../data/restaurant.js';
import { Icon, Ornament, Stepper, VegMark } from '../components/Bits.jsx';
import CartBar from '../components/CartBar.jsx';

function ItemRow({ item, closed }) {
  const cart = useCart();
  const priced = item.options.filter((o) => o.price != null);
  const multi = item.options.length > 1;
  const unavailable = !item.available || closed;

  return (
    <li className={`item ${unavailable ? 'item--off' : ''}`}>
      <div className="item__name">
        <VegMark veg={item.veg} />
        <span>{item.name}</span>
        {item.signature && <span className="tag">Chef's pick</span>}
        {!item.available && <span className="tag tag--muted">Sold out</span>}
      </div>
      {!multi && <span className="item__leader" aria-hidden="true" />}
      <div className={`item__prices ${multi ? 'item__prices--multi' : ''}`}>
        {item.options.map((o) => {
          const qty = cart.qtyOf(item.id, o.label);
          if (o.price == null) {
            return (
              <span key={o.label} className="price-ask" title="Price on request">
                {multi && <small>{o.label}</small>}
                <a href={`tel:${RESTAURANT.phoneTel}`}>Ask</a>
              </span>
            );
          }
          return qty > 0 && !unavailable ? (
            <span key={o.label} className="price-qty">
              {multi && <small>{o.label}</small>}
              <Stepper value={qty} label={`${item.name} ${o.label}`} onChange={(q) => cart.setQty(item, o.label, o.price, q)} />
            </span>
          ) : (
            <button key={o.label} className="price-chip" disabled={unavailable} onClick={() => cart.add(item, o.label, o.price)}
              aria-label={`Add ${item.name}${multi ? ` ${o.label}` : ''}, ${rupees(o.price)}`}>
              {multi && <small>{o.label}</small>}
              {rupees(o.price)} <b aria-hidden="true">+</b>
            </button>
          );
        })}
        {priced.length === 0 && null}
      </div>
    </li>
  );
}

export default function Menu() {
  const { categories, live, loading, error, reload } = useMenu();
  const { hash } = useRouter();
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [active, setActive] = useState(categories[0]?.slug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({ ...c, items: c.items.filter((i) => (!vegOnly || i.veg) && (!q || i.name.toLowerCase().includes(q))) }))
      .filter((c) => c.items.length);
  }, [categories, query, vegOnly]);

  const sections = useMemo(() => {
    const map = new Map();
    filtered.forEach((c) => {
      const key = c.section || 'More';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return [...map.entries()];
  }, [filtered]);

  // jump to #category from links like /menu#grill
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [hash]);

  // highlight the category in view
  useEffect(() => {
    const els = filtered.map((c) => document.getElementById(c.slug)).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-140px 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const jump = (slug) => {
    setActive(slug);
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="menu-page">
      <div className="page-hero page-hero--compact">
        <div className="container">
          <Ornament />
          <h1>Our menu</h1>
          <p className="muted">All prices in rupees, inclusive of GST. <VegMark veg /> veg · <VegMark veg={false} /> non-veg</p>
          {!loading && !live && (
            <p className="notice">
              Showing our printed menu — online ordering is offline right now. You can still build an order and send it on WhatsApp.
              {error && <button className="btn btn--text" onClick={reload}>Try again</button>}
            </p>
          )}
        </div>
      </div>

      <div className="menu-tools">
        <div className="container menu-tools__inner">
          <label className="search">
            <Icon.search />
            <input type="search" placeholder="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search dishes" />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
            <span className="toggle__track"><span /></span>
            <span>Veg<span className="toggle__label-long"> only</span></span>
          </label>
        </div>
        <nav className="container cat-chips" aria-label="Menu categories">
          {filtered.map((c) => (
            <button key={c.slug} className={`chip ${active === c.slug ? 'is-active' : ''}`} onClick={() => jump(c.slug)}>{c.name}</button>
          ))}
        </nav>
      </div>

      <div className="container menu-body">
        {sections.length === 0 && (
          <div className="empty">
            <p>No dishes match “{query}”{vegOnly ? ' in veg' : ''}.</p>
            <button className="btn btn--ghost" onClick={() => { setQuery(''); setVegOnly(false); }}>Clear filters</button>
          </div>
        )}
        {sections.map(([section, cats]) => (
          <section key={section} className="menu-section">
            <h2 className="menu-section__title">{section}</h2>
            <div className="menu-section__grid">
              {cats.map((c) => {
                const closed = c.servingNow === false;
                return (
                  <article key={c.slug} id={c.slug} className="menu-card">
                    <header className="menu-card__head">
                      <h3>{c.name}</h3>
                      {c.note && <p className={`menu-card__note ${closed ? 'is-closed' : ''}`}><Icon.clock /> {c.note}{closed ? ' · not serving now' : ''}</p>}
                      {c.items.some((i) => i.options.length > 1) && (
                        <div className="menu-card__cols" aria-hidden="true">
                          {[...new Set(c.items.flatMap((i) => i.options.map((o) => o.label)))].join(' · ')}
                        </div>
                      )}
                    </header>
                    <ul className="items">
                      {c.items.map((i) => <ItemRow key={i.id} item={i} closed={closed} />)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        <p className="muted small menu-foot">Dishes marked “Ask” are priced at the counter — call {RESTAURANT.phoneDisplay}.</p>
      </div>
      <CartBar />
    </div>
  );
}
