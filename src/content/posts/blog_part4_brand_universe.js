import initiateCalibrationBackdropImg from '../../assets/images/event-backdrops/initiate-calibration.jpg';
import activateImmersionBackdropImg from '../../assets/images/event-backdrops/activate-immersion.png';
import renderCreationBackdropImg from '../../assets/images/event-backdrops/render-creation-workshop-backdrop.jpg';
import accessGrantedImg from '../../assets/images/recruitment/access-granted.jpg';
import recruitmentImg from '../../assets/images/recruitment/recruitment-2026.jpg';

const post = {
  slug: 'crafting-visual-identity-brand-universe',

  tags: ['Design', 'Visual Identity', 'XR', 'Brand'],

  hero: {
    eyebrow: [{ text: '—— Design Journal · Part 4 of 5' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'THE BRAND\nUNIVERSE: ', variant: 'pink' },
      { text: 'WHEN DESIGN\nBECOMES\nA SYSTEM', variant: 'white' },
    ],
    subtitle:
      'A poster looks good. A brand system makes every new poster look inevitable. This is the part of the story where individual pieces stop being individual — and start becoming something larger than themselves.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace XR SIG',
      date: 'June 30, 2026',
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
        category: 'Design Journal · Part 2',
        title: 'Activate Immersion — Crossing the Threshold',
        date: 'June 16, 2026',
        href: '#crafting-visual-identity-activate-immersion',
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
      id: 'physical-presence',
      text: 'Physical Presence — When Pixels Hit Paper',
    },
    {
      type: 'paragraph',
      text: 'There is a test that every digital design eventually has to face: print. Not because print is more important than a screen, but because it is less forgiving. A poster on a phone screen renders at whatever quality the JPEG allows. A poster on a wall, under fluorescent lighting, at the size of a chair back, reveals every compromise. Gradients that looked smooth become banded. Shadows that read clearly at phone scale disappear entirely. Text that felt large enough becomes ambiguous.',
    },
    {
      type: 'paragraph',
      text: 'From the beginning, we designed knowing our backdrops would go on projection screens in lecture halls, and our posters would go on physical notice boards across campus. This shaped decisions that might otherwise seem like stylistic preferences. The reason our type is always large — boldly, sometimes uncomfortably large — is that it has to work at both ends: thumbnail on a phone, and 6-foot projection in Room 514. The reason our 3D objects have such high internal contrast — bright specular highlights against deep shadows — is that those contrasts survive compression, projection, and bad lighting in a way that subtle, low-contrast renders do not.',
    },
    {
      type: 'paragraph',
      text: 'The result is a visual language that is built for robustness as much as for beauty. Every element earns its place not just compositionally but functionally: if it cannot survive being photographed, screenshotted, forwarded, printed on 80 GSM paper and taped to a door, it does not belong in the composition. This is a constraint that quietly disciplines every decision.',
    },

    {
      type: 'heading',
      id: 'two-worlds',
      text: 'Two Worlds, One Brand',
    },
    {
      type: 'paragraph',
      text: 'By the time Render Creation had finished, Hyperspace XR\'s visual output had accumulated into something that was clearly and unmistakably a brand — not just a collection of well-made posters. And that brand had, by this point, organised itself into two distinct sub-worlds that anyone who had been paying attention could recognise on sight.',
    },
    {
      type: 'posterGrid',
      images: [
        { src: recruitmentImg, alt: 'We\'re Recruiting — white ground, holographic forms' },
        { src: accessGrantedImg, alt: 'Access Granted — white holographic, terminal language' },
      ],
      caption:
        '<b>↑ The Recruitment World</b> — Every recruitment piece lives on a white or near-white ground with holographic liquid chrome forms. Warm, editorial, inviting. The visual signal that Hyperspace XR is looking for people.',
    },
    {
      type: 'paragraph',
      text: 'The recruitment sub-brand is the light world: white grounds, holographic liquid chrome forms in lavender, cyan, and iridescent pink-silver, editorial serif headlines. It is intentionally approachable — designed to attract students who might not yet know what XR means, who might not yet consider themselves the kind of person who joins a technical SIG. The visual language says: this is beautiful, this is welcoming, come and find out what it is.',
    },
    {
      type: 'posterGrid',
      images: [
        { src: initiateCalibrationBackdropImg, alt: 'Initiate Calibration — black void, prismatic cube' },
        { src: activateImmersionBackdropImg, alt: 'Activate Immersion — pale blue, floating objects' },
        { src: renderCreationBackdropImg, alt: 'Render Creation — deep violet, glass figure, orbital rings' },
      ],
      caption:
        '<b>↑ The Event World</b> — Three backdrops, alternating dark and light registers. The ground flips between events; the typographic system, the 3D hero object approach, and the brand marks hold constant. Each event feels like its own chapter while remaining unmistakably part of the same series.',
    },
    {
      type: 'paragraph',
      text: 'The event world is the immersive world: alternating dark and light grounds, massive type, a single protagonist 3D object dominating the composition, technical and terminal language in the details. It is designed for people who are already inside Hyperspace XR — students who have registered, who are sitting in the room, who are looking at the backdrop on the screen while they wait for the session to begin. This visual language does not need to attract. It needs to make them feel like they are somewhere that takes craft as seriously as they do.',
    },
    {
      type: 'pullQuote',
      text: 'The recruitment world says: come and find out what this is. The event world says: you are already inside it. Two registers, one brand — each one doing a job the other cannot.',
    },

    {
      type: 'heading',
      id: 'cumulative-effect',
      text: 'The Cumulative Effect',
    },
    {
      type: 'paragraph',
      text: 'The most important thing I have learned leading design for Hyperspace XR is this: a brand is not any single piece. A brand is what accumulates between pieces — the pattern that emerges when you put everything side by side and notice that, despite the variety, despite the alternation of dark and light, despite the shift from one 3D material to another, it all reads as the work of the same intelligence. That consistency is not accidental. It is the result of decisions made at the level of the system rather than the level of the individual poster.',
    },
    {
      type: 'paragraph',
      text: 'The decisions that create that consistency are often invisible when you are looking at any one piece. The brand marks — logo, college crest — always positioned identically in the header. The type always set at the largest scale the format allows. The 3D hero object always interrupting or interacting with the type rather than sitting beside it. The terminal language always threading through the event detail text. Pink always reserved for core leadership. These rules are not written down anywhere. They emerged from practice and were reinforced by repetition until they became instinct.',
    },
    {
      type: 'paragraph',
      text: 'Part 5 of this series — which follows directly — is an attempt to make those invisible decisions visible: a complete map of the design language as it stands today, where it came from, how it changed between the first We\'re Hiring poster and the Render Creation backdrop, and what it tells us about where the visual identity of Hyperspace XR is going next.',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · June 2026',
    },
  ],
};

export default post;
