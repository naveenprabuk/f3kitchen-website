// All restaurant details live here — edit this file to update the whole site.
export const RESTAURANT = {
  name: 'F³ Kitchen',
  plainName: 'F3 Kitchen',
  phoneDisplay: '+91 97864 50022',
  phoneTel: '+919786450022',
  whatsapp: '919786450022',
  addressLines: [
    'Shop No. 6, JESEM Food Street',
    'Ponnu Green Farms, OMR',
    'Navalur / Padur, Chennai',
    'Tamil Nadu, India',
  ],
  plusCode: 'Q6WC+CP Padur, Tamil Nadu',
  // TODO: add your opening hours, e.g. 'Daily · 12:00 PM – 2:00 AM'. Leave null to show "call us".
  hours: null,
  noodlesHours: '5:00 PM – 2:00 AM',
};

const q = encodeURIComponent(RESTAURANT.plusCode);
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${q}`;
export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
export const MAPS_EMBED = `https://www.google.com/maps?q=${q}&z=16&output=embed`;
export const waLink = (text = '') =>
  `https://wa.me/${RESTAURANT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
