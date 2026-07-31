import activateImmersionBackdropImg from '../../assets/images/event-backdrops/activate-immersion.png';
import activateImmersionPosterImg from '../../assets/images/event-posters/activate-immersion.png';

const post = {
  slug: 'crafting-visual-identity-activate-immersion',

  tags: ['Design', 'Visual Identity', 'XR', 'Events'],

  hero: {
    eyebrow: [{ text: '—— Design Journal · Part 2 of 5' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'ACTIVATE\nIMMERSION: ', variant: 'pink' },
      { text: 'CROSSING\nTHE\nTHRESHOLD', variant: 'white' },
    ],
    subtitle:
      'Our second event flipped every visual assumption from the first. Where Initiate Calibration was dark and void-like, Activate Immersion was light, open, and floating. This was not an accident — it was the first sign that our design system had a rhythm.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace XR SIG',
      date: 'June 16, 2026',
      readTime: '6 min read',
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
        category: 'Design Journal · Part 3',
        title: 'Render Creation — Glass, Unity, and a New Batch',
        date: 'June 23, 2026',
        href: '#crafting-visual-identity-render-creation',
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
      id: 'the-flip',
      text: 'The Flip — When Light Means Something',
    },
    {
      type: 'paragraph',
      text: 'If you lined up every event backdrop Hyperspace XR has produced and looked at just the ground colour, you would notice something: they alternate. Initiate Calibration was jet black. Activate Immersion is a pale blue-grey — nearly the colour of a winter sky just before the sun comes up. Render Creation would return to dark. The alternation is not accidental, and it is not a coincidence of circumstance. It is a decision baked into how we think about each event as a distinct chapter in a larger series, while still keeping the whole series readable as one connected body of work.',
    },
    {
      type: 'paragraph',
      text: 'Calibration was the beginning — dark, initialising, a system coming online in a void. The appropriate ground for that is black, the absence of information, the space before things exist. Immersion is what comes after. You have crossed the threshold, the headset is on, and suddenly you are inside a world that is bright and volumetric and full of floating objects. The appropriate ground for that is light — not white, which would read as clinical, but a soft atmospheric blue-grey that suggests open space, altitude, a sky. When attendees walked into the room and saw that backdrop on the projector, they had already, visually, arrived somewhere different from where Calibration had taken them.',
    },
    {
      type: 'media',
      src: activateImmersionBackdropImg,
      alt: 'Activate Immersion — Event Backdrop',
      caption:
        '<b>↑ Activate Immersion — Event Backdrop</b> — The full ground inversion from Initiate Calibration. Pale blue-grey sky register, bold black condensed type (itself an inversion — the type goes dark when the ground goes light), and a composition of floating mixed-material 3D objects: a glass architectural panel, a chrome sphere, a cream capsule, a red transparent torus. No single hero object this time — a whole cast.',
    },
    {
      type: 'heading',
      id: 'the-objects',
      text: 'From One Object to Many — The Cast of Characters',
    },
    {
      type: 'paragraph',
      text: 'Initiate Calibration had one hero object: the prismatic cube, singular and interrupting. Activate Immersion is populated. There is a large glass architectural panel — transparent, refractive, catching imaginary light. A chrome sphere in the upper right: solid, reflective, gravityless. A cream cylindrical form below, matte and soft against the gloss of everything around it. And a red translucent torus curving across the right half of the frame, the warmest and most dynamic element in the composition.',
    },
    {
      type: 'paragraph',
      text: 'These are not random objects. They are a deliberate materials sample — glass, metal, ceramic, translucent plastic. Each one represents a different way that surfaces interact with light, which is the core technical concept of XR rendering. In a real-time 3D environment, what you are fundamentally solving is: how does light behave when it hits this surface? The objects in the Activate Immersion backdrop are a visual argument for why that question is worth asking. They look wrong together in the best possible way — too many materials, too many scales, floating in a space that has no floor. That cognitive dissonance is what XR feels like.',
    },
    {
      type: 'pullQuote',
      text: 'The objects in the Activate Immersion backdrop are a visual argument for why rendering is worth caring about. Glass, metal, ceramic, translucent plastic — each one a different way that surfaces interact with light. They look wrong together in the best possible way.',
    },
    {
      type: 'paragraph',
      text: 'The type also inverts. In Calibration, the type was white on black — the maximum contrast of a light source against a void. In Immersion, the type is bold black on the pale blue-grey ground. Same weight, same condensed style, same cinematic scale — but reversed. The typographic system stays consistent; only its relationship to the ground flips. This is what makes the alternation feel like a deliberate series rather than two unrelated events.',
    },

    {
      type: 'heading',
      id: 'the-expert-poster',
      text: 'The Expert Lecture Poster — A Different Register Entirely',
    },
    {
      type: 'paragraph',
      text: 'Activate Immersion was also our first expert lecture, which meant we needed a second poster format we had never designed before: one that featured a real human being. Mr. Akshay Rathod, CEO and Founder of FirebirdVR, was our featured speaker — an industry practitioner who has been building XR systems since 2015 and was serving as co-president of the VRARA Pune Chapter at the time of the event. Designing around a real person introduces a constraint that 3D render compositions never have: you cannot control what the photograph looks like.',
    },
    {
      type: 'media',
      src: activateImmersionPosterImg,
      alt: 'Activate Immersion — Expert Lecture Poster featuring Mr. Akshay Rathod',
      caption:
        "<b>↑ Activate Immersion — Expert Lecture Poster</b> — A completely different register from the backdrop: real photography, red as a dominant accent, structured information hierarchy. The speaker's photograph sits in a rounded square frame, anchoring the left column. A generative AI render of a woman in a VR headset occupies the right — the imagined future the lecture is pointing toward. Date: 25/02/2026, 1 PM, Room 514.",
    },
    {
      type: 'paragraph',
      text: 'The expert lecture poster is striking precisely because it does not look like our other work. The ground is a pale sky blue — softer and lighter even than the backdrop. The dominant accent colour shifts to red: the speaker\'s corporate photography against a red 5G Plus banner background, and a bold crimson "REGISTER NOW" call to action. Red had not appeared in our event materials before this. It is a signal colour — urgent, actionable — and using it specifically for the registration prompt was a deliberate hierarchy decision: the most important action on the poster is impossible to miss.',
    },
    {
      type: 'paragraph',
      text: 'The poster is structured in two columns: left for information, right for aspiration. The speaker\'s photograph, their credentials, the event details — all on the left, laid out with clean horizontal rules and a clear typographic hierarchy. On the right: a generative AI render of a woman wearing a sleek VR headset, looking up and to the right, toward something outside the frame. The speaker on the left is the person who built that world. The figure on the right is the person who will inhabit it. The layout puts them in conversation without a single word of explanation.',
    },
    {
      type: 'paragraph',
      text: 'One small detail worth noting: this poster still carries the "AR/VR SIG" descriptor in the header rather than "XR SIG". This was an early iteration of the branding, before we had fully settled on XR as our preferred shorthand. Looking at it now it reads as a time stamp — a record of where the brand was at that moment. The visual language was already cohesive; the verbal identity was still finding its final form.',
    },

    {
      type: 'heading',
      id: 'what-immersion-established',
      text: 'What Immersion Established',
    },
    {
      type: 'paragraph',
      text: 'After two events, the design system had proven something important: it had range. Calibration had shown the dark end — void, terminal, initialising. Immersion had shown the light end — open, volumetric, populated with objects. Both events were unmistakably Hyperspace XR: the brand marks were consistent, the 3D-object-as-protagonist approach held, the cinematic scale of the type held. But they felt different from each other in exactly the way two chapters of the same book feel different. Same author, different rooms.',
    },
    {
      type: 'paragraph',
      text: 'That range was not just an aesthetic achievement. It solved a practical problem: it meant that each new event could feel like an event, not like a repost. If every backdrop looked the same, a student who had been to Calibration would glance at the Immersion backdrop and already feel like they had seen it. The alternation ensures that every new visual is genuinely new — while still being, unmistakably, ours.',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · June 2026',
    },
  ],
};

export default post;
