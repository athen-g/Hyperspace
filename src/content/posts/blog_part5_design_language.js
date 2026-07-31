import weAreHiringImg from '../../assets/images/recruitment/recruitment-2026.jpg';
import meetTheTeamImg from '../../assets/images/event-posters/meet-the-team.png';
import initiateCalibrationBackdropImg from '../../assets/images/event-backdrops/initiate-calibration.jpg';
import initiateCalibrationPosterImg from '../../assets/images/event-posters/initiate-calibration.png';
import activateImmersionBackdropImg from '../../assets/images/event-backdrops/activate-immersion.png';
import activateImmersionPosterImg from '../../assets/images/event-posters/activate-immersion.png';
import accessGrantedImg from '../../assets/images/recruitment/access-granted.jpg';
import renderCreationBackdropImg from '../../assets/images/event-backdrops/render-creation-workshop-backdrop.jpg';
import renderCreationPosterImg from '../../assets/images/event-posters/render-creation.jpg';

const post = {
  slug: 'crafting-visual-identity-design-language',

  tags: ['Design', 'Visual Identity', 'XR', 'Brand', 'Typography'],

  hero: {
    eyebrow: [{ text: '—— Design Journal · Part 5 of 5' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'THE LANGUAGE\nITSELF: ', variant: 'pink' },
      { text: 'HOW OUR\nVISUAL SYSTEM\nEVOLVED', variant: 'white' },
    ],
    subtitle:
      'From a white ground and an editorial serif to deep violet and a glass figure. Everything that changed, everything that held, and everything it tells us about where we are going next — piece by piece, poster by poster.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace XR SIG',
      date: 'July 7, 2026',
      readTime: '10 min read',
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
        category: 'Design Journal · Part 3',
        title: 'Render Creation — Glass, Unity, and a New Batch',
        date: 'June 23, 2026',
        href: '#crafting-visual-identity-render-creation',
        thumbClass: 'related-thumb-3',
      },
    ],
  },

  content: [
    {
      type: 'heading',
      id: 'ground-colour',
      text: '01 — The Ground: From White to Black to Light to Deep Violet',
    },
    {
      type: 'paragraph',
      text: 'The most visible single variable across everything Hyperspace XR has produced is the ground colour — the background that every other element sits on. And the most important thing about it is the pattern it forms across pieces: not a consistent colour, but a deliberate alternation.',
    },
    {
      type: 'paragraph',
      text: 'The recruitment sub-brand always lives on white or near-white. We\'re Recruiting: pure white, holographic chrome forms entering from the edges. Access Granted: white bleeding into soft iridescent gradients. The whiteness is a signal — openness, invitation, approachability. You do not have to already belong to this world to understand a white-ground poster.',
    },
    {
      type: 'posterGrid',
      images: [
        { src: weAreHiringImg, alt: "We're Recruiting — white ground" },
        { src: accessGrantedImg, alt: 'Access Granted — white iridescent ground' },
      ],
      caption:
        '<b>↑ The Recruitment Ground</b> — White, consistently. Not pure clinical white, but white interrupted by holographic liquid forms — alive, in motion, already hinting at something immersive beneath the surface.',
    },
    {
      type: 'paragraph',
      text: 'The event backdrops tell a different story. Initiate Calibration: jet black, pure void. Activate Immersion: pale blue-grey, open sky register. Render Creation: deep violet-purple, warm darkness. The pattern is dark → light → dark, and it is not a coincidence. It is a breath. Each event needs to feel like its own chapter, visually distinct from the one before. The ground alternation achieves this without changing any of the other anchoring elements of the system. The type stays the same weight. The brand marks stay in the same position. The 3D hero object approach stays consistent. Only the ground flips — and that single flip is enough to make each event feel genuinely new.',
    },
    {
      type: 'posterGrid',
      images: [
        { src: initiateCalibrationBackdropImg, alt: 'Initiate Calibration — jet black' },
        { src: activateImmersionBackdropImg, alt: 'Activate Immersion — pale blue-grey' },
        { src: renderCreationBackdropImg, alt: 'Render Creation — deep violet-purple' },
      ],
      caption:
        '<b>↑ The Event Ground Alternation</b> — Black, pale blue-grey, deep violet-purple. The series breathes: dark, light, dark. Each ground is a complete tonal world. Together, they form a rhythm.',
    },
    {
      type: 'paragraph',
      text: 'One detail worth sitting with: the dark grounds are not the same dark. Calibration\'s black is void-adjacent, the absence of all information, the visual equivalent of a blank slate. Render Creation\'s violet-purple is saturated, warm, the darkness of a creative environment — a 3D viewport at midnight, a render farm running overnight. The system has learned, across events, that dark does not mean one thing. It is a register with range.',
    },

    {
      type: 'heading',
      id: 'type',
      text: '02 — Typography: The Variable That Does Not Change',
    },
    {
      type: 'paragraph',
      text: 'Against all the variation in ground colour, 3D materials, and visual register, one thing has remained almost completely stable across the entire series: the typographic approach. Massive. Condensed. Cinematic. Filling as much of the frame as the composition allows.',
    },
    {
      type: 'paragraph',
      text: 'The event title type in every backdrop is set at the largest possible scale — the kind of scale where individual letters become architectural. INITIATE CALIBRATION fills the entire width of the wide-format backdrop frame. ACTIVATE IMMERSION does the same. This is not a stylistic affectation. It is a functional decision: the text has to be readable from the back of a lecture hall, which in Room 514 means from approximately fifteen metres away. At that distance, anything smaller than massive becomes illegible.',
    },
    {
      type: 'media',
      src: initiateCalibrationBackdropImg,
      alt: 'Initiate Calibration — full-width type bisected by the prismatic cube',
      caption:
        '<b>↑ Type at Maximum Scale</b> — Initiate Calibration sets the template: the event title at full frame width, bisected and interrupted by the 3D hero object. The type is not beside the image. It is inside it.',
    },
    {
      type: 'paragraph',
      text: 'But within that consistent approach, there has been evolution. The first pieces — Initiate Calibration backdrop and poster — use type as a monolithic block: one weight, one family, one scale for the headline. By Render Creation, that has changed. The portrait poster headline is a deliberate duet: italic high-contrast serif for "Render", bold condensed display for "CREATION". Two typefaces, two weights, two registers sharing a single headline for the first time. The system discovered, through practice, that typographic contrast within the headline itself was available to it — and used it to signal the shift to a workshop format, which carries a warmer and more collaborative tone than a lecture or induction.',
    },
    {
      type: 'media',
      src: renderCreationPosterImg,
      alt: 'Render Creation — two-typeface headline, the first in the series',
      caption:
        "<b>↑ The First Typographic Duet</b> — Render Creation's portrait poster introduces a two-typeface headline for the first time: italic high-contrast serif 'Render' above, bold condensed display 'CREATION' below. The contrast within the headline mirrors the contrast of what the event itself does: the creativity of making (Render) meeting the discipline of building (CREATION).",
    },
    {
      type: 'paragraph',
      text: 'The type colour follows the ground inversion principle. On dark grounds — Calibration, Render Creation — the headline is white. On the light ground — Immersion — it is bold black. The type and the ground are always in maximum contrast. This rule has held without exception across every event piece in the series.',
    },

    {
      type: 'heading',
      id: 'hero-object',
      text: '03 — The 3D Hero Object: From Solid to Scattered to Glass',
    },
    {
      type: 'paragraph',
      text: 'Every event backdrop in the series has a 3D hero object — a computer-generated form that occupies the compositional centre and does the visual heavy lifting. These objects have changed significantly across events, and tracing that change tells you a lot about how the design language has matured.',
    },
    {
      type: 'media',
      src: initiateCalibrationBackdropImg,
      alt: 'Initiate Calibration — iridescent prismatic cube, solid and interrupting',
      caption:
        '<b>↑ The First Hero Object — Initiate Calibration</b> — A prismatic iridescent cube: solid, opaque, reflective. It does not sit beside the type — it bisects it, physically interrupting the headline mid-word. The object is a protagonist. The type has to work around it.',
    },
    {
      type: 'paragraph',
      text: 'The Initiate Calibration cube is solid and opaque — a single iridescent form in green, red, and gold prismatic light. It has clear edges, a defined silhouette, and one job: to interrupt the type and assert that there is something three-dimensional happening inside this two-dimensional poster. It is the bluntest possible statement of the XR intrusion concept.',
    },
    {
      type: 'media',
      src: activateImmersionBackdropImg,
      alt: 'Activate Immersion — scattered mixed-material floating objects, no single hero',
      caption:
        '<b>↑ The Second Hero — Activate Immersion</b> — No single object this time. A cast: glass panel, chrome sphere, cream capsule, red torus. Four different materials, four different scales, no shared gravity. A materials library floating in atmospheric space.',
    },
    {
      type: 'paragraph',
      text: 'Activate Immersion abandons the single hero for an ensemble. Four objects, four materials, no compositional hierarchy among them. This is the most formally challenging of the three backdrop compositions — it risks reading as cluttered — but the light ground and the generous negative space between objects keeps it legible. The decision to use multiple objects rather than one is, I think, a reflection of what Immersion was as an event: a guest speaker bringing in an entire industry\'s worth of experience, not a single focused induction.',
    },
    {
      type: 'media',
      src: renderCreationBackdropImg,
      alt: 'Render Creation — glass crystalline figure with orbital rings, maximum internal complexity',
      caption:
        '<b>↑ The Third Hero — Render Creation</b> — A glass crystalline figure: transparent, refractive, with dense internal geometry visible from every angle simultaneously. Iridescent orbital rings orbit it at multiple inclinations. The hero object of a design workshop about 3D is itself a piece of advanced 3D art.',
    },
    {
      type: 'paragraph',
      text: 'Render Creation returns to a single hero object, but at a level of visual complexity that the Calibration cube never approached. The glass figure is transparent all the way through — you see its internal skeleton, its refracting edges, its prismatic light scattering from a dozen interior surfaces simultaneously. If the Calibration cube was a statement that 3D objects exist, the Render Creation figure is a demonstration of what they can do when taken seriously. The hero object has grown from an argument into evidence.',
    },
    {
      type: 'pullQuote',
      text: 'The Calibration cube was an argument that 3D objects exist. The Render Creation figure is evidence of what they can do. The hero object across the series has grown from a statement into a demonstration.',
    },

    {
      type: 'heading',
      id: 'terminal-language',
      text: '04 — Terminal Language: The Thread That Connects Everything',
    },
    {
      type: 'paragraph',
      text: 'The most subtle through-line in the entire Hyperspace XR visual system is not visual at all — it is verbal. The terminal language: a set of copy conventions borrowed from command-line interfaces, system readouts, and operating system boot sequences, threaded through the detail text of the event materials.',
    },
    {
      type: 'paragraph',
      text: 'It first appears clearly in the Meet the Team poster, where names and roles are laid out in structured columns like a system manifest — no prose, no introductions, just a clean tabular list of nodes that have been added to the network. It deepens in the Initiate Calibration poster: AUTHORIZED NODE CONNECTED. TEAM VIRTUVERSE. SIH 2025 NATIONAL FINALISTS. SESSION TIME: 16 FEB // 13:00. LOCATION: 514. ACCESS: OPEN. REQUIREMENTS: SCAN QR TO REGISTER. None of these lines are formatted as sentences. They are formatted as system outputs.',
    },
    {
      type: 'media',
      src: initiateCalibrationPosterImg,
      alt: 'Initiate Calibration poster — terminal language in the event details',
      caption:
        "<b>↑ Terminal Language — Initiate Calibration Poster</b> — 'AUTHORIZED NODE CONNECTED'. 'ACCESS: OPEN'. The event details are not administrative text. They are a system boot sequence. The poster is performing the concept the event is about.",
    },
    {
      type: 'paragraph',
      text: 'The terminal language culminates in the Access Granted poster, where it does something even more specific: it closes an arc. SYSTEM STATUS: ONLINE. BATCH NO: HS-02-B. MEMBERS ADDED: 9. INITIALIZATION COMPLETE ████████ 100%. The progress bar is four characters and a percentage. But it is also the end of a sentence that started when the first terminal-language copy appeared on the Meet the Team poster: the system that was assembling itself, node by node, event by event, has now reached full operational capacity. The visual language remembered where it came from, and it paid that off.',
    },
    {
      type: 'media',
      src: accessGrantedImg,
      alt: 'Access Granted — the progress bar closes the arc',
      caption:
        "<b>↑ The Arc Closes — Access Granted</b> — INITIALIZATION COMPLETE ████████ 100%. This line only fully lands if you have been paying attention since Meet the Team. The terminal language is a thread, not a motif. It is telling a story across posters.",
    },

    {
      type: 'heading',
      id: 'pink',
      text: '05 — Pink as Signal, Not Decoration',
    },
    {
      type: 'paragraph',
      text: 'Our logo is hot pink — a vivid, slightly neon magenta-pink that reads immediately and holds its identity against both black and white grounds. From the beginning, we made a decision that would quietly organise the entire visual system: pink is not a decorative accent. It is a semantic signal.',
    },
    {
      type: 'paragraph',
      text: 'The decision was established in the Meet the Team poster and has held since: leadership roles and hierarchy are marked in pink. In Meet the Team, the role labels — PRESIDENT, VICE PRESIDENT, TECH HEAD — are pink; the names beneath them are white. In Access Granted, the team-type headers carry the same logic in a slightly different palette but with the same underlying rule. Pink indicates authority within the Hyperspace XR structure. White indicates membership. The reader does not need a legend to decode this. The colour does the decoding.',
    },
    {
      type: 'media',
      src: meetTheTeamImg,
      alt: 'Meet the Team — pink for leadership, white for members',
      caption:
        '<b>↑ Pink as Hierarchy</b> — Meet the Team establishes the rule that has held across the entire system: pink marks organisational authority. The roles are pink. The names are white. No legend required.',
    },

    {
      type: 'heading',
      id: 'two-sub-brands',
      text: '06 — Two Sub-Brands, One Identity',
    },
    {
      type: 'paragraph',
      text: 'Perhaps the most sophisticated structural decision in the Hyperspace XR visual system is one that was not consciously planned as a system decision at all — it emerged from the constraints of what different pieces need to do. The recruitment materials and the event materials serve completely different audiences at completely different moments. A recruitment poster is trying to attract someone who has no existing relationship with the SIG. An event backdrop is speaking to someone who has already registered, already shown up, already committed.',
    },
    {
      type: 'paragraph',
      text: 'Those two audiences need different visual registers. And so, without explicitly deciding to create a sub-brand system, Hyperspace XR created one. The recruitment world: white grounds, holographic liquid forms, editorial serif headlines, invitation energy. The event world: alternating dark and light grounds, massive condensed type, 3D hero objects interrupting the composition, terminal language in the details, immersion energy. Both worlds carry the same logo, the same college crest, the same pink accent, the same general typographic scale. They are unmistakably from the same brand. But they are not trying to be the same poster.',
    },
    {
      type: 'pullQuote',
      text: 'The recruitment world says: come and find out what this is. The event world says: you are already inside it. Neither one is more important. Both are necessary.',
    },

    {
      type: 'heading',
      id: 'what-comes-next',
      text: 'What Comes Next',
    },
    {
      type: 'paragraph',
      text: 'The design language of Hyperspace XR is not finished. It is a living system — one that each new event will extend, challenge, and occasionally surprise. The alternation logic means the next event backdrop should go light, continuing the dark–light–dark–light breath of the series. The terminal language will return and, knowing what the Access Granted poster did with it, will be asked to do something even more specific the next time. The two-typeface headline introduced in Render Creation is now available as a tool — it will be interesting to see when it reappears and what it will signal when it does.',
    },
    {
      type: 'paragraph',
      text: 'What I am most proud of, looking at the complete body of work gathered in one place, is not any individual piece. It is the fact that the system has a memory. The terminal language remembered Meet the Team when it wrote the Access Granted progress bar. The alternating ground remembered Calibration when it chose Immersion\'s sky register. The glass figure of Render Creation remembered the wireframe headset of the Calibration poster — both objects that show you their structure rather than hiding it. These callbacks are not planned in the sense of being written into a style guide somewhere. They are planned in the deeper sense of a design team that has internalised its own system deeply enough that the right callbacks happen instinctively.',
    },
    {
      type: 'paragraph',
      text: 'That is, I think, what a visual identity actually is, at its most functional: not a set of rules, but a set of instincts. Rules get followed. Instincts get applied — to situations the rules never anticipated, in ways the rules never specified, producing results that feel inevitable even when they are genuinely new. Hyperspace XR is getting there. The series is only a few events old. The instincts are just beginning to form.',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · July 2026',
    },
  ],
};

export default post;
