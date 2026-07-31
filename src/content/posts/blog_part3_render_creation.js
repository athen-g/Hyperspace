import accessGrantedImg from '../../assets/images/recruitment/access-granted.jpg';
import renderCreationBackdropImg from '../../assets/images/event-backdrops/render-creation-workshop-backdrop.jpg';
import renderCreationPosterImg from '../../assets/images/event-posters/render-creation.jpg';

const post = {
  slug: 'crafting-visual-identity-render-creation',

  tags: ['Design', 'Visual Identity', 'XR', 'Events'],

  hero: {
    eyebrow: [{ text: '—— Design Journal · Part 3 of 5' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'RENDER\nCREATION: ', variant: 'pink' },
      { text: 'GLASS,\nUNITY, AND\nA NEW BATCH', variant: 'white' },
    ],
    subtitle:
      'A second round of recruitment brought new faces in. Then came our most ambitious event yet — a two-day Unity workshop with a design language that introduced glass, cosmic scale, and the first true typographic duet in our series.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace XR SIG',
      date: 'June 23, 2026',
      readTime: '7 min read',
    },
  },

  sidebar: {
    author: {
      initials: 'AG',
      name: 'Atharva Ghule',
      role: 'Design Head · Hyperspace XR',
      bio: 'Crafting the visual universe of Hyperspace XR — event backdrops, posters, brand identity, and everything in between. SE Computer, Wadia College of Engineering.',
    },
    related: [
      {
        category: 'Design Journal · Part 1',
        title: 'Before the First Slide — Building the Team, Then Initiate Calibration',
        date: 'June 9, 2026',
        href: '#crafting-visual-identity-initiate-calibration',
        thumbClass: 'related-thumb-1',
      },
      {
        category: 'Design Journal · Part 2',
        title: 'Activate Immersion — Crossing the Threshold',
        date: 'June 16, 2026',
        href: '#crafting-visual-identity-activate-immersion',
        thumbClass: 'related-thumb-2',
      },
      {
        category: 'Design Journal · Part 5',
        title: 'The Language Itself — How Our Visual System Evolved',
        date: 'July 7, 2026',
        href: '#crafting-visual-identity-design-language',
        thumbClass: 'related-thumb-3',
      },
    ],
  },

  content: [
    {
      type: 'heading',
      id: 'second-recruitment',
      text: 'The Second Recruitment — Returning to the White World',
    },
    {
      type: 'paragraph',
      text: 'Between Activate Immersion and Render Creation, Hyperspace XR ran its second recruitment drive. And just as the first recruitment had lived in a completely different visual register from our event materials, so did the second. The recruitment sub-brand has always been its own world: white grounds, holographic liquid chrome forms, the editorial serif headline. Where event materials feel like you are already inside a system, recruitment materials feel like you are being invited to step into one.',
    },
    {
      type: 'paragraph',
      text: 'The second recruitment used the same approach as the first — posters announcing the drive, followed by an Access Granted announcement once the new batch was selected. This repetition was intentional. By the time the second drive came around, students who had seen the first round recognised the visual language immediately: white ground, iridescent forms, this is Hyperspace XR looking for people. Brand recognition, built in two cycles.',
    },

    {
      type: 'heading',
      id: 'access-granted',
      text: 'Access Granted — The Terminal Returns',
    },
    {
      type: 'paragraph',
      text: 'The Access Granted poster is the most technically detailed piece in our recruitment sub-brand, and it is also the piece that most deliberately bridges the recruitment world and the event world. Visually, it lives in the light register: white and holographic, the same chromatic liquid forms as the We\'re Recruiting poster. But its language — the words it uses, the structures it uses them in — comes directly from the terminal aesthetic we introduced in the Initiate Calibration poster.',
    },
    {
      type: 'media',
      src: accessGrantedImg,
      alt: 'Hyperspace XR — Access Granted, Batch HS-02-B',
      caption:
        '<b>↑ Access Granted — Batch HS-02-B</b> — The announcement of the second batch of Hyperspace XR members. White holographic ground from the recruitment sub-brand, but terminal language threading through from the event world: SYSTEM STATUS: ONLINE. BATCH NO: HS-02-B. MEMBERS ADDED: 9. INITIALIZATION COMPLETE ████████ 100%. The progress bar is a small detail that reads, at a glance, as unmistakably ours.',
    },
    {
      type: 'paragraph',
      text: 'SYSTEM STATUS: ONLINE. BATCH NO: HS-02-B. MEMBERS ADDED: 9. INITIALIZATION COMPLETE — followed by a progress bar filled to 100%. These lines are not administrative text dressed up with formatting. They are a deliberate callback to the boot-sequence language of Initiate Calibration: AUTHORIZED NODE CONNECTED, ACCESS: OPEN, CALIBRATION IS NOT THEORETICAL. The system that was initialising at the first event has now, with this batch, reached full operational status. The progress bar closing at 100% is the punctuation on that arc.',
    },
    {
      type: 'paragraph',
      text: 'The team structure on the poster follows the same hierarchy established in Meet the Team: Technical Team, Management Team, Design Team, Media and Outreach Team. Each team listed with members and their division. The colour that does the organising work here is purple — not pink, which is reserved for core leadership — but a consistent violet that groups the team labels and separates them from the names beneath. The logic of the colour system is quiet but present throughout.',
    },
    {
      type: 'pullQuote',
      text: 'INITIALIZATION COMPLETE ████████ 100%. The progress bar is a small detail — four characters and a percentage. But it closes an arc that started at the very first event, when the system was just coming online. This is what it looks like when a design language has memory.',
    },

    {
      type: 'heading',
      id: 'render-creation',
      text: 'Render Creation — The Dark Returns, Deeper',
    },
    {
      type: 'paragraph',
      text: 'The alternating ground logic dictated that after Activate Immersion\'s pale blue-grey, the next event would go dark again. Render Creation went dark — but it did not go back to the jet black of Initiate Calibration. It went somewhere new: a deep violet-purple, the colour of a render preview at 3 AM, the colour of a Blender viewport with the studio lights on and the room lights off. It is dark in a way that is warm rather than void-like. Calibration\'s black felt like the absence of everything. Render Creation\'s purple feels like the presence of something just beyond what you can see.',
    },
    {
      type: 'media',
      src: renderCreationBackdropImg,
      alt: 'Render Creation — Event Backdrop',
      caption:
        "<b>↑ Render Creation — Event Backdrop</b> — Deep violet-purple ground, a first for the series. The hero object is a glass crystalline 3D figure — transparent, refractive, dense with internal geometry — orbited by iridescent mesh rings. Flowing topology wave-meshes recede into the background in teal and navy. This is the most compositionally complex backdrop in the series.",
    },
    {
      type: 'paragraph',
      text: 'The hero object for Render Creation is a glass crystalline figure: shattered and angular, dense with internal geometry, refracting everything around it into prismatic light. Where Calibration\'s cube was solid, opaque, and interrupting, and Immersion\'s objects were a cast of distinct materials, Render Creation\'s figure is transparent all the way through — you can see its structure from every angle simultaneously. This is a piece of 3D art that is, itself, about 3D art. The hero object demonstrates the concept the workshop is teaching.',
    },
    {
      type: 'paragraph',
      text: 'Orbiting the figure are iridescent mesh rings — looping, overlapping halos drawn in fine topology lines. They add a sense of cosmic scale and orbital motion to what would otherwise be a static object. Behind everything, flowing topology wave-meshes recede into the background in teal and deep navy, giving the composition depth without adding visual weight. The result is the most layered backdrop we have produced: a foreground hero, a mid-ground orbital system, and a background topology field all occupying the same frame without any one layer overwhelming the others.',
    },

    {
      type: 'heading',
      id: 'render-creation-poster',
      text: 'The Poster — Where Two Typefaces Meet',
    },
    {
      type: 'media',
      src: renderCreationPosterImg,
      alt: 'Render Creation — Portrait Poster',
      caption:
        "<b>↑ Render Creation — Portrait Poster</b> — The first time two completely different type families share a headline in our event series. Italic high-contrast serif 'Render' in the upper register; bold condensed display 'CREATION' in the lower. Stars and sparkle marks as punctuation. The same glass figure from the backdrop, now in portrait composition. Date: 16–17 April, 12–4 PM, Room 501.",
    },
    {
      type: 'paragraph',
      text: 'The Render Creation portrait poster introduced something that had not appeared in the series before: a two-typeface headline. In every previous event poster, the headline was set in a single typeface. Here, Render — the first word — is set in an italic high-contrast serif, script-adjacent and flowing, tilted and star-marked like something from a fashion editorial. Creation — the second word — drops to a bold condensed display, all-caps, completely different in register. The two words together read as a deliberate contrast: the lightness of making versus the weight of what gets made.',
    },
    {
      type: 'paragraph',
      text: 'The sparkle and star mark punctuation scattered across the poster are another new addition. They feel hand-placed, slightly organic, contrasting with the precise geometry of the glass figure and the orbital rings. These marks do something specific: they make the poster feel like it was designed for a workshop — something slightly warmer and more celebratory than an induction or a lecture — without abandoning any of the technical seriousness of the visual language. Small marks doing large tonal work.',
    },
    {
      type: 'paragraph',
      text: 'Render Creation was our most ambitious event in terms of what it asked of attendees — two full days, 12 to 4 PM, hands-on Unity development. The design matched that ambition. More layers, more complexity, more internal geometry in the hero object, more typographic range in the headline. The design language was not just describing the event — it was performing the level of craft we wanted the workshop itself to reach.',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · June 2026',
    },
  ],
};

export default post;
