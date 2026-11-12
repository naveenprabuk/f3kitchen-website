import { Link } from '../lib/router.jsx';
import { Ornament } from '../components/Bits.jsx';

export default function NotFound() {
  return (
    <div className="container narrow page-pad">
      <div className="confirm">
        <Ornament />
        <h1>Page not found</h1>
        <p className="muted">That page isn't on our menu.</p>
        <div className="hero__cta hero__cta--center"><Link to="/" className="btn btn--primary">Back to home</Link></div>
      </div>
    </div>
  );
}
