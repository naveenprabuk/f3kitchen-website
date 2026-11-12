import { RouterProvider, useRouter } from './lib/router.jsx';
import { MenuProvider, useMenu } from './lib/menu.jsx';
import { CartProvider, useCartSync } from './lib/cart.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Order from './pages/Order.jsx';
import Track from './pages/Track.jsx';
import Reserve from './pages/Reserve.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import { useEffect } from 'react';

const ROUTES = { '/': Home, '/menu': Menu, '/order': Order, '/track': Track, '/reserve': Reserve, '/contact': Contact, '/admin': Admin };
const TITLES = { '/menu': 'Menu', '/order': 'Checkout', '/track': 'Track order', '/reserve': 'Book a table', '/contact': 'Visit us', '/admin': 'Staff' };

function Shell() {
  const { path } = useRouter();
  const { categories, live } = useMenu();
  useCartSync(categories, live);
  const Page = ROUTES[path.replace(/\/+$/, '') || '/'] || NotFound;

  useEffect(() => {
    const t = TITLES[path];
    document.title = t ? `${t} · F³ Kitchen` : 'F³ Kitchen · Grill, Shawarma & Noodles · Navalur, OMR';
  }, [path]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main"><Page /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <MenuProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </MenuProvider>
    </RouterProvider>
  );
}
