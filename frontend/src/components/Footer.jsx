import { Link } from '../lib/router.jsx';
import { RESTAURANT, MAPS_DIRECTIONS, waLink } from '../data/restaurant.js';
import Logo from './Logo.jsx';
import { Icon } from './Bits.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Logo size="md" />
          <p className="muted small">Starters, fried rice, noodles, Indian gravies, grill, shawarma, tandoori and breads at JESEM Food Street, OMR.</p>
        </div>
        <div>
          <h4>Find us</h4>
          <address>{RESTAURANT.addressLines.map((l) => <span key={l}>{l}<br /></span>)}</address>
          <a href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="link">Get directions →</a>
        </div>
        <div>
          <h4>Talk to us</h4>
          <p><a href={`tel:${RESTAURANT.phoneTel}`} className="link"><Icon.phone /> {RESTAURANT.phoneDisplay}</a></p>
          <p><a href={waLink()} target="_blank" rel="noreferrer" className="link"><Icon.whatsapp /> WhatsApp us</a></p>
          <p className="muted small">Noodles served {RESTAURANT.noodlesHours}</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <p><Link to="/menu" className="link">Full menu</Link></p>
          <p><Link to="/order" className="link">Order for pickup / delivery</Link></p>
          <p><Link to="/reserve" className="link">Book a table</Link></p>
          <p><Link to="/track" className="link">Track your order</Link></p>
        </div>
      </div>
      <div className="container site-footer__base">
        <span>© {new Date().getFullYear()} {RESTAURANT.plainName}. All prices in ₹, inclusive of GST.</span>
        <Link to="/admin" className="muted">Staff login</Link>
      </div>
    </footer>
  );
}
