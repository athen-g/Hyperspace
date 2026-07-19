import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import { NEWS_ITEMS, CATEGORIES } from '../../constants/news'
import Contact from './Contact'
import Footer from './Footer'

function PlaceholderIcon() {
    return (
        <svg viewBox="0 0 200 140" fill="none">
            <rect x="20" y="40" width="160" height="70" rx="10" stroke="#8a8a92" strokeWidth="1.4" />
            <rect x="35" y="55" width="130" height="40" rx="4" stroke="#8a8a92" strokeWidth="1.1" />
            <circle cx="100" cy="30" r="9" stroke="#8a8a92" strokeWidth="1.4" />
        </svg>
    )
}

export default function News() {
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('All')
    const revealRefs = useRef([])
    revealRefs.current = []

    const addRevealRef = (el) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
    }

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add('news-reveal--in'), i * 60)
                        io.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15 }
        )
        revealRefs.current.forEach((el) => io.observe(el))
        return () => io.disconnect()
    }, [activeCategory])

    const featured = NEWS_ITEMS.find((item) => item.featured)
    const rest = NEWS_ITEMS.filter((item) => !item.featured)
    const filtered =
        activeCategory === 'All' ? rest : rest.filter((item) => item.category === activeCategory)

    const goToArticle = (id) => navigate(`/news/${id}`)

    return (
        <>
            <Header />

            <main className="news-page">
                <BackgroundLines />

                <div className="news-page__content mt-[92px]">
                    <section className="news-hero">
                        <div className="news-hero__main">
                            <div className="news-eyebrow">
                                <span className="news-eyebrow__dot" />
                                Live Transmission Log
                            </div>
                            <h1 className="news-title">
                                All <em>News</em>
                                <br />
                                &amp; Signals
                            </h1>
                            <p className="news-hero__sub">
                                All the latest news about Extended Reality. Scouted, gathered and written by the Hyperspace Editorial Desk.
                            </p>
                        </div>

                        <div className="news-hero__side">
                            <div>
                                <div className="news-stat">
                                    <div className="news-stat__num">{String(NEWS_ITEMS.length).padStart(2, '0')}</div>
                                    <div className="news-stat__label">Articles Indexed</div>
                                </div>
                                <div className="news-stat">
                                    <div className="news-stat__num">Weekly</div>
                                    <div className="news-stat__label">Publish Cadence</div>
                                </div>
                            </div>
                            <div className="news-hero__note">
                                Last sync 07·19·2026 — 04:12 UTC
                                <br />
                                Archive maintained by the Hyperspace editorial desk.
                            </div>
                        </div>
                    </section>

                    <div className="news-filters">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`news-pill ${activeCategory === cat ? 'news-pill--active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {featured && (
                        <div className="news-featured-wrap">
                            <article
                                ref={addRevealRef}
                                className="news-featured news-reveal"
                                onClick={() => goToArticle(featured.id)}
                            >
                                <div className="news-featured__media">
                                    {featured.thumbnail ? (
                                        <img
                                            src={featured.thumbnail}
                                            alt={featured.title}
                                            className="news-featured__img"
                                        />
                                    ) : (
                                        <PlaceholderIcon />
                                    )}
                                    <span className="news-scan" />
                                </div>
                                <div className="news-featured__body">
                                    <div className="news-tag-row">
                                        <span className="news-tag">{featured.category}</span>
                                        <span className="news-date">{featured.date}</span>
                                    </div>
                                    <h2>{featured.title}</h2>
                                    <p>{featured.excerpt}</p>
                                    <span className="news-read-link">
                                        Read Article
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
                                        </svg>
                                    </span>
                                </div>
                            </article>
                        </div>
                    )}

                    <div className="news-grid-wrap">
                        <div className="news-grid">
                            {filtered.map((item) => (
                                <article
                                    key={item.id}
                                    ref={addRevealRef}
                                    className="news-card news-reveal"
                                    onClick={() => goToArticle(item.id)}
                                >
                                    <div className="news-card__media">
                                        <span className="news-corner news-corner--tl">
                                            <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
                                        </span>
                                        <span className="news-corner news-corner--tr">
                                            <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
                                        </span>
                                        <span className="news-corner news-corner--bl">
                                            <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
                                        </span>
                                        <span className="news-corner news-corner--br">
                                            <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
                                        </span>
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="news-card__img"
                                            />
                                        ) : (
                                            <PlaceholderIcon />
                                        )}
                                    </div>
                                    <div className="news-card__body">
                                        <div className="news-tag-row">
                                            <span className="news-tag">{item.category}</span>
                                            <span className="news-date">{item.date}</span>
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{item.excerpt}</p>
                                        <span className="news-read-link news-read-link--card">
                                            Read Article
                                            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
                                            </svg>
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Contact />
            <Footer />
        </>
    )
}
