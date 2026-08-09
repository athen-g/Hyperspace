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
    rulebook_url: 'https://drive.google.com/file/d/1s_Zbe7DRIBg6IFnCTTLWX_j7m_rfLs53/view?usp=sharing',
    brochure_url: 'https://drive.google.com/file/d/1bjIw2g77GeV4w_Z05zi3vTmajYL-txOu/view?usp=sharing',
    registration_open: true,
  },
]

export { eventsOngoing };