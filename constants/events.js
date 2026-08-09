import textureDistortion from '../src/assets/images/event-backdrops/texture-distortion-backdrop.png'
import sched01 from '../src/assets/images/schedule/01.png'
import sched02 from '../src/assets/images/schedule/02.png'
import sched03 from '../src/assets/images/schedule/03.png'
import sched04 from '../src/assets/images/schedule/04.png'
import sched05 from '../src/assets/images/schedule/05.png'
import sched06 from '../src/assets/images/schedule/06.png'
import sched07 from '../src/assets/images/schedule/07.png'
import sched08 from '../src/assets/images/schedule/08.png'
import sched09 from '../src/assets/images/schedule/09.png'
import sched10 from '../src/assets/images/schedule/10.png'
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
      'CERTIFIED WORKSHOP',
    ],
    tagline: 'ONE BLANK CANVAS. ONE VISION. ENDLESS POSSIBILITIES.',
    pagesubtitle: 'ONE BLANK CANVAS. ONE VISION. ENDLESS POSSIBILITIES.',
    overview: 'Texture Distortion is the fifth official event of Hyperspace XR SIG and the first hands-on technical workshop of the 2026-27 academic year, inviting students of all skill levels to experience 3D creation from the inside out. Spanning two focused sessions, the workshop guides participants through the complete Blender pipeline, from navigating a blank viewport to delivering a fully modelled, textured, lit, and rendered scene, placing real creative tools in their hands from the very first hour. Rather than teaching in theory alone, every concept unfolds through practice, with each new skill building directly on the last until participants walk away not just with knowledge, but with something they made themselves. All participants who complete the workshop will receive a certificate of completion.',
    date: '13-14TH OF AUGUST 2026',
    time: '1:00 PM - 4:00 PM',
    venue: '518',
    audience: '60',
    type: 'HANDS-ON WORKSHOP',
    sponsors: ['COMING SOON!'],
    schedule: [
      {
        day: 'Day 1 - Thursday, 13th August',
        items: [
          { title: 'Setup & Orientation', description: 'Laptop and Blender setup. Grab lunch if you haven\'t already, coordinators will have you ready to go within the first 30 minutes.', image: sched01 },
          { title: 'Interface, Navigation & Your First Mesh', description: 'An introduction to the Blender interface, viewport navigation, essential hotkeys, and the foundational modelling tools you will use throughout the workshop.', image: sched02 },
          { title: 'Foundation of 3D Modelling', description: 'Using a structured tutorial, you will model a donut base, build a mug with a handle, a plate, and apply icing with organic deformation.', image: sched03 },
          { title: 'Break & Day 1 Quiz', description: 'A short break for refreshments. Immediately after, a fast-paced quiz based on the day\'s content. Top 3 scorers win cool prizes.', image: sched04 },
          { title: 'Workshop Continues', description: 'The session resumes after the quiz, covering camera placement, material setup, and a first look at rendering.', image: sched05 },
        ],
      },
      {
        day: 'Day 2 - Friday, 14th August',
        items: [
          { title: 'Setup & Orientation', description: 'Laptop setup and a quick recap of Day 1 progress before diving in.', image: sched06 },
          { title: 'PBR Materials & UV Texturing', description: 'You will apply physically-based materials to every surface, learn UV unwrapping, and connect real texture maps into Blender\'s shader editor.', image: sched07 },
          { title: 'Scatter System, Lighting & Final Render', description: 'Scatter sprinkles across the icing using Blender\'s scatter system, build a three-light setup, and produce the final rendered image of your complete scene.', image: sched08 },
          { title: 'Break & Day 2 Quiz', description: 'A short break for refreshments, followed by the Day 2 quiz. A fresh top 3: Fresh prizes.', image: sched09 },
          { title: 'Instagram Challenge', description: 'Share your completed render, tag @mescoe_hyperspace, and the post with the most likes by the deadline wins a special reward. The virtual world isn\'t going to render itself: show yours off.', image: sched10 },
        ],
      },
    ],
    scheduleLabel: 'THE SCHEDULE',
    rulebook_url: 'https://drive.google.com/file/d/1s_Zbe7DRIBg6IFnCTTLWX_j7m_rfLs53/view?usp=sharing',
    brochure_url: 'https://drive.google.com/file/d/1bjIw2g77GeV4w_Z05zi3vTmajYL-txOu/view?usp=sharing',
    registration_open: true,
  },
]

export { eventsOngoing };