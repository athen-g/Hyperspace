import React, { useEffect } from 'react';
import initiateCalibrationImg from '../assets/photos/initiate-calibration.jpg';
import activateImmersionImg from '../assets/photos/activate-immersion.png';
import renderCreationWorkshopBackdropImg from '../assets/photos/render-creation-workshop-backdrop.jpg';
import renderCreationImg from '../assets/photos/render-creation.jpg';
import recruitmentImg from '../assets/photos/recruitment 2026.jpg';
import accessGrantedImg from '../assets/photos/access-granted.jpg';

import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';


const BlogPage = () => {
  useEffect(() => {
    // Scroll to top when page is rendered
    window.scrollTo(0, 0);

    // Table of contents IntersectionObserver
    const tocLinks = document.querySelectorAll('.toc-list a');
    const headings = [];

    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) headings.push(el);
      }
    });

    if (headings.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tocLinks.forEach(link => link.classList.remove('toc-active'));
            const activeLink = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('toc-active');
          }
        });
      }, { rootMargin: '-20% 0px -75% 0px' });

      headings.forEach(h => observer.observe(h));
      return () => {
        headings.forEach(h => observer.unobserve(h));
      };
    }
  }, []);

  return (
    <div className="blog-page-wrapper">
      <Header />
      <BackgroundLines />
      {/* ============================================================
BLOG HERO SECTION
FIGMA NOTE: min-height 90vh. Dark gradient bg + animated glow orbs.
Three orbs: 520px violet (top-right), 380px cyan (bottom-left), 250px pink (mid).
Content: animate fade-in + translateY(30px), staggered by 0.1s per element.
============================================================ */}
      <section className="blog-hero">
        <div className="blog-hero-bg"></div>
        <div className="blog-hero-orb blog-hero-orb-1"></div>
        <div className="blog-hero-orb blog-hero-orb-2"></div>
        <div className="blog-hero-orb blog-hero-orb-3"></div>

        <div className="blog-hero-content">
          <div className="blog-hero-eyebrow">
            <span className="eyebrow-left">Design Journal</span>
            <span className="eyebrow-right">Hyperspace XR SIG</span>
          </div>

          <div className="blog-hero-main-layout">
            <div className="blog-hero-left">
              <h1 className="blog-hero-title">
                <span className="title-highlight">Crafting Visual Identity:</span>
                <span className="title-normal"> From Blank Canvas to Brand Universe</span>
              </h1>
              
              <div className="blog-hero-meta">
                <div className="author-avatar">AG</div>
                <div>
                  <div className="author-name">Atharva Ghule</div>
                  <div className="author-role-date">
                    Design Head, Hyperspace SIG
                    <span className="mx-2 text-[var(--text-faint)]">·</span>
                    May 30, 2026
                    <span className="mx-2 text-[var(--text-faint)]">·</span>
                    12 min read
                  </div>
                </div>
              </div>
            </div>

            <div className="blog-hero-right">
              <p className="blog-hero-subtitle">
                A behind-the-scenes look at how our design team translates the language of extended reality into a cohesive,
                immersive visual world — one poster, backdrop, and banner at a time.
              </p>
            </div>
          </div>
        </div>
        <div className="blog-hero-fade-bottom"></div>
      </section>

      {/* ============================================================
     BLOG BODY — Two-column layout
     FIGMA NOTE: max-width 1320px, grid 1fr 320px, gap 5rem.
     Mobile: single column. Sidebar sticky at top: 88px.
============================================================ */}
      <div className="blog-body">

        {/* ── MAIN ARTICLE COLUMN ── */}
        <article className="blog-main">

          <span className="tag-pill">Design</span>
          <span className="tag-pill">Visual Identity</span>
          <span className="tag-pill">XR</span>

          {/* ============================================================
         SECTION 1 — INTRODUCTION
         FIGMA NOTE: First section. ID used for ToC. H2 gradient violet→cyan.
    ============================================================ */}
          <h2 id="intro">The Weight of a Blank Canvas</h2>

          <p>There is a particular kind of pressure that comes with being the design team for a SIG called Hyperspace XR.
            The name alone sets expectations — it evokes the infinite, the dimensional, the boundary-dissolving world of
            extended reality. And before we can build any of that in Unity, before our developers write a single line of
            code, our team has to build it visually. Every poster someone stops to read, every backdrop that fills a lecture
            hall screen, every banner hanging at an event entrance — these are the first impressions of Hyperspace XR. They
            are the brand before the experience.</p>

          <p>I joined Hyperspace XR as Design Head with one clear mandate: make people feel something before they even step
            into the room. Not just excitement — that's easy. I wanted the feeling of standing at the threshold of another
            world. That's what XR is, after all. Augmented reality asks you to see your world differently. Virtual reality
            asks you to leave it entirely. Mixed reality blurs the border. So our design language had to do the same thing —
            blur the border between the familiar and the extraordinary.</p>

          <p>This is the story of how we built that visual universe, piece by deliberate piece.</p>

          {/* ============================================================
         SECTION 2 — PHILOSOPHY
    ============================================================ */}
          <h2 id="philosophy">The Philosophy: Futuristic, Grounded, Immersive</h2>

          <p>The first thing I told our design team when we sat down to define our visual identity was this: we are not
            making "tech posters". Tech posters have gradients, sans-serifs, and the word "innovative" somewhere. We were
            making world-building artifacts. Every visual we produce is a fragment of a larger universe — the Hyperspace XR
            universe — and it needs to feel cohesive, cinematic, and lived-in.</p>

          <p>Our philosophy settled into a few core principles fairly quickly. Dark and immersive — almost everything sits
            on near-black backgrounds. Not pure black, which reads as a void and kills any sense of depth, but a deep
            blue-black that feels like the moment before a headset boots up. Glowing accents — violets, electric cyans, and
            the occasional hot pink of our logo — punctuate the darkness the way LEDs punctuate a server room or distant
            stars punctuate the night sky. Cinematic and large-scale — we design for projection screens and event backdrops
            before we design for phone screens, which means compositions are bold, typography is massive, and every element
            earns its place in the frame.</p>

          <div className="pull-quote">
            <p>Every visual we produce is a fragment of a larger universe — and it needs to feel cohesive, cinematic, and
              lived-in. We are not making tech posters. We are making world-building artifacts.</p>
          </div>

          <p>We drew our conceptual inspiration from the feeling of entering another world — which is, quite literally, the
            premise of XR. That liminal moment when a headset goes from the real world to the virtual one. That breath-held
            second before a new environment loads. We wanted our design language to live permanently in that moment: the
            threshold, the in-between, the place where one reality ends and another begins.</p>

          {/* ============================================================
         SECTION 3 — INITIATE CALIBRATION
         FIGMA NOTE: 16:9 media block follows. Actual event backdrop image.
         Container: border-radius 12px, border 1px rgba(255,255,255,0.08).
         Hover: scale 1.006, box-shadow violet glow.
    ============================================================ */}
          <h2 id="backdrops">Event Backdrops — The First Slide Is Everything</h2>

          <p>The first slide of an event is a statement. It is what the audience stares at for ten minutes while people find
            their seats, while microphones get adjusted, while the room fills with the ambient noise of anticipation. It has
            to carry that weight. It cannot be an afterthought — and for Hyperspace XR, it never is.</p>

          <p>Our very first flagship event gave us our first real test: the <strong
            style={{ color: "var(--text-primary)", fontWeight: "600" }}>Initiate Calibration</strong> induction. The name alone
            told us everything we needed to know about the visual direction. "Calibration" is a technical word — the process
            of adjusting a system before it can be trusted to operate correctly. To "initiate" it is to begin that
            adjustment. It's the moment before you can trust what you're seeing. That felt perfect for an induction event:
            new members, new systems, everything initializing.</p>

          <div className="media-block">
            {/* FIGMA NOTE: IMAGE SLOT — "Initiate Calibration" event backdrop.
           Replace src with actual image in Figma. Aspect ratio: 16:9.
           Container: border-radius 12px, border 1px rgba(255,255,255,0.08).
           Design: jet black bg, massive white condensed type, holographic prism cube centre. */}
            <img
              src={initiateCalibrationImg}
              alt="Initiate Calibration — Event Backdrop and First Slide" />
            <div className="media-caption">
              <strong>↑ Initiate Calibration</strong> — Induction event backdrop. Pure black ground, massive white condensed
              type bisected by a prismatic holographic cube. The visual tension of a system mid-initialization. Presented by
              Hyperspace SIG, with special guests Team Virtuverse.
            </div>
          </div>

          <p>The design I arrived at was almost brutally simple in its concept and complex in its execution. Jet black —
            nearly void-black — as the full-bleed background. The event title rendered in the largest possible white type,
            bold and condensed, spanning the full width of the frame. And cutting through that title, displacing it,
            refracting it: a holographic, prism-like 3D cube rendered in iridescent green, red, and gold — the kind of
            object that looks like it does not fully belong in our physical world. The cube sits at the center of the
            composition not because it is decorative, but because it is the protagonist. It is the thing being calibrated.
            It is the new reality trying to insert itself into the familiar one.</p>

          <p>The tension in that design is deliberate. The text is interrupted — literally broken by the intrusion of the 3D
            object — because the XR world interrupts the real one. The system is initializing. Something is about to change.
            When that image went up on the projector screen as the first slide of the event, the room felt different. I
            heard people quietly say "wait, what is this?" as they took their seats. That's exactly what we wanted.</p>

          {/* ============================================================
         SECTION 4 — ACTIVATE IMMERSION
         FIGMA NOTE: 16:9 media block — "Activate Immersion" backdrop.
         Design: light blue-grey bg, bold black condensed type, 3D objects floating
         (chrome sphere, glass panel, cream cylinder, red torus).
    ============================================================ */}
          <h2 id="immersion">Activate Immersion — Crossing the Threshold</h2>

          <p>If Initiate Calibration was the tension before entry, <strong
            style={{ color: "var(--text-primary)", fontWeight: "600" }}>Activate Immersion</strong> was the act of crossing
            through. Our second major event backdrop had to communicate something fundamentally different — not
            anticipation, but arrival. Full immersion, activated.</p>

          <div className="media-block">
            {/* FIGMA NOTE: IMAGE SLOT — "Activate Immersion" event backdrop.
           Aspect ratio: 16:9. 
           Design: light blue-grey environment, bold black ACTIVATE IMMERSION type,
           floating 3D objects (chrome sphere, glass panel, red torus, cream cylinder). */}
            <img
              src={activateImmersionImg}
              alt="Activate Immersion — Event Backdrop" />
            <div className="media-caption">
              <strong>↑ Activate Immersion</strong> — Second event backdrop. Light blue-grey ground, bold condensed black
              type, 3D sculptural objects mid-float. Where Calibration was tension and darkness, Immersion is arrival and
              light.
            </div>
          </div>

          <p>The visual energy shift between Calibration and Immersion was intentional and significant. Where Calibration
            used darkness and interruption to create tension, Immersion broke into a completely different register. A light,
            almost clinical blue-grey environment — the interior of a digital world, already booted up and waiting. Bold
            black condensed type: ACTIVATE IMMERSION, set at the kind of scale that looks almost aggressive on a projection
            screen. And floating through the composition: 3D sculptural objects in various materials and forms — a mirrored
            glass distortion panel, a chrome sphere, a matte cream cylinder, a translucent red torus.</p>

          <p>Each object came from a different material language, yet all shared the same physical space — because that is
            what the XR world does. It is a space where different realities coexist. Where a chrome sphere and a clay torus
            can exist side by side with the same physical weight. The typography is huge and confident because at this
            point, you are no longer hesitating at the threshold. You are in.</p>

          <div className="pull-quote">
            <p>The XR world is a space where different realities coexist — where a chrome sphere and a clay torus can share
              the same frame with equal physical weight. Immersion is not a metaphor. It is the design itself.</p>
          </div>

          {/* ============================================================
         SECTION 5 — RENDER CREATION
         FIGMA NOTE: 16:9 landscape backdrop + 2-up portrait poster grid.
         Backdrop design: dark violet-purple, wave mesh bg, glass crystalline 3D figure.
         Caption notes the glass rendering and Unity context.
    ============================================================ */}
          <h2 id="render-creation">Render Creation — Glass, Unity, and the Feeling of Making</h2>

          <p>Our most technically ambitious backdrop to date was designed for <strong
            style={{ color: "var(--text-primary)", fontWeight: "600" }}>Render Creation</strong>, our Unity-focused workshop
            series. This one required us to think deeply about what Unity means to us — as developers, as creators, as a SIG
            built on the premise that XR is the future of interactive experience.</p>

          <p>Unity is the engine. It is the place where nothing becomes something — where a blank scene becomes a virtual
            world, where a 3D model becomes an interactive object, where physics rules and lighting systems and spatial
            audio all converge into a coherent experience. Rendering in Unity is, in the most literal sense, the act of
            creation. So when we designed the Render Creation materials, we wanted the centrepiece to feel monumental and
            somehow ethereal — like looking at creation itself in the moment it happens.</p>

          <div className="media-block">
            {/* FIGMA NOTE: IMAGE SLOT — "Render Creation" workshop backdrop.
           Aspect ratio: 16:9.
           Design: deep violet-blue environment, flowing parametric wave mesh topology,
           glass 3D crystalline figure (prismatic light refraction), orbiting holographic rings.
           The glass figure refracts the surrounding purple light into rainbow chromatic aberrations. */}
            <img
              src={renderCreationWorkshopBackdropImg}
              alt="Render Creation — Workshop Backdrop with Glass 3D Figure" />
            <div className="media-caption">
              <strong>↑ Render Creation Workshop Backdrop</strong> — Dark violet-purple environment, glowing wave mesh
              topology, holographic glass figure rendered in refracted prismatic light. Unity's creative engine made visible
              and monumental.
            </div>
          </div>

          <p>The choice of a glass-rendered 3D sculptural figure was deliberate on every level. Glass is simultaneously
            transparent and present. It has no colour of its own, yet it transforms whatever light passes through it. It is
            the material of lenses — of the very optics that make VR headsets possible. When we render a form in glass,
            surrounded by flowing digital wave meshes and deep violet space, we communicate something that words cannot
            quite reach: that inside this workshop, inside Unity, light bends. Space is created. Reality is manufactured.
          </p>

          <p>The holographic orbiting rings that surround the central figure reference planetary systems and atomic models
            simultaneously — the macro and micro, the cosmic and the constructed. Everything is in motion, even when still.
            It is one of the pieces I am most proud of, because it manages to be technically specific — this is a Unity
            workshop, this is about 3D development — without losing the sense of wonder that drew us all to XR in the first
            place.</p>

          <div className="poster-grid">
            {/* FIGMA NOTE: 2-up poster grid. Aspect-ratio 3/4 each.
           Left: Render Creation portrait poster. Dark ground, serif italic "Render" script
           over bold caps "CREATION", glass figure centrepiece, QR code + date details.
           Right: Recruitment 2026 poster. Liquid chrome holographic fluid on white, 
           large serif "WE'RE RECRUITING" type in violet. Different aesthetic register. */}
            <div>
              <img
                src={renderCreationImg}
                alt="Render Creation — Portrait Event Poster"
                style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", display: "block", aspectRatio: "3/4", objectFit: "cover" }} />
              <div className="media-caption"><strong>↑ Render Creation</strong> — Portrait poster. Dark ground, italic script
                over bold display caps, glass crystalline centrepiece. Date: 16–17 April, Room 501.</div>
            </div>
            <div>
              <img
                src={recruitmentImg}
                alt="Hyperspace XR — Recruitment Poster 2026"
                style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", display: "block", aspectRatio: "3/4", objectFit: "cover" }} />
              <div className="media-caption"><strong>↑ Recruitment 2026</strong> — Liquid chrome holographic forms on white
                ground. Same brand, lighter register. Management, Technical, Design, and Media teams.</div>
            </div>
          </div>

          {/* ============================================================
         SECTION 6 — POSTER PROCESS
    ============================================================ */}
          <h2 id="poster-process">The Poster Process — Consistency as a Creative Discipline</h2>

          <p>Posters are where our visual language gets stress-tested. An event backdrop is designed once, for one moment,
            for one screen at one resolution. A poster travels — it lives on Instagram, on WhatsApp, on printed notice
            boards, on college screens. It has to hold together across every context while remaining unmistakably Hyperspace
            XR.</p>

          <p>The consistency we aim for is not a rigid template. It is a set of values that guide every decision. Dark
            backgrounds — always, unless the occasion demands otherwise. Typographic hierarchy — a clear distinction between
            the event name, the type, the dates, and the supporting details, each in a different weight and size. Futuristic
            yet clean — no techno-clutter, no excessive gradients, nothing decorative that doesn't earn its place. And
            always, a hero object: something 3D, something physical, something that reminds the viewer that the world of XR
            is about objects that exist in space.</p>

          <p>The challenge of poster design for technical content — workshops, game jams, development sessions — is that
            these are fundamentally "come learn something" events. And learning is not always glamorous. Our job is to make
            the glamorous version of learning so appealing that people want to show up and do the difficult part. We never
            dumb down the content. But we make the invitation irresistible.</p>

          <div className="media-block">
            {/* FIGMA NOTE: IMAGE SLOT — "Access Granted" membership poster.
           Aspect ratio: 16:9 (or show at full column width in portrait).
           Design: holographic fluid chrome on white, structured typographic list of new members,
           terminal-style "SYSTEM STATUS: ONLINE" box at bottom. */}
            <img
              src={accessGrantedImg}
              alt="Hyperspace XR — Access Granted Membership Announcement"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", display: "block" }} />
            <div className="media-caption">
              <strong>↑ Access Granted — Batch HS-02-B</strong> — New member announcement. Holographic fluid forms on white,
              structured team list, terminal-status aesthetic. Nine members added. Initialization complete: 100%.
            </div>
          </div>

          {/* ============================================================
         SECTION 7 — PHYSICAL PRESENCE
    ============================================================ */}
          <h2 id="physical">Decorations & Physical Presence — Bringing the Digital Into the Room</h2>

          <p>There is something deeply satisfying about a design that works in both dimensions — the screen and the physical
            world. When we design event decorations for Hyperspace XR, we are asking a simple but profound question: what
            does our digital universe feel like when it occupies physical space?</p>

          <p>The answer, we discovered, is not about printing our screen designs onto paper and calling it a day. Physical
            space has a different relationship with design. Lighting changes. Scale changes. The viewer moves through it
            rather than scrolling past it. So our physical design language is simultaneously faithful to the visual identity
            and adapted for three-dimensional experience.</p>

          <p>Printed backdrops for event stages use the same deep near-blacks and the same bold typography as our digital
            materials, but at scales that would be overwhelming on a screen. A six-foot banner that says HYPERSPACE XR in
            our display font, backlit by event lighting, commands a room differently than a 1920×1080 slide. Display screens
            at registration desks loop through our event posters and motion graphics. Standees for photo opportunities carry
            our holographic 3D objects at life-scale — suddenly, that crystalline prism from the Initiate Calibration
            backdrop is standing next to you, at eye level, demanding to be photographed.</p>

          <p>Our goal is to make the physical space feel like an extension of the digital brand — so that when someone walks
            in, before they open the event app or check the schedule, they already feel like they are inside something.
            Inside the Hyperspace XR universe.</p>

          {/* ============================================================
         SECTION 8 — BRAND UNIVERSE
    ============================================================ */}
          <h2 id="brand-universe">Building the Brand Universe — The Cumulative Effect</h2>

          <p>Individual posters are not the goal. Individual backdrops are not the goal. The goal is something harder to
            define and more rewarding to achieve: a visual universe that is instantly recognisable, that feels coherent
            across every touchpoint, and that communicates the values of Hyperspace XR before a single word is read.</p>

          <p>We are, I think, getting there. When I see our materials shared across WhatsApp groups and Instagram stories —
            not always with our name attached, sometimes just forwarded from person to person — and people still know it's
            Hyperspace XR, that's when I know the visual language is working. The colour palette, the typographic choices,
            the presence of a 3D hero object, the cinematic dark environment: these have become a signature.</p>

          <p>The process has been cumulative. The first poster established a tone. The second confirmed it. The event
            backdrops expanded it into a larger canvas. The festival posts demonstrated its versatility — our celebration
            posters for Gudi Padwa, Eid, Ram Navami, and Maharashtra Diwas use different visual registers but remain
            unmistakably ours, because the brand language is flexible enough to breathe. Each new piece of work is both a
            standalone object and a brick in a larger wall. And the wall is becoming a building. The building is becoming a
            world.</p>

          <p>There is something valuable that happens when a design language becomes familiar to your audience. They begin
            to anticipate it. They begin to trust it. When a new Hyperspace XR poster drops, our community knows before they
            read it that it will be bold, immersive, and slightly cinematic. That anticipation is a form of trust — and
            trust is the foundation of every brand worth building.</p>

          <div className="section-rule"></div>

          {/* ============================================================
         SECTION 9 — CLOSING
    ============================================================ */}
          <h2 id="closing">Leading the Team — Responsibility, Joy, and What Comes Next</h2>

          <p>Leading the design team of Hyperspace XR is, genuinely, one of the most rewarding things I have done. It comes
            with real responsibility — the decisions our team makes shape how the entire SIG is perceived, and by extension,
            how seriously people take XR as a field of creative and technical practice. That is not something I take
            lightly.</p>

          <p>But it is also, more often than not, pure joy. The joy of watching a design concept evolve from a rough sketch
            into a full-bleed backdrop that fills a lecture hall. The joy of our team pushing each other's ideas further —
            asking "what if we made the type bigger?" or "what if the holographic object was rendered in glass instead of
            metal?" The joy of seeing students stop at a notice board and photograph our poster to send to their friends,
            because they think it looks cool enough to share without any context attached.</p>

          <p>We are always evolving. Our next events are pushing us into new visual territory — more liquid, fluid forms
            alongside our geometric solids; more typographic risk-taking; new ways to integrate our logo mark into
            compositions as a design element rather than just a brand stamp. The Hyperspace XR visual language is not
            finished. It is, like all good design systems, a living thing.</p>

          <p>If you are reading this as a student wondering what design at a technical SIG looks like — this is it. It is
            rigorous and it is creative in equal measure. It is collaborative and it is solitary at 2 AM when a deadline is
            tomorrow. It is systematic and it is entirely made up as we go, in the best possible way. Every blank canvas is
            a question. And every time we face it, that question is the same: what world are we building today?</p>

          <p
            style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.875rem", marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            — Durgesh Khadke, Design Head · Hyperspace XR SIG · Wadia College of Engineering, Department of Computer
            Engineering · May 2026</p>

        </article>

        {/* ── SIDEBAR ── */}
        {/* FIGMA NOTE: Sticky sidebar. top: 88px. Width 320px. flex-col gap 1.5rem.
       Three cards: ToC (elevated violet glass), Author (base glass), Related (base glass). */}
        <aside className="blog-sidebar">

          {/* Table of Contents Card */}
          {/* FIGMA NOTE: Elevated glass card — bg rgba(139,92,246,0.06), border rgba(139,92,246,0.2).
         ToC links: 0.875rem, text-muted. Active: text-primary + border-left violet + bg violet 8%. */}
          <div className="glass-card-elevated">
            <div className="sidebar-label">Contents</div>
            <ul className="toc-list" id="tocList">
              <li><a href="#intro" className="toc-active">The Weight of a Blank Canvas</a></li>
              <li><a href="#philosophy">The Philosophy</a></li>
              <li><a href="#backdrops">Event Backdrops — The First Slide</a></li>
              <li><a href="#immersion">Activate Immersion</a></li>
              <li><a href="#render-creation">Render Creation — Glass &amp; Unity</a></li>
              <li><a href="#poster-process">The Poster Process</a></li>
              <li><a href="#physical">Decorations &amp; Physical Presence</a></li>
              <li><a href="#brand-universe">Building the Brand Universe</a></li>
              <li><a href="#closing">Leading the Team</a></li>
            </ul>
          </div>

          {/* About the Author Card */}
          {/* FIGMA NOTE: Base glass card. Avatar: 52px, gradient pink→violet, Syne 800 initials.
         Name: Syne 700 1rem. Role: JetBrains Mono 0.8rem accent-pink. Bio: 0.85rem text-muted. */}
          <div className="glass-card">
            <div className="sidebar-label">About the Author</div>
            <div className="author-card-avatar">DK</div>
            <div className="author-card-name">Durgesh Khadke</div>
            <div className="author-card-role">Design Head · Hyperspace XR</div>
            <div className="author-card-bio">
              Crafting the visual universe of Hyperspace XR — event backdrops, posters, brand identity, and everything in
              Dhairya is a visual designer and 3D generalist interested in the intersections of spatial user experiences,
              creative coding, and brand strategy in emerging tech.
            </div>
          </div>

          {/* RELATED READS */}
          <div className="glass-card">
            <div className="sidebar-label">Related Reads</div>

            <a className="related-post" href="#">
              <div className="related-thumb">
                <div className="related-thumb-1"></div>
              </div>
              <div className="related-info">
                <div className="related-category">Tech Development</div>
                <div className="related-title">Building Spatial Webs: Transitioning from React DOM to Unity 3D WebGL Spaces</div>
                <div className="related-date">May 12, 2026</div>
              </div>
            </a>

            <a className="related-post" href="#">
              <div className="related-thumb">
                <div className="related-thumb-2"></div>
              </div>
              <div className="related-info">
                <div className="related-category">Design Systems</div>
                <div className="related-title">Designing for Refraction — Visual Physics of Frosted Glass and Chrome Surfaces</div>
                <div className="related-date">April 29, 2026</div>
              </div>
            </a>

            <a className="related-post" href="#">
              <div className="related-thumb">
                <div className="related-thumb-3"></div>
              </div>
              <div className="related-info">
                <div className="related-category">Creative Coding</div>
                <div className="related-title">Procedural Aesthetics — Using Geometry Nodes to Generate Our Brand Assets</div>
                <div className="related-date">April 22, 2026</div>
              </div>
            </a>

          </div>

        </aside>

      </div>
    </div>
  );
};

export default BlogPage;
