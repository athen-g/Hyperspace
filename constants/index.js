import homeIcon from '../src/assets/icons/home.svg'
import aboutIcon from '../src/assets/icons/about.svg'
import eventsIcon from '../src/assets/icons/events.svg'
import contactIcon from '../src/assets/icons/contact.svg'
import brandDemo from '../src/assets/images/brand-1.webp'
import initiateCalibration from '../src/assets/images/event-backdrops/initiate-calibration.jpg'
import activateImmersion from '../src/assets/images/event-backdrops/activate-immersion.png'
import renderCreation from '../src/assets/images/event-backdrops/render-creation-workshop-backdrop.jpg'
import backActiveImmersion from '../src/assets/images/event-backdrops/activate-immersion2.png'
import backRenderCreation from '../src/assets/images/event-backdrops/render-creation2.jpg'
import e1_image_1 from '../src/assets/images/event-images/initiate-calibration/initiate_calibration_image_1.png'
import e1_image_2 from '../src/assets/images/event-images/initiate-calibration/initiate_calibration_image_2.png'
import e1_image_3 from '../src/assets/images/event-images/initiate-calibration/initiate_calibration_image_3.png'
import e1_image_4 from '../src/assets/images/event-images/initiate-calibration/initiate_calibration_image_4.png'
import e2_image_1 from '../src/assets/images/event-images/activate-immersion/activate_immersion_image_1.jpg'
import e2_image_2 from '../src/assets/images/event-images/activate-immersion/activate_immersion_image_2.jpg'
import e2_image_3 from '../src/assets/images/event-images/activate-immersion/activate_immersion_image_3.jpg'
import e2_image_4 from '../src/assets/images/event-images/activate-immersion/activate_immersion_image_4.jpg'
import e3_image_1 from '../src/assets/images/event-images/render-creation/rennder-creation-images-1.jpg'
import e3_image_2 from '../src/assets/images/event-images/render-creation/render-creation-images-2.jpg'
import e3_image_3 from '../src/assets/images/event-images/render-creation/render-creation-images-3.jpg'
import e3_image_4 from '../src/assets/images/event-images/render-creation/render-creation-images-4.jpg'
import coming_soon_1 from '../src/assets/images/coming-soon/1.png'
import coming_soon_2 from '../src/assets/images/coming-soon/2.png'
import coming_soon_3 from '../src/assets/images/coming-soon/3.png'
import coming_soon_4 from '../src/assets/images/coming-soon/4.png'
import coming_soon_grid_1 from '../src/assets/images/coming-soon/grid_1 (1).jpg'
import coming_soon_grid_2 from '../src/assets/images/coming-soon/grid_2.jpg'
import coming_soon_grid_3 from '../src/assets/images/coming-soon/grid_3.jpg'
import coming_soon_grid_4 from '../src/assets/images/coming-soon/grid_4.jpg'

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
    bthumbnail: backActiveImmersion,
    slug: 'initiate-calibration',
    tags: [
      'INTRODUCTORY EVENT',
      'BASIC XR EXPLANATION',
      'FUTURE OPPORTUNITIES IN XR',
    ],
    tagline: 'Our Introduction. Our Beginning. Our Future. The First Step.',
    pagesubtitle: 'Our first ever event. Students experience XR for the first time and its future influence.',
    overview: "Initiate Calibration was the inaugural event of the Hyperspace AR/VR Special Interest Group (SIG), marking the beginning of its mission to build a thriving community around Extended Reality technologies. Organized at Modern Education Society's Wadia College of Engineering, the event introduced 126 students to the fundamentals of Augmented Reality (AR), Virtual Reality (VR), Mixed Reality (MR), and Extended Reality (XR) through expert talks, real-world project showcases, and an immersive hands-on VR experience. The program also featured Smart India Hackathon (SIH) qualifiers presenting their award-winning XR solution, demonstrating how immersive technologies can address real-world challenges.",
    date: '16 FEBRUARY 2026',
    audience: '126',
    type: 'LECTURE EVENT',
    sponsors: 'NONE',
    images: [
      e1_image_1,
      e1_image_2,
      e1_image_3,
      e1_image_4
    ],
    plan: `Initiate Calibration represented the first milestone in Hyperspace's journey as an AR/VR Special Interest Group and laid the foundation for a student-driven ecosystem focused on innovation, collaboration, and immersive technologies. The event was carefully designed to bridge the gap between curiosity and practical understanding by introducing participants to the rapidly evolving world of Extended Reality.

      The session began with an introduction to Hyperspace, where attendees were welcomed and introduced to the vision, objectives, and long-term mission of the Special Interest Group. This was followed by a comprehensive overview of the core concepts of Augmented Reality (AR), Virtual Reality (VR), Mixed Reality (MR), and Extended Reality (XR), helping students understand the differences between these technologies and the unique applications of each in today's digital landscape.

      A major highlight of the event was the experience-sharing session conducted by the Smart India Hackathon 2025 qualifiers. The team showcased their XR-based project, explaining why they chose immersive technologies as their solution, the challenges they encountered during development, and the journey that led them to the national finals. Beyond the technical implementation, the speakers shared valuable lessons on teamwork, innovation, project management, and problem-solving, inspiring students to participate in future hackathons and research initiatives. An interactive Q&A session concluded this segment, allowing participants to engage directly with the presenters and gain deeper insights into real-world XR development.

      The program then shifted its focus to the broader XR ecosystem, exploring how immersive technologies are transforming industries such as healthcare, education, manufacturing, architecture, entertainment, and gaming. Participants were introduced to the growing opportunities available in research, startups, product development, and emerging careers within the XR domain. This session highlighted the immense potential of Extended Reality and encouraged students to become early adopters and innovators in a rapidly expanding field.

      The event concluded with its most anticipated segment—a live Virtual Reality demonstration and hands-on experience. Before entering the virtual environment, participants were guided through the proper use of VR headsets and navigation within immersive applications. Students then experienced the team's Smart India Hackathon project firsthand before taking part in a thrilling virtual roller coaster simulation. For many attendees, this was their first interaction with a VR headset, making the experience both memorable and transformative. Behind the scenes, the organizing team ensured smooth execution through efficient queue management, fixed experience durations, and proper headset sanitization, allowing every participant to safely experience the technology.

      More than just an introductory event, Initiate Calibration established the vision and identity of Hyperspace as a platform dedicated to fostering curiosity, innovation, and technical excellence in the field of Extended Reality. It successfully introduced students to immersive technologies, demonstrated their real-world impact through practical examples, and inspired the next generation of XR developers, researchers, and innovators to explore the limitless possibilities of the digital world.`,
    albumLink: '"https://drive.google.com'
  },
  {
    id: 2,
    name: 'ACTIVATE IMMERSION',
    thumbnail: activateImmersion,
    bthumbnail: backActiveImmersion,
    slug: 'activate-immersion',
    tags: [
      'EXPERT LECTURE',
      'INDUSTRY CONNECT',
      'CAREER ROADMAP FOR XR',
    ],
    tagline: 'ONE GUEST. DIVERSE MINDS. ONE LECTURE. BOUNDLESS LEARNING.',
    pagesubtitle: 'Our first ever event. Students experience XR for the first time and its future influence.',
    overview: 'Activate Immersion was the second official event organized by Hyperspace SIG during the 2025–26 academic year. Conducted as an expert guest lecture on Extended Reality (XR), the event brought together over 115 students to learn directly from an industry professional. The session was designed to bridge the gap between academic concepts and real-world XR applications through expert insights, practical case studies, interactive discussions, and career guidance. The event followed a structured five-phase agenda that encouraged engagement while introducing students to the rapidly evolving XR ecosystem.',
    date: '25 FEBRUARY 2026',
    audience: '115',
    type: 'LECTURE EVENT',
    sponsors: 'NONE',
    images: [
      e2_image_1,
      e2_image_2,
      e2_image_3,
      e2_image_4,
    ],
    plan: `Activate Immersion marked the second milestone in Hyperspace SIG's mission to build a strong XR community within the college. The event was organized as an expert guest lecture featuring Mr. Akshay Rathod, Founder and CEO of Firebird VR and Co-President at VRARA Pune Chapter, an XR professional with nearly a decade of experience in immersive technologies. Having worked across multiple industries since 2015 and successfully delivered numerous XR projects, the speaker provided students with valuable insights into both the technical and business aspects of Extended Reality.

      The event began with a formal inauguration by the Hyperspace SIG leadership, introducing the organization's vision and setting the context for the lecture. The guest speaker was then introduced along with his professional achievements, allowing students to understand the depth of experience behind the session.

      The core lecture focused on the foundations of Extended Reality, explaining how technologies such as Virtual Reality (VR), Augmented Reality (AR), and Mixed Reality (MR) are transforming modern industries. Students were introduced to emerging trends, practical use cases, and the growing impact of immersive technologies across sectors. Building upon these concepts, the session transitioned into advanced discussions featuring real-world case studies, industry expectations, career pathways, Bloom's Taxonomy, and the Software Development Life Cycle (SDLC), enabling attendees to understand how technical knowledge translates into professional applications.

      A dedicated interaction session encouraged students to actively engage with the speaker through questions and discussions. This interactive format helped clarify concepts introduced during the lecture while creating meaningful conversations around career opportunities and technological advancements. The emphasis on audience participation significantly enhanced student engagement and demonstrated how interactive technologies can improve learning experiences, information retention, and collaboration.

      The event concluded with a formal vote of thanks recognizing the contributions of the guest speaker, faculty members, attendees, and the entire Hyperspace SIG organizing team. To maintain enthusiasm for future activities, the Vice President concluded the session by introducing the next Hyperspace SIG event and highlighting the exciting learning opportunities that students could look forward to.

      Overall, Activate Immersion successfully connected classroom learning with industry practices, equipping students with practical knowledge, career direction, and a deeper appreciation of the expanding XR landscape. The event strengthened Hyperspace SIG's vision of fostering innovation, technical excellence, and immersive technology awareness among aspiring engineers.`,
    albumLink: '"https://drive.google.com'
  },
  {
    id: 3,
    name: 'RENDER CREATION',
    thumbnail: renderCreation,
    bthumbnail: backRenderCreation ,
    slug: 'render-creation',
    tags: [
      'WORKSHOP 1',
      '3D GAME DEVELOPMENT USING UNITY',
      'HANDS-ON EXPERIENCE',
    ],
    tagline: 'TWO DAYS. UNFORGETTABLE EXPERIENCES. GAME CREATION.',
    pagesubtitle: 'Our first ever event. Students experience XR for the first time and its future influence.',
    overview: 'Render Creation was the third flagship event organized by Hyperspace SIG as a two-day hands-on Unity and game development workshop. Designed as the first installment of a larger learning trilogy, the workshop introduced students to the fundamentals of Unity Engine through the development of a simple archery game. Beyond technical learning, the event also marked an important milestone for the SIG by expanding its organizing team, refining event management strategies, and laying the foundation for an upcoming XR hackathon. With 28 participants, the workshop emphasized practical learning, collaboration, and continuous mentorship in an engaging classroom environment',
    date: '16 & 17 APRIL 2026',
    audience: '28',
    type: 'WORKSHOP',
    sponsors: 'NONE',
    images: [
      e3_image_1,
      e3_image_2,
      e3_image_3,
      e3_image_4,
    ],
    plan: `Render Creation represented a significant step in the evolution of Hyperspace SIG, serving not only as a technical workshop but also as a preparation phase for the organization's long-term vision. Before planning the event, the team reflected on the successes and challenges of its previous activities and recognized the need to expand the organization. Through a structured recruitment process, new members were selected for technical, management, media, and design teams, strengthening the SIG's ability to execute larger and more ambitious events in the future.

      With an expanded team in place, Hyperspace SIG began planning its third event. The workshop was envisioned as the first chapter of a three-part learning series designed to prepare students for an upcoming XR and game development hackathon. Since many participants had little or no prior experience with Unity, the organizers carefully selected an archery game project that balanced simplicity with practical programming concepts. Each department contributed to the workshop's success—from developing beginner-friendly Unity scripts and organizing the event schedule to designing promotional material and conducting outreach. Realizing that a single day would not provide sufficient time for quality learning, the organizers extended the workshop into a two-day program.

      To create an engaging learning atmosphere, the organizing team transformed the laboratory into a welcoming workshop space using custom banners, decorative lighting, posters, and presentation equipment. These preparations helped create an environment that encouraged creativity, collaboration, and active participation throughout the event.

      The first day focused on onboarding participants and preparing their development environments. Students were welcomed, their laptops were configured with Unity Hub and Visual Studio Code, and the workshop began with guided instruction on building the archery game. Throughout the session, the organizers maintained a structured schedule while ensuring that participants remained comfortable through planned breaks and continuous support from the technical team.

      On the second day, the workshop continued from where the previous session had concluded. Participants refined their projects with the assistance of mentors, while the technical team provided live demonstrations and one-on-one guidance whenever required. To keep the atmosphere lively and rewarding, the organizers also hosted a Kahoot quiz during the break, with small prizes awarded to the top performers. This combination of technical instruction and interactive activities kept students engaged while reinforcing the concepts they had learned.

      Following the completion of the workshop, the organizing team gathered participant feedback to evaluate the event's strengths and identify areas for improvement. The insights collected became valuable input for planning future workshops and the anticipated hackathon series. By combining practical Unity development, collaborative learning, and thoughtful event execution, Render Creation successfully equipped participants with foundational game development skills while establishing a stronger and more capable Hyperspace SIG community`,
    albumLink: '"https://drive.google.com'
  },
]
const EVENTS_COMING_SOON = [
  {
    id: 1,
    name: 'INTRO EVENT',
    slug: 'intro-event',
    thumbnail: coming_soon_1,
    tags: [
      'INTRODUCTION TO NEW STUDENTS',
      'FUTURE XR KNOWLEDGE',
      'HANDS-ON EXPERIENCE',
    ],
    tagline: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    pagesubtitle: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    overview: 'Why so impatient? Details coming soon!',
    date: 'COMING SOON!',
    audience: 'COMING SOON!',
    type: 'LECTURE EVENT',
    sponsors: 'COMING SOON!',
    images: [
      coming_soon_grid_1,
      coming_soon_grid_2,
      coming_soon_grid_3,
      coming_soon_grid_4,
    ],
    plan: 'Coming Soon!',
    albumLink: '',
  },
  {
    id: 2,
    name: 'BLENDER WORKSHOP',
    slug: 'blender-workshop',
    thumbnail: coming_soon_2,
    tags: [
      'WORKSHOP 2',
      'BLENDER DESIGN AND 3D DEVELOPMENT',
      'ENIVRONMENT AND ASSETS BUILDING',
      'DETAILS COMING SOON!',
    ],
    tagline: 'CREATING ASSETS AND BUILDING ENVIRONMENTS FOR YOUR PROJECTS.',
    pagesubtitle: 'CREATING ASSETS AND BUILDING ENVIRONMENTS FOR YOUR PROJECTS.',
    overview: 'Why so impatient? Details coming soon!',
    date: "COMING SOON!",
    audience: "COMING SOON!",
    type: 'WORKSHOP',
    sponsors: 'COMING SOON!',
    images: [
      coming_soon_grid_1,
      coming_soon_grid_2,
      coming_soon_grid_3,
      coming_soon_grid_4,
    ],
    plan: 'Coming Soon!',
    albumLink: '',
  },
  {
    id: 3,
    name: 'RENDER CREATION 2',
    slug: 'render-creation-2',
    thumbnail: coming_soon_3,
    tags: [
      'WORKSHOP 3',
      'VR DEVELOPMENT',
      '3D GAME DEVELOPMENT',
      'DETIALS COMING SOON',
    ],
    tagline: 'BUILDING DIGITAL WORLDS. ONE STROKE AT A TIME.',
    pagesubtitle: 'BUILDING DIGITAL WORLDS. ONE STROKE AT A TIME.',
    overview: 'Why so impatient? Details coming soon!',
    date: 'COMING SOON!',
    audience: 'COMING SOON!',
    type: 'WORKSHOP',
    sponsors: 'COMING SOON!',
    images: [
      coming_soon_grid_1,
      coming_soon_grid_2,
      coming_soon_grid_3,
      coming_soon_grid_4,

    ],
    plan: 'COMING SOON!',
    albumLink: ''
  },
  {
    id: 4,
    name: 'RE:INCARNATION 2026',
    slug: 're-incarnation-2026',
    thumbnail: coming_soon_4,
    tags: [
      'HACKATHON',
      'VR DEVELOPMENT',
      'RETRO 3D GAME DEVELOPMENT',
      'DETIALS COMING SOON',
    ],
    tagline: 'RETRO GAMES. NEW TECHNOLGIES. AMAZING MINDS. INFINITE TALENT.',
    pagesubtitle: 'RETRO GAMES. NEW TECHNOLGIES. AMAZING MINDS. INFINITE TALENT.',
    overview: 'Why so impatient? Details coming soon!',
    date: 'COMING SOON!',
    audience: 'COMING SOON!',
    type: 'HACKATHON',
    sponsors: 'COMING SOON!',
    images: [
      coming_soon_grid_1,
      coming_soon_grid_2,
      coming_soon_grid_3,
      coming_soon_grid_4,

    ],
    plan: 'COMING SOON!',
    albumLink: ''
  },
]

