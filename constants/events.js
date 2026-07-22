import renderCreation from '../src/assets/images/event-backdrops/render-creation-workshop-backdrop.jpg'
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
    thumbnail: renderCreation,
    tags: [
      'INTRODUCTION TO NEW STUDENTS',
      'FUTURE XR KNOWLEDGE',
      'HANDS-ON EXPERIENCE',
    ],
    tagline: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    pagesubtitle: 'A NEW JOURNEY BEGINS. A NEW CHAPTER OPENS. A NEW ERA STARTS.',
    overview: 'Why so impatient? Details coming soon!',
    date: '29 JULY 2026',
    audience: '-',
    type: 'LECTURE EVENT',
    sponsors: ['COMING SOON!'],
    plan: 'Coming Soon!',
    brochure_url: '',
  },
]

export { eventsOngoing };