import { useEffect, useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { useCart } from '../lib/cart.jsx';
import { RESTAURANT } from '../data/restaurant.js';
import Logo from './Logo.jsx';
import { Icon } from './Bits.jsx';

const NAV = [
  { to: '/menu', label: 'Menu' },
  { to: '/order', label: 'Order' },
  { to: '/reserve', label: 'Book a table' },
  { to: '/track', label: 'Track order' },
  { to: '/contact', label: 'Visit' },
];

export default function Header() {
  const { path } = useRouter();
  const cart = useCart();
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setNavOpen(false), [path]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="F3 Kitchen home"><Logo size="sm" /></Link>
        <nav className={`site-nav ${navOpen ? 'is-open' : ''}`} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={path === n.to ? 'is-active' : ''} aria-current={path === n.to ? 'page' : undefined}>{n.label}</Link>
          ))}
          <a className="site-nav__call" href={`tel:${RESTAURANT.phoneTel}`}><Icon.phone /> {RESTAURANT.phoneDisplay}</a>
        </nav>
        <div className="site-header__actions">
          <button className="cart-btn" onClick={() => cart.setOpen(true)} aria-label={`Open cart, ${cart.count} items`}>
            <Icon.bag />
            {cart.count > 0 && <span className="cart-btn__count">{cart.count}</span>}
          </button>
          <button className="nav-toggle" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen} aria-label="Menu">
            {navOpen ? <Icon.close /> : <Icon.menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
