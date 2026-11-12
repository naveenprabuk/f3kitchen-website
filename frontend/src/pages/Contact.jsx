import { RESTAURANT, MAPS_DIRECTIONS, MAPS_EMBED, MAPS_LINK, waLink } from '../data/restaurant.js';
import { Icon, Ornament } from '../components/Bits.jsx';

export default function Contact() {
  return (
    <div className="container page-pad">
      <div className="section-head">
        <Ornament />
        <h1>Visit F³ Kitchen</h1>
        <p className="muted">At JESEM Food Street, Ponnu Green Farms, on OMR between Navalur and Padur.</p>
      </div>
      <div className="contact">
        <div className="contact__cards">
          <div className="panel contact-card">
            <h3><Icon.pin /> Address</h3>
            <address>{RESTAURANT.addressLines.map((l) => <span key={l}>{l}<br /></span>)}</address>
            <p className="muted small">Plus code: <a className="link" href={MAPS_LINK} target="_blank" rel="noreferrer">{RESTAURANT.plusCode}</a></p>
            <a className="btn btn--primary" href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer">Get directions</a>
          </div>
          <div className="panel contact-card">
            <h3><Icon.phone /> Call or message</h3>
            <p className="contact-card__big"><a href={`tel:${RESTAURANT.phoneTel}`}>{RESTAURANT.phoneDisplay}</a></p>
            <div className="hero__cta">
              <a className="btn btn--ghost" href={`tel:${RESTAURANT.phoneTel}`}>Call now</a>
              <a className="btn btn--ghost" href={waLink('Hi F3 Kitchen!')} target="_blank" rel="noreferrer"><Icon.whatsapp /> WhatsApp</a>
            </div>
          </div>
          <div className="panel contact-card">
            <h3><Icon.clock /> Timings</h3>
            <p>{RESTAURANT.hours || `Call us for today's timings.`}</p>
            <p className="muted">Noodles: {RESTAURANT.noodlesHours}</p>
          </div>
        </div>
        <div className="map-frame map-frame--tall">
          <iframe title="Map to F3 Kitchen" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
