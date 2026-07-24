import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Contact from './Contact'
import Footer from './Footer'

export default function TeamPage() {
    const canvasRef = useRef(null)

    // ── PARTICLES CANVAS ──
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let W, H, particles = []
        let animId

        // violet & pink are swapped to match index.css token roles
        const COLORS = ['rgba(233,30,99,', 'rgba(0,212,255,', 'rgba(136,92,246,']

        function resize() {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        }

        function initParticles() {
            particles = []
            const count = Math.floor((W * H) / 18000)
            for (let i = 0; i < count; i++) {
                const c = COLORS[Math.floor(Math.random() * COLORS.length)]
                particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 1.5 + 0.3,
                    dx: (Math.random() - 0.5) * 0.3,
                    dy: (Math.random() - 0.5) * 0.3,
                    alpha: Math.random() * 0.5 + 0.1,
                    color: c,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                })
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H)
            particles.forEach(p => {
                p.pulse += p.pulseSpeed
                const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = p.color + a + ')'
                ctx.fill()
                p.x += p.dx
                p.y += p.dy
                if (p.x < 0) p.x = W
                if (p.x > W) p.x = 0
                if (p.y < 0) p.y = H
                if (p.y > H) p.y = 0
            })

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 80) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(233,30,99,${0.04 * (1 - dist / 80)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            animId = requestAnimationFrame(draw)
        }

        resize()
        initParticles()
        draw()

        const handleResize = () => { resize(); initParticles() }
        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // ── SCROLL REVEAL ──
    useEffect(() => {
        const revealEls = document.querySelectorAll(
            '.team-page .reveal, .team-page .reveal-left, .team-page .reveal-right, .team-page .reveal-scale, .team-page .stagger'
        )
        const obs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                        obs.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        )
        revealEls.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    // ── CORE MEMBER REVEAL ──
    useEffect(() => {
        const els = [
            ...document.querySelectorAll('.team-page .member-info'),
            ...document.querySelectorAll('.team-page .member-avatar-wrap'),
        ]
        const obs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('visible')
                })
            },
            { threshold: 0.2 }
        )
        els.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    // ── COUNT UP ──
    useEffect(() => {
        function animateCount(el) {
            const target = parseInt(el.dataset.target)
            const duration = 1500
            const start = performance.now()
            function tick(now) {
                const elapsed = now - start
                const progress = Math.min(elapsed / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 3)
                el.textContent = Math.floor(eased * target)
                if (progress < 1) requestAnimationFrame(tick)
                else el.textContent = target
            }
            requestAnimationFrame(tick)
        }

        const countEls = document.querySelectorAll('.team-page .count-up')
        const obs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target)
                        obs.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.5 }
        )
        countEls.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    return (
        <>
            <Header />

            <main className="team-page">
                <BackgroundLines />

                {/* ── HERO ── */}
                <section className="hero">
                    <div className="hero-bg"></div>
                    <canvas ref={canvasRef} id="particles"></canvas>

                    <div className="hero-content">
                        <h1 className="hero-title">
                            <span className="line-1">The</span>
                            <span className="line-2">Team</span>
                        </h1>
                        <p className="hero-sub">
                            Seven core members. Eleven club members. One shared belief — that XR is how
                            the world will learn, create, and connect.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-num">
                                    <span className="count-up" data-target="7">0</span>
                                </div>
                                <div className="stat-label">Core Members</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-num">
                                    <span className="count-up" data-target="11">0</span>
                                </div>
                                <div className="stat-label">Club Members</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-num">
                                    <span className="count-up" data-target="4">0</span>
                                </div>
                                <div className="stat-label">Teams</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-num">
                                    <span className="count-up" data-target="3">0</span>
                                </div>
                                <div className="stat-label">Events</div>
                            </div>
                        </div>
                    </div>

                    <div className="scroll-cue">
                        <span>Scroll to explore</span>
                        <div className="scroll-arrow"></div>
                    </div>
                </section>

                {/* ── CORE TEAM LABEL ── */}
                <div className="section-label reveal">
                    <span className="section-label-text">Core Team</span>
                </div>

                {/* ── CORE MEMBER 01 — ALLEN JOSEPH ── */}
                <section className="core-section s1">
                    <div className="bg-orb"></div>
                    <div className="index-num">01</div>
                    <div className="core-inner">
                        <div className="member-info reveal-left">
                            <div className="member-number">01 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Allen<br />Joseph</h2>
                            <div className="member-role-badge">President</div>
                            <p className="member-desc">
                                Leading Hyperspace XR from its founding vision to operational reality. Allen sets
                                the strategic direction of the SIG, building a community where XR development goes
                                from theory to shipped experience.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Strategy</span>
                                <span className="member-tag">Leadership</span>
                                <span className="member-tag">XR Vision</span>
                                <span className="member-tag">Community</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-right">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div className="member-avatar-dot"></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    <div className="member-avatar-dot-2"></div>
                                </div>
                                <div className="member-avatar av-1">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">AJ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 02 — MANDAR NAVARKAR ── */}
                <section className="core-section s2">
                    <div className="bg-orb"></div>
                    <div className="index-num">02</div>
                    <div className="core-inner">
                        <div className="member-info reveal-right">
                            <div className="member-number">02 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Mandar<br />Navarkar</h2>
                            <div className="member-role-badge">Vice President</div>
                            <p className="member-desc">
                                The operational backbone of Hyperspace XR. Mandar ensures the systems, processes,
                                and people behind every event and initiative are aligned and running at full capacity.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Operations</span>
                                <span className="member-tag">Coordination</span>
                                <span className="member-tag">Planning</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-left">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: 'var(--color-accent-cyan)', boxShadow: '0 0 12px var(--color-accent-cyan)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-pink)', boxShadow: '0 0 10px var(--color-accent-pink)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-2">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">MN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 03 — AKSHATH KULKARNI ── */}
                <section className="core-section s3">
                    <div className="bg-orb"></div>
                    <div className="index-num">03</div>
                    <div className="core-inner">
                        <div className="member-info reveal-left">
                            <div className="member-number">03 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Akshath<br />Kulkarni</h2>
                            <div className="member-role-badge">Management Head</div>
                            <p className="member-desc">
                                Orchestrating the human side of Hyperspace XR — from recruitment drives to event
                                logistics, Akshath makes sure every team member has what they need to do their
                                best work.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">People Ops</span>
                                <span className="member-tag">Logistics</span>
                                <span className="member-tag">Events</span>
                                <span className="member-tag">Recruitment</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-right">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: '#EC4899', boxShadow: '0 0 12px #EC4899' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    {/* --pink in original → --color-accent-violet after swap */}
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-violet)', boxShadow: '0 0 10px var(--color-accent-violet)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-3">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">AK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 04 — AMEYA HUNDEKAR ── */}
                <section className="core-section s4">
                    <div className="bg-orb"></div>
                    <div className="index-num">04</div>
                    <div className="core-inner">
                        <div className="member-info reveal-right">
                            <div className="member-number">04 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Ameya<br />Hundekar</h2>
                            <div className="member-role-badge">Technical Head</div>
                            <p className="member-desc">
                                The engine behind Hyperspace XR's builds. Ameya leads the technical team through
                                Unity development, AR/VR prototyping, and the workshops that give members hands-on
                                XR experience.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Unity</span>
                                <span className="member-tag">AR/VR</span>
                                <span className="member-tag">3D Dev</span>
                                <span className="member-tag">Workshops</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-left">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: '#10B981', boxShadow: '0 0 12px #10B981' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    {/* --cyan stays as-is, no swap */}
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-cyan)', boxShadow: '0 0 10px var(--color-accent-cyan)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-4">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">AH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 05 — ATHARVA GHULE ── */}
                <section className="core-section s5">
                    <div className="bg-orb"></div>
                    <div className="index-num">05</div>
                    <div className="core-inner">
                        <div className="member-info reveal-left">
                            <div className="member-number">05 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Atharva<br />Ghule</h2>
                            <div className="member-role-badge">Design Head</div>
                            <p className="member-desc">
                                Architect of the Hyperspace XR visual universe. Atharva leads the design team in
                                crafting the cinematic, immersive aesthetic that defines everything from event
                                backdrops to social media presence.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Visual Identity</span>
                                <span className="member-tag">UI/UX</span>
                                <span className="member-tag">Brand</span>
                                <span className="member-tag">Motion</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-right">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    {/* --pink in original → --color-accent-violet after swap */}
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: 'var(--color-accent-violet)', boxShadow: '0 0 12px var(--color-accent-violet)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    {/* --violet in original → --color-accent-pink after swap */}
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-pink)', boxShadow: '0 0 10px var(--color-accent-pink)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-5">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">AG</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 06 — MANJEET PATIL ── */}
                <section className="core-section s6">
                    <div className="bg-orb"></div>
                    <div className="index-num">06</div>
                    <div className="core-inner">
                        <div className="member-info reveal-right">
                            <div className="member-number">06 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Manjeet<br />Patil</h2>
                            <div className="member-role-badge">Media Head</div>
                            <p className="member-desc">
                                Capturing and amplifying the Hyperspace XR story. Manjeet leads media strategy,
                                documentation of events, and outreach — making sure the world outside knows what's
                                being built inside.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Content</span>
                                <span className="member-tag">Photography</span>
                                <span className="member-tag">Outreach</span>
                                <span className="member-tag">Social</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-left">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: '#F59E0B', boxShadow: '0 0 12px #F59E0B' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    {/* --violet in original → --color-accent-pink after swap */}
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-pink)', boxShadow: '0 0 10px var(--color-accent-pink)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-6">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">MP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CORE MEMBER 07 — ZOHAIR ALI ── */}
                <section className="core-section s7">
                    <div className="bg-orb"></div>
                    <div className="index-num">07</div>
                    <div className="core-inner">
                        <div className="member-info reveal-left">
                            <div className="member-number">07 / 07 &nbsp;—&nbsp; Core Team</div>
                            <h2 className="member-name">Zohair<br />Ali</h2>
                            <div className="member-role-badge">Documentation</div>
                            <p className="member-desc">
                                The institutional memory of Hyperspace XR. Zohair keeps every event, decision, and
                                milestone on record — building the archive that future generations of the SIG will
                                learn from.
                            </p>
                            <div className="member-tags">
                                <span className="member-tag">Documentation</span>
                                <span className="member-tag">Archives</span>
                                <span className="member-tag">Knowledge Base</span>
                            </div>
                        </div>
                        <div className="member-avatar-wrap reveal-right">
                            <div className="member-avatar-outer">
                                <div className="member-avatar-ring">
                                    <div
                                        className="member-avatar-dot"
                                        style={{ background: '#3B82F6', boxShadow: '0 0 12px #3B82F6' }}
                                    ></div>
                                </div>
                                <div className="member-avatar-ring-2">
                                    {/* --cyan stays as-is, no swap */}
                                    <div
                                        className="member-avatar-dot-2"
                                        style={{ background: 'var(--color-accent-cyan)', boxShadow: '0 0 10px var(--color-accent-cyan)' }}
                                    ></div>
                                </div>
                                <div className="member-avatar av-7">
                                    <div className="member-avatar-glow"></div>
                                    <span className="member-avatar-initials">ZA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION DIVIDER ── */}
                <div className="section-divider"></div>

                {/* ── CLUB MEMBERS LABEL ── */}
                <div className="section-label reveal" style={{ paddingTop: '5rem' }}>
                    <span className="section-label-text">Club Members</span>
                </div>

                {/* ── CLUB MEMBERS ── */}
                <section style={{ paddingBottom: '2rem' }}>
                    <div className="club-section">
                        <div className="club-header reveal">
                            <h2 className="club-title">
                                <span>The People</span>
                                <span>Behind the Work</span>
                            </h2>
                            <p className="club-subtitle">
                                Eleven members across four teams — Tech, Design, Media, and Management —
                                building the XR future together.
                            </p>
                        </div>

                        <div className="team-groups">

                            {/* TECH TEAM */}
                            <div className="team-group tg-tech reveal">
                                <div className="team-group-header">
                                    <div className="team-group-dot"></div>
                                    <div className="team-group-name">Technical Team</div>
                                    <div className="team-group-count">3 Members</div>
                                    <div className="team-group-line"></div>
                                </div>
                                <div className="members-grid stagger">
                                    <div className="member-card">
                                        <div className="card-avatar">MK</div>
                                        <div className="card-info">
                                            <div className="card-name">Manish Ramesh Kale</div>
                                            <div className="card-team">Tech Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">PS</div>
                                        <div className="card-info">
                                            <div className="card-name">Prathamesh Sabale</div>
                                            <div className="card-team">Tech Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">DN</div>
                                        <div className="card-info">
                                            <div className="card-name">Disha Nandalwar</div>
                                            <div className="card-team">Tech Team</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DESIGN TEAM */}
                            <div className="team-group tg-design reveal">
                                <div className="team-group-header">
                                    <div className="team-group-dot"></div>
                                    <div className="team-group-name">Design Team</div>
                                    <div className="team-group-count">2 Members</div>
                                    <div className="team-group-line"></div>
                                </div>
                                <div className="members-grid stagger">
                                    <div className="member-card">
                                        <div className="card-avatar">SB</div>
                                        <div className="card-info">
                                            <div className="card-name">Sampada Bagule</div>
                                            <div className="card-team">Design Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">AM</div>
                                        <div className="card-info">
                                            <div className="card-name">Ayush Mali</div>
                                            <div className="card-team">Design Team</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MEDIA TEAM */}
                            <div className="team-group tg-media reveal">
                                <div className="team-group-header">
                                    <div className="team-group-dot"></div>
                                    <div className="team-group-name">Media &amp; Outreach Team</div>
                                    <div className="team-group-count">2 Members</div>
                                    <div className="team-group-line"></div>
                                </div>
                                <div className="members-grid stagger">
                                    <div className="member-card">
                                        <div className="card-avatar">RN</div>
                                        <div className="card-info">
                                            <div className="card-name">Rushikesh Nununche</div>
                                            <div className="card-team">Media Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">AD</div>
                                        <div className="card-info">
                                            <div className="card-name">Adityaraj Deshmukh</div>
                                            <div className="card-team">Media Team</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MANAGEMENT TEAM */}
                            <div className="team-group tg-management reveal">
                                <div className="team-group-header">
                                    <div className="team-group-dot"></div>
                                    <div className="team-group-name">Management Team</div>
                                    <div className="team-group-count">4 Members</div>
                                    <div className="team-group-line"></div>
                                </div>
                                <div className="members-grid stagger">
                                    <div className="member-card">
                                        <div className="card-avatar">DJ</div>
                                        <div className="card-info">
                                            <div className="card-name">Disha Jain</div>
                                            <div className="card-team">Management Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">RS</div>
                                        <div className="card-info">
                                            <div className="card-name">Rashi Singh</div>
                                            <div className="card-team">Management Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">SJ</div>
                                        <div className="card-info">
                                            <div className="card-name">Shubham Jadhav</div>
                                            <div className="card-team">Management Team</div>
                                        </div>
                                    </div>
                                    <div className="member-card">
                                        <div className="card-avatar">OG</div>
                                        <div className="card-info">
                                            <div className="card-name">Omkar Gadekar</div>
                                            <div className="card-team">Management Team</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── ADMIN GATE LINK ── */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0 2rem' }}>
                    <Link 
                        to="/admin" 
                        className="member-tag"
                        style={{ 
                            textDecoration: 'none', 
                            fontSize: '0.7rem', 
                            padding: '0.5rem 1rem', 
                            opacity: 0.6,
                            cursor: 'pointer'
                        }}
                    >
                        ADMIN PANEL
                    </Link>
                </div>

            </main>

            <Contact />
            <Footer />
        </>
    )
}