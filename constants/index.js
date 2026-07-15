import homeIcon from '../src/assets/icons/home.svg'
import aboutIcon from '../src/assets/icons/about.svg'
import eventsIcon from '../src/assets/icons/events.svg'
import contactIcon from '../src/assets/icons/contact.svg'
import brandDemo from '../src/assets/images/brand-1.webp'
import initiateCalibration from '../src/assets/images/event-backdrops/initiate-calibration.jpg'
import activateImmersion from '../src/assets/images/event-backdrops/activate-immersion.png'
import renderCreation from '../src/assets/images/event-backdrops/render-creation-workshop-backdrop.jpg'
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: homeIcon, sectionId: '#home' },
  { id: 'about', label: 'About', icon: aboutIcon, sectionId: '#about' },
  { id: 'events', label: 'Events', icon: eventsIcon, sectionId: '#events' },
  { id: 'contact', label: 'Contact', icon: contactIcon, sectionId: '#contact' },
];

const BRANDS = [
  { id: '1', name: 'FIREBIRD VR', photo: brandDemo, date: 'August 2025' },
  { id: '2', name: 'FOSTER HEALTH', photo: brandDemo, date: 'November 2025' },
  { id: '3', name: 'HAVEN & CO.', photo: '', date: 'July 2025' },
  { id: '4', name: 'SOLVRA SYSTEMS', photo: '', date: 'January 2026' },
  { id: '5', name: 'COOPLA', photo: '', date: 'March 2026' },
  { id: '6', name: 'UNIMARK', photo: '', date: 'July 2025' },
]

const EVENTS_CONDUCTED = [
  {
    id: 1,
    name: 'INITIATE CALIBRATION',
    thumbnail: initiateCalibration,
    tags: [
      'INTRODUCTORY EVENT',
      'BASIC XR EXPLANATION',
      'FUTURE OPPORTUNITIES IN XR',
    ],
  },
  {
    id: 2,
    name: 'ACTIVATE IMMERSION',
    thumbnail: activateImmersion,
    tags: [
      'EXPERT LECTURE',
      'INDUSTRY CONNECT',
      'CAREER ROADMAP FOR XR',
    ],
  },
  {
    id: 3,
    name: 'RENDER CREATION',
    thumbnail: renderCreation,
    tags: [
      'WORKSHOP 1',
      '3D GAME DEVELOPMENT USING UNITY',
      'HANDS-ON EXPERIENCE',
    ],
  },
]
const EVENTS_COMING_SOON = [
  {
    id: 1,
    name: 'INTRO EVENT',
    thumbnail: '',
    tags: [
      'INTRODUCTION TO NEW STUDENTS',
      'FUTURE XR KNOWLEDGE',
      'HANDS-ON EXPERIENCE',
    ],
  },
  {
    id: 2,
    name: 'BLENDER WORKSHOP',
    thumbnail: '',
    tags: [
      'WORKSHOP 2',
      'BLENDER DESIGN AND 3D DEVELOPMENT',
      'ENIVRONMENT AND ASSETS BUILDING',
      'DETAILS COMING SOON!',
    ],
  },
  {
    id: 3,
    name: 'RENDER CREATION 2',
    thumbnail: '',
    tags: [
      'WORKSHOP 3',
      'VR DEVELOPMENT',
      '3D GAME DEVELOPMENT',
      'DETIALS COMING SOON',
    ],
  },
  {
    id: 4,
    name: 'RE:INCARNATION 2026',
    thumbnail: '',
    tags: [
      'HACKATHON',
      'VR DEVELOPMENT',
      'RETRO 3D GAME DEVELOPMENT',
      'DETIALS COMING SOON',
    ],
  },
]

const BLOGS_HOME = [
  { id: 1, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide ' },
  { id: 2, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide ' },
  { id: 3, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide ' },
]

export {
  NAV_ITEMS,
  BRANDS,
  EVENTS_CONDUCTED,
  EVENTS_COMING_SOON,
  BLOGS_HOME
};