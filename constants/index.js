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
  { id: 1, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide', route: '/developing-games-with-unity-hub-beginners-guide', },
  { id: 2, title: 'DESIGN JOURNAL', date: 'MAY 30, 2026', desc: 'Crafting Visual Identity: From Blank Canvas to Brand Universe', route: '/crafting-visual-identity-from-blank-canvas-to-brand-universe' },
  { id: 3, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide', route: '/developing-games-with-unity-hub-beginners-guide', },
]

const testimonials = [
  {
    id: 1,
    quote:
      'Hyperspace does not manage events. They build experiences and their constant efforts are a testamant to that',
    name: 'ALLEN JOSEPH',
    position: 'PRESIDENT, HYPERSPACE XR SIG',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 2,
    quote:
      'Working with this team felt less like hiring vendors and more like adding a department. They just got it, fast',
    name: 'MARIA GONZALES',
    position: 'HEAD OF PRODUCT, NOVA LABS',
    image: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 3,
    quote:
      'Every deadline was hit, every detail was considered. This is the calibre of partner you build a roadmap around',
    name: 'DAVID CHEN',
    position: 'CTO, ORBITAL SYSTEMS',
    image: 'https://i.pravatar.cc/150?img=51',
  },
  {
    id: 4,
    quote:
      'They turned a vague brief into something our whole audience is still talking about months later',
    name: 'PRIYA NATARAJAN',
    position: 'CREATIVE DIRECTOR, LUMEN STUDIO',
    image: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 5,
    quote:
      'Rare to find a team this senior that still sweats the small stuff. Every pixel and every millisecond mattered to them',
    name: 'JAMES OKORO',
    position: 'FOUNDER, ATLAS COLLECTIVE',
    image: 'https://i.pravatar.cc/150?img=60',
  },
]

const FAQ_C = [
  {id: 1, question: 'What is HyperSpace?', answer: "HyperSpace is one of the only two XR Special Interest Group in Pune formed by students and XR enthusiats of the Modern Education Society's Wadia College of Engineering. It is formed by students for students"},
  {id: 2, question: 'What is the role of HyperSpace in the college community?', answer: "HYPERSPACE IS RESPONSIBLE FOR EXPANDING THE INFLUENCE OF XR DEVELOPMENT AND HELP STUDENTS UNDERSTAND THE CONCEPT OF FUTURISTIC TECHNOLOGY BY CONDUCTION WORKSHOPS AND LECTURE EVENTS."},
  {id: 3, question: 'How do we plan out our events?', answer: "Events are planned with rigorous decision making and continuous iteration after careful analysis and discussions within the team. The team approaches many faculty and students to get an idea of the interest and awareness of various frameworks in the community. The events are then planned and prepared after this through and systematic analysis. Hyperspace is always focused on planning events for students with them in primary focus."},
  {id: 4, question: 'What is our policy of accepting brand sponsorships?', answer: "Hyperspace is strictly an technical group. Hence, all our events are technical and focused on knowledge sharing. Therefore, Hyperspace only accepts techincal sponsors who can provide them with resources necessary for lectures and workshops with a few exceptions. Techincal sponsors are selected based on their contribution level to our progress and the event's availability. Hyperspace primarly focues on XR startups, founders and industries, but also includes 3D developement industries in their wide catalog."},
]

const BLOGS = [
  {
    id:1,
    tag: 'GAME DEVELOPMENT',
    date: 'MAY 22, 2026',
    title: 'Developing Games With Unity Hub: Beginner’s Guide',
    route: '/developing-games-with-unity-hub-beginners-guide',
  },
  {
    id:2,
    tag: 'Design Journal',
    date: 'MAY 30, 2026',
    title: 'Crafting Visual Identity: From Blank Canvas to Brand Universe',
    route: '/crafting-visual-identity-from-blank-canvas-to-brand-universe',
  },
  {
    id:3,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    route: '/managin-to-plan-events',
  },
  {
    id:4,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    route: '/managin-to-plan-events',
  },
  {
    id:5,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    route: '/managin-to-plan-events',
  },
  {
    id:6,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    route: '/managin-to-plan-events',
  },
  {
    id:7,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    route: '/managin-to-plan-events',
  },
  {
    id:8,
    tag: 'Design Journal',
    date: 'MAY 30, 2026',
    title: 'Crafting Visual Identity: From Blank Canvas to Brand Universe',
    route: '/crafting-visual-identity-from-blank-canvas-to-brand-universe',
  },
]

export {
  NAV_ITEMS,
  BRANDS,
  EVENTS_CONDUCTED,
  EVENTS_COMING_SOON,
  BLOGS_HOME,
  testimonials,
  FAQ_C,
  BLOGS
};