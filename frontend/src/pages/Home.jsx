import { Link } from '../lib/router.jsx';
import { useMenu, minPrice } from '../lib/menu.jsx';
import { useCart } from '../lib/cart.jsx';
import { rupees } from '../lib/format.js';
import { RESTAURANT, MAPS_DIRECTIONS, MAPS_EMBED } from '../data/restaurant.js';
import { Icon, Ornament, VegMark } from '../components/Bits.jsx';
import shawarma from '../assets/shawarma.webp';
import grill from '../assets/grill.webp';
import soup from '../assets/soup.webp';
import gravy from '../assets/gravy.webp';
import friedChicken from '../assets/fried-chicken.webp';
import tomatoes from '../assets/tomatoes.webp';
import chilli from '../assets/chilli.webp';
import pepper from '../assets/pepper.webp';

const SECTIONS = [
  { title: 'Soup & Starters', blurb: 'Chicken 65, lollipop, dragon chicken, Manchurian and chilli dishes, plus four soups.', img: soup, slugs: ['soup', 'non-veg-starters', 'veg-starters'] },
  { title: 'Rice, Noodles & Indian Gravy', blurb: 'Wok-tossed fried rice and noodles, with butter chicken, Chettinad and paneer gravies.', img: gravy, slugs: ['rice', 'noodles', 'indian-gravy'] },
  { title: 'Grill, Shawarma & Bread', blurb: 'Classic and peri peri grill, shawarma rolls and plates, tandoori and fresh breads.', img: shawarma, slugs: ['grill', 'shawarma-roll', 'shawarma-plate', 'tandoori', 'bread'] },
];

// A few dishes to get people started; staff can mark their own picks as "signature" in the admin.
const STARTER_PICKS = ['Chicken 65 (6 pcs)', 'Peri Peri Grill', 'Butter Chicken', 'Peri Peri Shawarma Roll', 'Burnt Garlic Rice', 'Paneer Tikka (6 pcs)'];

export default function Home() {
  const { categories } = useMenu();
  const cart = useCart();
  const all = categories.flatMap((c) => c.items.map((i) => ({ ...i, category: c })));
  const signature = all.filter((i) => i.signature && i.available);
  const picks = (signature.length ? signature : STARTER_PICKS.map((n) => all.find((i) => i.name === n)).filter(Boolean)).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">JESEM Food Street · OMR, Navalur</p>
            <h1>Grill, shawarma <span className="amp">&amp;</span> noodles till&nbsp;2&nbsp;AM</h1>
            <p className="hero__lede">
              Wok-fired starters, fried rice, Indian gravies, tandoori and fresh breads from F³ Kitchen. Order ahead for pickup or delivery, or come in and eat with us.
            </p>
            <div className="hero__cta">
              <Link to="/menu" className="btn btn--primary">Order from the menu</Link>
              <a href={`tel:${RESTAURANT.phoneTel}`} className="btn btn--ghost"><Icon.phone /> Call {RESTAURANT.phoneDisplay}</a>
            </div>
            <ul className="hero__facts">
              <li><Icon.pin /> Shop No. 6, JESEM Food Street</li>
              <li><Icon.clock /> Noodles {RESTAURANT.noodlesHours}</li>
            </ul>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="hero__plate hero__plate--main"><img src={shawarma} alt="" /></div>
            <div className="hero__plate hero__plate--grill"><img src={grill} alt="" /></div>
            <div className="hero__plate hero__plate--soup"><img src={soup} alt="" /></div>
            <img className="garnish garnish--tomato" src={tomatoes} alt="" />
            <img className="garnish garnish--chilli" src={chilli} alt="" />
            <img className="garnish garnish--pepper" src={pepper} alt="" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <Ornament />
            <h2>Three pages, eighty-plus dishes</h2>
            <p className="muted">The same menu as our printed card, with today's prices.</p>
          </div>
          <div className="section-cards">
            {SECTIONS.map((s) => {
              const cats = categories.filter((c) => s.slugs.includes(c.slug));
              const from = Math.min(...cats.map(minPrice).filter((p) => p != null));
              const count = cats.reduce((n, c) => n + c.items.length, 0);
              return (
                <Link key={s.title} to={`/menu#${s.slugs[0]}`} className="section-card">
                  <div className="section-card__img"><img src={s.img} alt="" loading="lazy" /></div>
                  <div className="section-card__body">
                    <h3>{s.title}</h3>
                    <p>{s.blurb}</p>
                    <span className="section-card__meta">{count} dishes · from {rupees(Number.isFinite(from) ? from : null)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--panel">
        <div className="container picks">
          <div className="picks__intro">
            <p className="eyebrow">{signature.length ? "Chef's picks" : 'Start here'}</p>
            <h2>A few to start with</h2>
            <p className="muted">Tap a price to add it to your order. You can change quantities before you check out.</p>
            <img className="picks__img" src={friedChicken} alt="" loading="lazy" />
          </div>
          <ul className="picks__list">
            {picks.map((i) => (
              <li key={i.id} className="pick">
                <div className="pick__name"><VegMark veg={i.veg} /> <span>{i.name}</span></div>
                <span className="pick__cat">{i.category.name}</span>
                <div className="pick__prices">
                  {i.options.filter((o) => o.price != null).map((o) => (
                    <button key={o.label} className="price-chip" onClick={() => cart.add(i, o.label, o.price)} disabled={!i.available}>
                      {o.label !== 'Regular' && <span>{o.label}</span>} {rupees(o.price)} <b>+</b>
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container ways">
          <div className="way">
            <h3>Pickup</h3>
            <p>Order online, we'll have it packed when you arrive at JESEM Food Street.</p>
            <Link to="/order" className="link">Start an order →</Link>
          </div>
          <div className="way">
            <h3>Delivery</h3>
            <p>Send us your address with the order and we'll call to confirm the delivery.</p>
            <Link to="/order" className="link">Order for delivery →</Link>
          </div>
          <div className="way">
            <h3>Dine in</h3>
            <p>Coming with family or friends? Book a table and we'll keep it ready.</p>
            <Link to="/reserve" className="link">Book a table →</Link>
          </div>
        </div>
      </section>

      <section className="section section--visit">
        <div className="container visit">
          <div className="visit__info">
            <p className="eyebrow">Visit us</p>
            <h2>On OMR, at JESEM Food Street</h2>
            <address className="visit__address">{RESTAURANT.addressLines.map((l) => <span key={l}>{l}<br /></span>)}</address>
            <p className="muted">Plus code: {RESTAURANT.plusCode}</p>
            <p className="muted">{RESTAURANT.hours || `Call ${RESTAURANT.phoneDisplay} for today's timings`}</p>
            <div className="hero__cta">
              <a className="btn btn--primary" href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer"><Icon.pin /> Directions</a>
              <a className="btn btn--ghost" href={`tel:${RESTAURANT.phoneTel}`}><Icon.phone /> Call</a>
            </div>
          </div>
          <div className="map-frame">
            <iframe title="F3 Kitchen on Google Maps" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    </>
  );
}
