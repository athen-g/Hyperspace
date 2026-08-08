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