const EVENTS = [...EVENTS_CONDUCTED, ...EVENTS_COMING_SOON];

const BLOGS_HOME = [
  { id: 1, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide', slug: 'developing-games-with-unity-hub-beginners-guide', },
  { id: 2, title: 'DESIGN JOURNAL', date: 'MAY 30, 2026', desc: 'Crafting Visual Identity: From Blank Canvas to Brand Universe', slug: 'crafting-visual-identity' },
  { id: 3, title: 'GAME DEVELOPMENT', date: 'MAY 22, 2026', desc: 'Developing Games With Unity Hub: Beginner’s Guide', slug: 'developing-games-with-unity-hub-beginners-guide', },
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
  { id: 1, question: 'What is HyperSpace?', answer: "HyperSpace is one of the only two XR Special Interest Group in Pune formed by students and XR enthusiats of the Modern Education Society's Wadia College of Engineering. It is formed by students for students" },
  { id: 2, question: 'What is the role of HyperSpace in the college community?', answer: "HYPERSPACE IS RESPONSIBLE FOR EXPANDING THE INFLUENCE OF XR DEVELOPMENT AND HELP STUDENTS UNDERSTAND THE CONCEPT OF FUTURISTIC TECHNOLOGY BY CONDUCTION WORKSHOPS AND LECTURE EVENTS." },
  { id: 3, question: 'How do we plan out our events?', answer: "Events are planned with rigorous decision making and continuous iteration after careful analysis and discussions within the team. The team approaches many faculty and students to get an idea of the interest and awareness of various frameworks in the community. The events are then planned and prepared after this through and systematic analysis. Hyperspace is always focused on planning events for students with them in primary focus." },
  { id: 4, question: 'What is our policy of accepting brand sponsorships?', answer: "Hyperspace is strictly an technical group. Hence, all our events are technical and focused on knowledge sharing. Therefore, Hyperspace only accepts techincal sponsors who can provide them with resources necessary for lectures and workshops with a few exceptions. Techincal sponsors are selected based on their contribution level to our progress and the event's availability. Hyperspace primarly focues on XR startups, founders and industries, but also includes 3D developement industries in their wide catalog." },
]

const BLOGS = [
  {
    id: 1,
    tag: 'GAME DEVELOPMENT',
    date: 'MAY 22, 2026',
    title: 'Developing Games With Unity Hub: Beginner’s Guide',
    slug: 'developing-games-with-unity-hub-beginners-guide',
  },
  {
    id: 2,
    tag: 'Design Journal',
    date: 'MAY 30, 2026',
    title: 'Crafting Visual Identity: From Blank Canvas to Brand Universe',
    slug: 'crafting-visual-identity',
  },
  {
    id: 3,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    slug: 'managin-to-plan-events',
  },
  {
    id: 4,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    slug: 'managin-to-plan-events',
  },
  {
    id: 5,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    slug: 'managin-to-plan-events',
  },
  {
    id: 6,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    slug: 'managin-to-plan-events',
  },
  {
    id: 7,
    tag: 'Management Tips',
    date: 'MAY 22, 2026',
    title: 'How To Plan Events',
    slug: 'managin-to-plan-events',
  },
  {
    id: 8,
    tag: 'Design Journal',
    date: 'MAY 30, 2026',
    title: 'Crafting Visual Identity: From Blank Canvas to Brand Universe',
    slug: 'crafting-visual-identity',
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
  BLOGS,
  EVENTS
};