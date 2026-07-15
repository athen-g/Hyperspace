import initiateCalibrationImg from '../../assets/images/event-backdrops/initiate-calibration.jpg';
import activateImmersionImg from '../../assets/images/event-backdrops/activate-immersion.png';
import renderCreationWorkshopBackdropImg from '../../assets/images/event-backdrops/render-creation-workshop-backdrop.jpg';
import renderCreationImg from '../../assets/images/event-posters/render-creation.jpg';
import recruitmentImg from '../../assets/images/recruitment/recruitment-2026.jpg';
import accessGrantedImg from '../../assets/images/recruitment/access-granted.jpg';

const post = {
  slug: 'crafting-visual-identity',

  tags: ['Design', 'Visual Identity', 'XR'],

  hero: {
    eyebrow: [{ text: '—— Design Journal' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'CRAFTING VISUAL\nIDENTITY: ', variant: 'pink' },
      { text: 'FROM\nBLANK CANVAS TO\nBRAND UNIVERSE', variant: 'white' },
    ],
    subtitle:
      'A behind-the-scenes look at how our design team translates the language of extended reality into a cohesive, immersive visual world — one poster, backdrop, and banner at a time.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace SIG',
      date: 'May 30, 2026',
      readTime: '12 min read',
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
        category: 'Tech Development',
        title:
          'Building Spatial Webs: Transitioning from React DOM to Unity 3D WebGL Spaces',
        date: 'May 12, 2026',
        href: '#',
        thumbClass: 'related-thumb-1',
      },
      {
        category: 'Design Systems',
        title:
          'Designing for Refraction — Visual Physics of Frosted Glass and Chrome Surfaces',
        date: 'April 29, 2026',
        href: '#',
        thumbClass: 'related-thumb-2',
      },
      {
        category: 'Creative Coding',
        title:
          'Procedural Aesthetics — Using Geometry Nodes to Generate Our Brand Assets',
        date: 'April 22, 2026',
        href: '#',
        thumbClass: 'related-thumb-3',
      },
    ],
  },

  content: [
    { type: 'heading', id: 'intro', text: 'The Weight of a Blank Canvas' },
    {
      type: 'paragraph',
      text: "There is a particular kind of pressure that comes with being the design team for a SIG called Hyperspace XR. The name alone sets expectations — it evokes the infinite, the dimensional, the boundary-dissolving world of extended reality. And before we can build any of that in Unity, before our developers write a single line of code, our team has to build it visually. Every poster someone stops to read, every backdrop that fills a lecture hall screen, every banner hanging at an event entrance — these are the first impressions of Hyperspace XR. They are the brand before the experience.",
    },
    {
      type: 'paragraph',
      text: "I joined Hyperspace XR as Design Head with one clear mandate: make people feel something before they even step into the room. Not just excitement — that's easy. I wanted the feeling of standing at the threshold of another world. That's what XR is, after all. Augmented reality asks you to see your world differently. Virtual reality asks you to leave it entirely. Mixed reality blurs the border. So our design language had to do the same thing — blur the border between the familiar and the extraordinary.",
    },
    {
      type: 'paragraph',
      text: 'This is the story of how we built that visual universe, piece by deliberate piece.',
    },

    {
      type: 'heading',
      id: 'philosophy',
      text: 'The Philosophy: Futuristic, Grounded, Immersive',
    },
    {
      type: 'paragraph',
      text: 'The first thing I told our design team when we sat down to define our visual identity was this: we are not making "tech posters". Tech posters have gradients, sans-serifs, and the word "innovative" somewhere. We were making world-building artifacts. Every visual we produce is a fragment of a larger universe — the Hyperspace XR universe — and it needs to feel cohesive, cinematic, and lived-in.',
    },
    {
      type: 'paragraph',
      text: 'Our philosophy settled into a few core principles fairly quickly. Dark and immersive — almost everything sits on near-black backgrounds. Not pure black, which reads as a void and kills any sense of depth, but a deep blue-black that feels like the moment before a headset boots up. Glowing accents — violets, electric cyans, and the occasional hot pink of our logo — punctuate the darkness the way LEDs punctuate a server room or distant stars punctuate the night sky. Cinematic and large-scale — we design for projection screens and event backdrops before we design for phone screens, which means compositions are bold, typography is massive, and every element earns its place in the frame.',
    },
    {
      type: 'pullQuote',
      text: 'Every visual we produce is a fragment of a larger universe — and it needs to feel cohesive, cinematic, and lived-in. We are not making tech posters. We are making world-building artifacts.',
    },
    {
      type: 'paragraph',
      text: 'We drew our conceptual inspiration from the feeling of entering another world — which is, quite literally, the premise of XR. That liminal moment when a headset goes from the real world to the virtual one. That breath-held second before a new environment loads. We wanted our design language to live permanently in that moment: the threshold, the in-between, the place where one reality ends and another begins.',
    },

    {
      type: 'heading',
      id: 'backdrops',
      text: 'Event Backdrops — The First Slide Is Everything',
    },
    {
      type: 'paragraph',
      text: 'The first slide of an event is a statement. It is what the audience stares at for ten minutes while people find their seats, while microphones get adjusted, while the room fills with the ambient noise of anticipation. It has to carry that weight. It cannot be an afterthought — and for Hyperspace XR, it never is.',
    },
    {
      type: 'paragraph',
      text: 'Our very first flagship event gave us our first real test: the <b>Initiate Calibration</b> induction. The name alone told us everything we needed to know about the visual direction. "Calibration" is a technical word — the process of adjusting a system before it can be trusted to operate correctly. To "initiate" it is to begin that adjustment. It\'s the moment before you can trust what you\'re seeing. That felt perfect for an induction event: new members, new systems, everything initializing.',
    },
    {
      type: 'media',
      src: initiateCalibrationImg,
      alt: 'Initiate Calibration — Event Backdrop and First Slide',
      caption:
        '<b>↑ Initiate Calibration</b> — Induction event backdrop. Pure black ground, massive white condensed type bisected by a prismatic holographic cube. The visual tension of a system mid-initialization. Presented by Hyperspace SIG, with special guests Team Virtuverse.',
    },
    {
      type: 'paragraph',
      text: 'The design I arrived at was almost brutally simple in its concept and complex in its execution. Jet black — nearly void-black — as the full-bleed background. The event title rendered in the largest possible white type, bold and condensed, spanning the full width of the frame. And cutting through that title, displacing it, refracting it: a holographic, prism-like 3D cube rendered in iridescent green, red, and gold — the kind of object that looks like it does not fully belong in our physical world. The cube sits at the center of the composition not because it is decorative, but because it is the protagonist. It is the thing being calibrated. It is the new reality trying to insert itself into the familiar one.',
    },
    {
      type: 'paragraph',
      text: 'The tension in that design is deliberate. The text is interrupted — literally broken by the intrusion of the 3D object — because the XR world interrupts the real one. The system is initializing. Something is about to change. When that image went up on the projector screen as the first slide of the event, the room felt different. I heard people quietly say "wait, what is this?" as they took their seats. That\'s exactly what we wanted.',
    },

    {
      type: 'heading',
      id: 'immersion',
      text: 'Activate Immersion — Crossing the Threshold',
    },
    {
      type: 'paragraph',
      text: 'If Initiate Calibration was the tension before entry, <b>Activate Immersion</b> was the act of crossing through. Our second major event backdrop had to communicate something fundamentally different — not anticipation, but arrival. Full immersion, activated.',
    },
    {
      type: 'media',
      src: activateImmersionImg,
      alt: 'Activate Immersion — Event Backdrop',
      caption:
        '<b>↑ Activate Immersion</b> — Second event backdrop. Light blue-grey ground, bold condensed black type, 3D sculptural objects mid-float. Where Calibration was tension and darkness, Immersion is arrival and light.',
    },
    {
      type: 'paragraph',
      text: 'The visual energy shift between Calibration and Immersion was intentional and significant. Where Calibration used darkness and interruption to create tension, Immersion broke into a completely different register. A light, almost clinical blue-grey environment — the interior of a digital world, already booted up and waiting. Bold black condensed type: ACTIVATE IMMERSION, set at the kind of scale that looks almost aggressive on a projection screen. And floating through the composition: 3D sculptural objects in various materials and forms — a mirrored glass distortion panel, a chrome sphere, a matte cream cylinder, a translucent red torus.',
    },
    {
      type: 'paragraph',
      text: 'Each object came from a different material language, yet all shared the same physical space — because that is what the XR world does. It is a space where different realities coexist. Where a chrome sphere and a clay torus can exist side by side with the same physical weight. The typography is huge and confident because at this point, you are no longer hesitating at the threshold. You are in.',
    },
    {
      type: 'pullQuote',
      text: 'The XR world is a space where different realities coexist — where a chrome sphere and a clay torus can share the same frame with equal physical weight. Immersion is not a metaphor. It is the design itself.',
    },

    {
      type: 'heading',
      id: 'render-creation',
      text: 'Render Creation — Glass, Unity, and the Feeling of Making',
    },
    {
      type: 'paragraph',
      text: 'Our most technically ambitious backdrop to date was designed for <b>Render Creation</b>, our Unity-focused workshop series. This one required us to think deeply about what Unity means to us — as developers, as creators, as a SIG built on the premise that XR is the future of interactive experience.',
    },
    {
      type: 'paragraph',
      text: 'Unity is the engine. It is the place where nothing becomes something — where a blank scene becomes a virtual world, where a 3D model becomes an interactive object, where physics rules and lighting systems and spatial audio all converge into a coherent experience. Rendering in Unity is, in the most literal sense, the act of creation. So when we designed the Render Creation materials, we wanted the centrepiece to feel monumental and somehow ethereal — like looking at creation itself in the moment it happens.',
    },
    {
      type: 'media',
      src: renderCreationWorkshopBackdropImg,
      alt: 'Render Creation — Workshop Backdrop with Glass 3D Figure',
      caption:
        "<b>↑ Render Creation Workshop Backdrop</b> — Dark violet-purple environment, glowing wave mesh topology, holographic glass figure rendered in refracted prismatic light. Unity's creative engine made visible and monumental.",
    },
    {
      type: 'paragraph',
      text: 'The choice of a glass-rendered 3D sculptural figure was deliberate on every level. Glass is simultaneously transparent and present. It has no colour of its own, yet it transforms whatever light passes through it. It is the material of lenses — of the very optics that make VR headsets possible. When we render a form in glass, surrounded by flowing digital wave meshes and deep violet space, we communicate something that words cannot quite reach: that inside this workshop, inside Unity, light bends. Space is created. Reality is manufactured.',
    },
    {
      type: 'paragraph',
      text: 'The holographic orbiting rings that surround the central figure reference planetary systems and atomic models simultaneously — the macro and micro, the cosmic and the constructed. Everything is in motion, even when still. It is one of the pieces I am most proud of, because it manages to be technically specific — this is a Unity workshop, this is about 3D development — without losing the sense of wonder that drew us all to XR in the first place.',
    },
    {
      type: 'posterGrid',
      items: [
        {
          src: renderCreationImg,
          alt: 'Render Creation — Portrait Event Poster',
          aspectRatio: '3/4',
          caption:
            '<b>↑ Render Creation</b> — Portrait poster. Dark ground, italic script over bold display caps, glass crystalline centrepiece. Date: 16–17 April, Room 501.',
        },
        {
          src: recruitmentImg,
          alt: 'Hyperspace XR — Recruitment Poster 2026',
          aspectRatio: '3/4',
          caption:
            '<b>↑ Recruitment 2026</b> — Liquid chrome holographic forms on white ground. Same brand, lighter register. Management, Technical, Design, and Media teams.',
        },
      ],
    },

    {
      type: 'heading',
      id: 'poster-process',
      text: 'The Poster Process — Consistency as a Creative Discipline',
    },
    {
      type: 'paragraph',
      text: 'Posters are where our visual language gets stress-tested. An event backdrop is designed once, for one moment, for one screen at one resolution. A poster travels — it lives on Instagram, on WhatsApp, on printed notice boards, on college screens. It has to hold together across every context while remaining unmistakably Hyperspace XR.',
    },
    {
      type: 'paragraph',
      text: 'The consistency we aim for is not a rigid template. It is a set of values that guide every decision. Dark backgrounds — always, unless the occasion demands otherwise. Typographic hierarchy — a clear distinction between the event name, the type, the dates, and the supporting details, each in a different weight and size. Futuristic yet clean — no techno-clutter, no excessive gradients, nothing decorative that doesn\'t earn its place. And always, a hero object: something 3D, something physical, something that reminds the viewer that the world of XR is about objects that exist in space.',
    },
    {
      type: 'paragraph',
      text: 'The challenge of poster design for technical content — workshops, game jams, development sessions — is that these are fundamentally "come learn something" events. And learning is not always glamorous. Our job is to make the glamorous version of learning so appealing that people want to show up and do the difficult part. We never dumb down the content. But we make the invitation irresistible.',
    },
    {
      type: 'media',
      src: accessGrantedImg,
      alt: 'Hyperspace XR — Access Granted Membership Announcement',
      aspectRatio: '3/4',
      caption:
        '<b>↑ Access Granted — Batch HS-02-B</b> — New member announcement. Holographic fluid forms on white, structured team list, terminal-status aesthetic. Nine members added. Initialization complete: 100%.',
    },

    {
      type: 'heading',
      id: 'physical',
      text: 'Decorations & Physical Presence — Bringing the Digital Into the Room',
    },
    {
      type: 'paragraph',
      text: 'There is something deeply satisfying about a design that works in both dimensions — the screen and the physical world. When we design event decorations for Hyperspace XR, we are asking a simple but profound question: what does our digital universe feel like when it occupies physical space?',
    },
    {
      type: 'paragraph',
      text: 'The answer, we discovered, is not about printing our screen designs onto paper and calling it a day. Physical space has a different relationship with design. Lighting changes. Scale changes. The viewer moves through it rather than scrolling past it. So our physical design language is simultaneously faithful to the visual identity and adapted for three-dimensional experience.',
    },
    {
      type: 'paragraph',
      text: 'Printed backdrops for event stages use the same deep near-blacks and the same bold typography as our digital materials, but at scales that would be overwhelming on a screen. A six-foot banner that says HYPERSPACE XR in our display font, backlit by event lighting, commands a room differently than a 1920×1080 slide. Display screens at registration desks loop through our event posters and motion graphics. Standees for photo opportunities carry our holographic 3D objects at life-scale — suddenly, that crystalline prism from the Initiate Calibration backdrop is standing next to you, at eye level, demanding to be photographed.',
    },
    {
      type: 'paragraph',
      text: 'Our goal is to make the physical space feel like an extension of the digital brand — so that when someone walks in, before they open the event app or check the schedule, they already feel like they are inside something. Inside the Hyperspace XR universe.',
    },

    {
      type: 'heading',
      id: 'brand-universe',
      text: 'Building the Brand Universe — The Cumulative Effect',
    },
    {
      type: 'paragraph',
      text: 'Individual posters are not the goal. Individual backdrops are not the goal. The goal is something harder to define and more rewarding to achieve: a visual universe that is instantly recognisable, that feels coherent across every touchpoint, and that communicates the values of Hyperspace XR before a single word is read.',
    },
    {
      type: 'paragraph',
      text: "We are, I think, getting there. When I see our materials shared across WhatsApp groups and Instagram stories — not always with our name attached, sometimes just forwarded from person to person — and people still know it's Hyperspace XR, that's when I know the visual language is working. The colour palette, the typographic choices, the presence of a 3D hero object, the cinematic dark environment: these have become a signature.",
    },
    {
      type: 'paragraph',
      text: 'The process has been cumulative. The first poster established a tone. The second confirmed it. The event backdrops expanded it into a larger canvas. The festival posts demonstrated its versatility — our celebration posters for Gudi Padwa, Eid, Ram Navami, and Maharashtra Diwas use different visual registers but remain unmistakably ours, because the brand language is flexible enough to breathe. Each new piece of work is both a standalone object and a brick in a larger wall. And the wall is becoming a building. The building is becoming a world.',
    },
    {
      type: 'paragraph',
      text: 'There is something valuable that happens when a design language becomes familiar to your audience. They begin to anticipate it. They begin to trust it. When a new Hyperspace XR poster drops, our community knows before they read it that it will be bold, immersive, and slightly cinematic. That anticipation is a form of trust — and trust is the foundation of every brand worth building.',
    },
    { type: 'rule' },

    {
      type: 'heading',
      id: 'closing',
      text: 'Leading the Team — Responsibility, Joy, and What Comes Next',
    },
    {
      type: 'paragraph',
      text: 'Leading the design team of Hyperspace XR is, genuinely, one of the most rewarding things I have done. It comes with real responsibility — the decisions our team makes shape how the entire SIG is perceived, and by extension, how seriously people take XR as a field of creative and technical practice. That is not something I take lightly.',
    },
    {
      type: 'paragraph',
      text: 'But it is also, more often than not, pure joy. The joy of watching a design concept evolve from a rough sketch into a full-bleed backdrop that fills a lecture hall. The joy of our team pushing each other\'s ideas further — asking "what if we made the type bigger?" or "what if the holographic object was rendered in glass instead of metal?" The joy of seeing students stop at a notice board and photograph our poster to send to their friends, because they think it looks cool enough to share without any context attached.',
    },
    {
      type: 'paragraph',
      text: 'We are always evolving. Our next events are pushing us into new visual territory — more liquid, fluid forms alongside our geometric solids; more typographic risk-taking; new ways to integrate our logo mark into compositions as a design element rather than just a brand stamp. The Hyperspace XR visual language is not finished. It is, like all good design systems, a living thing.',
    },
    {
      type: 'paragraph',
      text: 'If you are reading this as a student wondering what design at a technical SIG looks like — this is it. It is rigorous and it is creative in equal measure. It is collaborative and it is solitary at 2 AM when a deadline is tomorrow. It is systematic and it is entirely made up as we go, in the best possible way. Every blank canvas is a question. And every time we face it, that question is the same: what world are we building today?',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · May 2026',
    },
  ],
};

export default post;
