import weAreHiringImg from '../../assets/images/recruitment/recruitment-2026.jpg';
import meetTheTeamImg from '../../assets/images/event-posters/meet-the-team.png';
import initiateCalibrationBackdropImg from '../../assets/images/event-backdrops/initiate-calibration.jpg';
import initiateCalibrationPosterImg from '../../assets/images/event-posters/initiate-calibration.png';

const post = {
  slug: 'crafting-visual-identity-initiate-calibration',

  tags: ['Design', 'Visual Identity', 'XR', 'Events'],

  hero: {
    eyebrow: [{ text: '—— Design Journal · Part 1 of 5' }, { text: 'HYPERSPACE XR SIG' }],
    title: [
      { text: 'BEFORE THE\nFIRST SLIDE: ', variant: 'pink' },
      { text: 'BUILDING\nTHE TEAM,\nTHEN THE EVENT', variant: 'white' },
    ],
    subtitle:
      'Every design system needs a first piece. Before Hyperspace XR ever ran an event, we had to build the team that would run it — and design the posters to do that. This is where it all began.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Atharva Ghule',
      role: 'Design Head, Hyperspace XR SIG',
      date: 'June 9, 2026',
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
      id: 'the-first-poster',
      text: 'The First Poster — An Invitation Into the Unknown',
    },
    {
      type: 'paragraph',
      text: 'The very first piece Hyperspace XR ever published was not an event backdrop. It was not a celebration post or a launch announcement. It was a recruitment poster — a call for people to join a team they had never seen do anything yet. That is a specific design problem: you are asking strangers to trust a brand that has no track record, no portfolio, no proof of concept. All you have is the quality of the invitation itself.',
    },
    {
      type: 'paragraph',
      text: 'The We\'re Recruiting poster made a deliberate choice that I still think was the right one: it did not look like a college club poster. It did not use our dark, cinematic event aesthetic — the deep blacks and interrupting 3D objects that would come to define our event materials. Instead, it lived in a completely different register: white ground, liquid holographic chrome forms bleeding in from the edges, a deep purple serif for the headline. Elegant, editorial, approachable. The kind of poster you look at and think "whoever made this takes things seriously".',
    },
    {
      type: 'media',
      src: weAreHiringImg,
      alt: 'Hyperspace XR — We\'re Recruiting Poster, March 2026',
      caption:
        "<b>↑ We're Recruiting</b> — The first piece Hyperspace XR ever published. White ground, liquid holographic chrome forms, deep purple high-contrast serif headline. An editorial register designed to attract, not intimidate. Date: 17 March 2026, Room 503.",
    },
    {
      type: 'paragraph',
      text: 'Looking at it now, what strikes me most is the type choice. The headline — WE\'RE RECRUITING — is set in a high-contrast serif: thick strokes that swell at the curves, hairline serifs that almost disappear. This is editorial typography, the kind you see on magazine covers, not in tech club announcements. That was intentional. We were not trying to signal that we were technical. We were trying to signal that we were serious about craft. A student who noticed that typographic choice before they even read the details would already understand something about what Hyperspace XR values.',
    },
    {
      type: 'paragraph',
      text: 'The holographic liquid forms — iridescent, morphing chrome shapes in lavender and cyan — introduced what would become the recruitment sub-brand\'s consistent material language. These are forms that feel alive, in motion, not-quite-physical. They are the visual equivalent of the word "XR": something that exists between the real and the digital. They float across the white ground without casting shadows, without anchoring to gravity. The white ground itself was a considered choice — stark, clean, institutional enough to read on a physical notice board, but interrupted by something unmistakably otherworldly.',
    },

    {
      type: 'heading',
      id: 'meet-the-team',
      text: 'Meet the Team — The Dark Side of the Brand Appears',
    },
    {
      type: 'paragraph',
      text: 'If the We\'re Recruiting poster was an open door, the Meet the Team poster was the room behind it. This was our first piece on a dark ground — near-black, the deep void-adjacent darkness that would go on to define our event identity. The shift was immediate and deliberate. We had been warm and inviting during recruitment. Now the team existed, the members were committed, and the visual language could show its true register.',
    },
    {
      type: 'media',
      src: meetTheTeamImg,
      alt: 'Hyperspace XR — Meet the Team Announcement',
      caption:
        '<b>↑ Meet the Team</b> — First appearance of the dark ground register. Leadership roles called out in hot pink, team member names in white. The colour hierarchy that encodes the entire structure of the organisation at a glance.',
    },
    {
      type: 'paragraph',
      text: 'The Meet the Team poster introduced something that has quietly persisted through everything we have made since: the use of hot pink — our logo\'s accent colour — as a semantic signal, not just a decorative one. The core leadership roles are set in pink. President. Vice President. Tech Head. Management Head. Design Head. Social Head. Documentation. Every role that carries organisational authority is pink. The team members who report to those roles are white. The colour hierarchy does not just look intentional — it encodes the entire structure of the SIG at a glance, without a single explanatory word.',
    },
    {
      type: 'pullQuote',
      text: 'Pink is not a decorative choice in our system. It is a signal. It marks the people who carry the architecture of the organisation — a typographic shorthand for authority that works without explanation.',
    },
    {
      type: 'paragraph',
      text: 'The list format of the poster — clean, structured, column-aligned — introduced another thread that would reappear later: the terminal aesthetic. Names and roles laid out like system readouts. Structured tabular information that feels less like a social media post and more like a system manifest. We were, without quite naming it yet, building the language of an operating system coming online for the first time.',
    },

    {
      type: 'heading',
      id: 'initiate-calibration',
      text: 'Initiate Calibration — The System Initialises',
    },
    {
      type: 'paragraph',
      text: 'Our first event gave us our first real test: the Initiate Calibration induction. The name told us everything we needed about the visual direction. Calibration is a technical process — the act of adjusting a system before it can be trusted to operate correctly. To initiate it is to begin. It is the moment before you can trust what you\'re seeing. That felt exactly right for a first induction: new members, new systems, everything coming online.',
    },
    {
      type: 'paragraph',
      text: 'We designed two distinct pieces for this event: a wide-format event backdrop for the projection screen, and a portrait poster for announcement and promotion. They share a ground and a mood but live in different visual registers — and looking at them together tells you a lot about how we think about the difference between those two formats.',
    },
    {
      type: 'media',
      src: initiateCalibrationBackdropImg,
      alt: 'Initiate Calibration — Event Backdrop',
      caption:
        '<b>↑ Initiate Calibration — Event Backdrop</b> — Pure black ground. Massive white condensed type spanning the full frame width, physically bisected by a prismatic iridescent cube. The 3D object does not sit beside the type — it interrupts it. The system is mid-initialisation. Special Guests: Team Virtuverse.',
    },
    {
      type: 'paragraph',
      text: 'The backdrop is one of the most formally resolved things we have made. Jet black — nearly void-black — as full bleed. The event title in the largest possible white condensed type, bold enough to read from the back of a lecture hall. And cutting through that title, displacing it, refracting it: a holographic prismatic cube in iridescent green, red, and gold. The cube does not sit beside the text. It sits inside it, bisecting it, interrupting it. INITIATE CALIB — cube — RATION. The 3D object is not decorative. It is a protagonist.',
    },
    {
      type: 'paragraph',
      text: 'That intrusion is the whole idea. XR intrudes on reality — augmented reality overlays the world, virtual reality replaces it. The design literalises that intrusion in the most direct way possible: by placing something that does not belong inside something familiar, and refusing to apologise for it. When this image went up on the projector screen, people who had arrived early and were casually scrolling their phones looked up. That is exactly what we needed it to do.',
    },
    {
      type: 'media',
      src: initiateCalibrationPosterImg,
      alt: 'Initiate Calibration — Event Poster',
      caption:
        "<b>↑ Initiate Calibration — Portrait Poster</b> — Same black ground, different register. A wireframe-rendered VR headset as hero object — technical, structural, not yet fully real. Terminal-language across the details: 'AUTHORIZED NODE CONNECTED', 'ACCESS: OPEN', 'CALIBRATION IS NOT THEORETICAL'. The poster speaks the language of a system boot sequence.",
    },
    {
      type: 'paragraph',
      text: 'The portrait poster takes the same ground and the same mood but moves into a different design register entirely. Where the backdrop was pure typographic force — massive, bold, interrupted — the poster introduces what I think of as our terminal aesthetic for the first time in full. The hero object is a wireframe VR headset: rendered in clay, structural, showing its topology rather than its surface. It is an object that is simultaneously familiar (a real device you might have seen) and exposed, unfinished, not-yet-real. A calibration tool that has not yet been calibrated.',
    },
    {
      type: 'paragraph',
      text: 'The event details on the poster do not read as administrative information. They read as a system readout: AUTHORIZED NODE CONNECTED. TEAM VIRTUVERSE. SIH 2025 NATIONAL FINALISTS. SESSION TIME: 16 FEB // 13:00. LOCATION: 514. ACCESS: OPEN. REQUIREMENTS: SCAN QR TO REGISTER. Every line is a command or a status. The poster is a boot sequence. The event is an initialisation. The language is consistent all the way down.',
    },
    {
      type: 'signature',
      text: '— Atharva Ghule, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer Engineering · June 2026',
    },
  ],
};

export default post;
