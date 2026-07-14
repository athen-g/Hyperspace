import homeIcon from '../src/assets/photos/home.svg'
import aboutIcon from '../src/assets/photos/about.svg'
import eventsIcon from '../src/assets/photos/events.svg'
import contactIcon from '../src/assets/photos/contact.svg'
import brandDemo from '../src/assets/photos/brand-1.webp'
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: homeIcon, sectionId: '#home' },
  { id: 'about', label: 'About', icon: aboutIcon, sectionId: '#about' },
  { id: 'events', label: 'Events', icon: eventsIcon, sectionId: '#events' },
  { id: 'contact', label: 'Contact', icon: contactIcon, sectionId: '#contact' },
];

const BRANDS = [
  { id: '1', name: 'FIREBIRD VR', photo: { brandDemo }, date: 'August 2025' },
  { id: '2', name: 'FOSTER HEALTH', photo: { brandDemo }, date: 'November 2025' },
  { id: '3', name: 'HAVEN & CO.', photo: '', date: 'July 2025' },
  { id: '4', name: 'SOLVRA SYSTEMS', photo: '', date: 'January 2026' },
  { id: '5', name: 'COOPLA', photo: '', date: 'March 2026' },
  { id: '6', name: 'UNIMARK', photo: '', date: 'July 2025' },
]

export {
  NAV_ITEMS,
  BRANDS,
};