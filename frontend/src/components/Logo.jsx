import mark from '../assets/logo-mark.webp';

export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo--${size}`} aria-label="F3 Kitchen">
      <span className="logo__ring"><img src={mark} alt="" /></span>
      <span className="logo__word">KITCHEN</span>
    </span>
  );
}
