import renderCreation from '../src/assets/images/event-backdrops/render-creation-workshop-backdrop.jpg'
import commenceSynchronization from '../src/assets/images/event-backdrops/commence-syncronization.png'
import textureDistortion from '../src/assets/images/event-backdrops/texture-distortion-backdrop.png'
// Format:-
// {
//     id: ,
//     name: ,
//     slug: ,
//     thumbnail: ,
//     tagline (the one on the page): ,
//     overview: ,
//     date: ,
//     total_seats: ,
//     type: ,
//     tags: [],
//     sponsors: [],
//     schedule: {},
//     rulebook_url: ,
//     brochure_url: ,
//     plan: ,
// }

const eventsOngoing = [
  {
    id: 1,
    name: 'COMMENCE SYNCHRONIZATION',
    slug: 'commence-synchronization',
    thumbnail: commenceSynchronization,
    tags: [
      'INTRODUCTION TO NEW STUDENTS',
      'FUTURE XR KNOWLEDGE',
      'HANDS-ON EXPERIENCE',
    ],

    tagline: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    pagesubtitle: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    overview: 'Commence Synchronisation is the official introductory event of Hyperspace XR SIG, designed to provide participants with their first glimpse into the world of Extended Reality (XR). Through immersive discussions, live demonstrations, and interactive experiences, the event gradually unfolds the possibilities of Augmented Reality, Virtual Reality, and emerging immersive technologies.\n\nRather than revealing everything at once, each stage of the event uncovers another piece of a much larger vision—inviting participants to explore, question, and imagine what lies beyond the boundaries of conventional technology.',
    date: 'TUESDAY, 4TH AUGUST 2026',
    time: '2:00 PM – 4:00 PM',
    venue: '514',
    audience: '100+',
    type: 'LECTURE EVENT',
    sponsors: ['COMING SOON!'],
    plan: 'Phase 01 — The Signal\nThe event begins with an introduction to Hyperspace XR SIG and its vision. Participants are welcomed into a world where technology extends beyond screens, offering a glimpse into the ideas that drive immersive innovation.\n\nPhase 02 — Echoes of the Journey\nEvery milestone tells a story. This segment showcases the initiatives, workshops, and experiences that have shaped Hyperspace XR SIG.\n\nPhase 03 — From Concept to Creation\nIdeas become tangible through a live demonstration of an immersive project developed by members of the SIG.\n\nPhase 04 — Beyond the Horizon\nThe journey continues with an exploration of the future of immersive technologies across education, healthcare, engineering, architecture, and entertainment.\n\nPhase 05 — The Synchronisation Challenge\nAn interactive quiz culminates the event. Top 5 receive a special prize. Top 3 experience VR firsthand with professional headsets.\n\nPhase 06 — The Beginning\nA formal closing and invitation to become part of Hyperspace XR SIG. The synchronization does not end here—it only begins.',
    brochure_url: 'https://drive.google.com/file/d/17gSMwSkK3G054wFU_6dqkw5TgjBWVetm/view?usp=sharing',
    registration_open: true,
  },
  {
    id: 2,
    name: 'TEXTURE DISTORTION',
    slug: 'texture-distortion',
    thumbnail: textureDistortion,
    tags: [
      'SHADERS AND TEXTURES',
      'XR CREATIVE DESIGN',
      'VISUAL EFFECTS IN ENGINE',
    ],
    tagline: 'First installment for our Blender Trilogy',
    pagesubtitle: 'First installment for our Blender Trilogy',
    overview: 'COMING SOON!',
    date: '11-13TH OF AUGUST 2026',
    time: '2:00 PM – 4:00 PM',
    venue: '518',
    audience: '60',
    type: 'HANDS-ON WORKSHOP',
    sponsors: ['COMING SOON!'],
    plan: 'COMING SOON!',
    brochure_url: '',
    registration_open: false,
  },
]

export { eventsOngoing };