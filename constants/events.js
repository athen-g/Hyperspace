import renderCreation from '../src/assets/images/event-backdrops/render-creation-workshop-backdrop.jpg'
import commenceSynchronization from '../src/assets/images/event-backdrops/commence-syncronization.png'
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
    date: '29 JULY 2026',
    audience: '-',
    type: 'LECTURE EVENT',
    sponsors: ['COMING SOON!'],
    scheduleLabel: 'EVENT JOURNEY',
    schedule: [
      {
        title: 'Phase 01 — The Signal',
        description: 'The event begins with an introduction to Hyperspace XR SIG and its vision. Participants are welcomed into a world where technology extends beyond screens, offering a glimpse into the ideas that drive immersive innovation. Rather than providing every answer immediately, this opening sets the stage for the journey that follows.',
      },
      {
        title: 'Phase 02 — Echoes of the Journey',
        description: 'Every milestone tells a story. This segment showcases the initiatives, workshops, and experiences that have shaped Hyperspace XR SIG. Participants gain insight into the community\'s growth and discover how each event has contributed to building a foundation for future innovation.',
      },
      {
        title: 'Phase 03 — From Concept to Creation',
        description: 'Ideas become tangible through a live demonstration of an immersive project developed by members of the SIG. Participants witness how creativity, design, and technology come together to create interactive experiences, offering a practical look at what can be achieved within the field of XR.',
      },
      {
        title: 'Phase 04 — Beyond the Horizon',
        description: 'The journey continues with an exploration of the future of immersive technologies. From education and healthcare to engineering, architecture, entertainment, and industry, participants discover how XR is transforming the way people learn, work, and interact with the digital world, while gaining insight into the opportunities that lie ahead.',
      },
      {
        title: 'Phase 05 — The Synchronisation Challenge',
        description: 'The event culminates in an interactive quiz based on the concepts explored throughout the session, including 3D technologies, Augmented Reality, Virtual Reality, and Extended Reality. Top 5 Participants will receive a special prize. Top 3 Participants will earn the opportunity to experience Virtual Reality firsthand using professional VR headsets.',
      },
      {
        title: 'Phase 06 — The Beginning',
        description: 'The event concludes with a formal closing and an invitation to become part of Hyperspace XR SIG. Participants leave with a clearer understanding of immersive technologies and the opportunities available to continue learning, building, and innovating within the community. The synchronization does not end here—it only begins.',
      },
    ],
    plan: 'Phase 01 — The Signal\nThe event begins with an introduction to Hyperspace XR SIG and its vision. Participants are welcomed into a world where technology extends beyond screens, offering a glimpse into the ideas that drive immersive innovation.\n\nPhase 02 — Echoes of the Journey\nEvery milestone tells a story. This segment showcases the initiatives, workshops, and experiences that have shaped Hyperspace XR SIG.\n\nPhase 03 — From Concept to Creation\nIdeas become tangible through a live demonstration of an immersive project developed by members of the SIG.\n\nPhase 04 — Beyond the Horizon\nThe journey continues with an exploration of the future of immersive technologies across education, healthcare, engineering, architecture, and entertainment.\n\nPhase 05 — The Synchronisation Challenge\nAn interactive quiz culminates the event. Top 5 receive a special prize. Top 3 experience VR firsthand with professional headsets.\n\nPhase 06 — The Beginning\nA formal closing and invitation to become part of Hyperspace XR SIG. The synchronization does not end here—it only begins.',
    brochure_url: '',
  },
]

export { eventsOngoing };