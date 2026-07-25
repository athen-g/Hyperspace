import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import { NEWS_ITEMS } from '../../constants/news'
import { ScrollRevealText } from './ui/ScrollRevealText'
import Contact from './Contact'
import Footer from './Footer'


const toParagraphs = (text) =>
  (text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

const buildContentFromLegacy = (article) => {
  const blocks = []
  if (article.image1) blocks.push({ type: 'image', src: article.image1 })
  toParagraphs(article.para1).forEach((text) => blocks.push({ type: 'paragraph', text }))
  if (article.image2) blocks.push({ type: 'image', src: article.image2 })
  toParagraphs(article.para2).forEach((text) => blocks.push({ type: 'paragraph', text }))
  return blocks
}

const getContent = (article) =>
  Array.isArray(article.content) && article.content.length > 0
    ? article.content
    : buildContentFromLegacy(article)

/* Groups a flat content array into renderable sections */
const buildLayoutBlocks = (content) => {
  const blocks = []
  let i = 0

  if (content[i]?.type === 'image') {
    const image = content[i]
    i += 1
    const paragraphs = []
    while (content[i]?.type === 'paragraph') {
      paragraphs.push(content[i])
      i += 1
    }
    blocks.push({ kind: 'hero', image, paragraphs })
  }

  let zigzagCount = 0
  while (i < content.length) {
    if (content[i].type === 'image') {
      const image = content[i]
      i += 1
      const paragraphs = []
      while (content[i]?.type === 'paragraph') {
        paragraphs.push(content[i])
        i += 1
      }
      const [lead, ...rest] = paragraphs
      blocks.push({ kind: 'zigzag', image, lead, rest, reverse: zigzagCount % 2 === 1 })
      zigzagCount += 1
    } else {
      const paragraphs = []
      while (content[i]?.type === 'paragraph') {
        paragraphs.push(content[i])
        i += 1
      }
      blocks.push({ kind: 'standalone', paragraphs })
    }
  }

  return blocks
}

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const estimateReading = (paragraphs) => {
  const words = paragraphs
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const totalSeconds = Math.max(60, Math.round((words / 200) * 60))
  return { totalSeconds, label: `${Math.max(1, Math.round(totalSeconds / 60))} MIN READ` }
}

function CornerFrame() {
  const base = 'tx-corner'
  return (
    <>
      <span className={`${base} tx-corner--tl`}>
        <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
      </span>
      <span className={`${base} tx-corner--tr`}>
        <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
      </span>
      <span className={`${base} tx-corner--bl`}>
        <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
      </span>
      <span className={`${base} tx-corner--br`}>
        <svg viewBox="0 0 16 16"><path d="M1 8V1H8" stroke="#e91e63" strokeWidth="1.6" fill="none" /></svg>
      </span>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const NewsPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' })
  const bodyRef = useRef(null)
  const [progress, setProgress] = useState(0)

  const article = NEWS_ITEMS.find((item) => item.slug === slug || item.id === slug)
  const index = NEWS_ITEMS.findIndex((item) => item === article)

  const content = useMemo(() => (article ? getContent(article) : []), [article])
  const layoutBlocks = useMemo(() => buildLayoutBlocks(content), [content])

  const reading = useMemo(
    () =>
      estimateReading(
        content.filter((block) => block.type === 'paragraph').map((block) => block.text)
      ),
    [content]
  )

  useEffect(() => {
    if (!article) return
    const handleScroll = () => {
      const el = bodyRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = -rect.top
      const pct = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0
      setProgress(pct)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [article])

  if (!article) {
    return (
      <>
        <Header />
        <main className="tx-page">
          <BackgroundLines />
          <div className="tx-page__content">
            <div className="tx-notfound">
              <span className="tx-eyebrow">SIGNAL LOST</span>
              <h1>No Transmission Found</h1>
              <p>This frequency is dead. The article you&apos;re looking for doesn&apos;t exist.</p>
              <button type="button" className="tx-link-btn" onClick={() => navigate('/news')}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Back to News
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  const { category, date, title } = article

  return (
    <>
      <Header />
      <main className="tx-page relative z-10">
        <BackgroundLines />

        <div className={`tx-page__content ${isMobile768 ? 'mt-[110px]' : 'mt-[92px]'}`}>
          {/* ---------------- Masthead ---------------- */}
          <section className={`tx-masthead ${isMobile768 ? '!ml-0 !px-4 !pt-6 !pb-4' : 'ml-[40px]'}`}>
            <div className="tx-eyebrow">
              Transmission {String(index + 1).padStart(3, '0')} — {category}
            </div>
            <h1 className={`tx-title ${isMobile768 ? '!text-[36px] !pl-[10px] leading-tight' : ''}`}>{title}</h1>
            <div className={`tx-masthead__meta ${isMobile768 ? '!text-[14px] !gap-2' : ''}`}>
              <span>{date}</span>
              <span className="tx-meta-dot" />
              <span>{reading.label}</span>
            </div>
          </section>

          {/* ---------------- Spine + Article ---------------- */}
          <section className={`tx-body ${isMobile768 ? '!grid-cols-1 !px-4 !py-4' : ''}`} ref={bodyRef}>
            {!isMobile768 && (
              <div className="tx-spine">
                <div className="tx-spine__track">
                  <div className="tx-spine__fill" style={{ height: `${progress * 100}%` }} />
                  <div className="tx-spine__playhead" style={{ top: `${progress * 100}%` }}>
                    <span className="tx-spine__time">{formatTime(progress * reading.totalSeconds)}</span>
                  </div>
                </div>
                <div className="tx-spine__total">{formatTime(reading.totalSeconds)}</div>
              </div>
            )}

            <article className={`tx-article ${isMobile768 ? '!p-0 !max-w-full' : ''}`}>
              {layoutBlocks.map((block, i) => {
                if (block.kind === 'hero') {
                  return (
                    <div key={i}>
                      {block.image && (
                        <div className={`tx-frame tx-frame--hero ${isMobile768 ? '!w-full !mb-6' : ''}`}>
                          <CornerFrame />
                          <img src={block.image.src} alt={block.image.alt || title} />
                        </div>
                      )}
                      {block.paragraphs.length > 0 && (
                        <div className={`tx-copy tx-copy--hero ${isMobile768 ? ' !p-[10px] !text-[16px] !mb-6' : ''}`}>
                          {block.paragraphs.map((p, j) => (
                            <ScrollRevealText
                              key={j}
                              text={p.text}
                              className="tx-copy__paragraph"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                if (block.kind === 'zigzag') {
                  const hasText = Boolean(block.lead)
                  return (
                    <div key={i}>
                      <div
                        className={`tx-zigzag ${block.reverse ? 'tx-zigzag--reverse' : ''} ${hasText ? '' : 'tx-zigzag--solo'
                          } ${isMobile768 ? '!grid-cols-1 !gap-4 !mb-6' : ''}`}
                      >
                        <div className="tx-zigzag__media">
                          <div className={`tx-frame ${isMobile768 ? '!w-full !mb-2' : ''}`}>
                            <CornerFrame />
                            <img src={block.image.src} alt={block.image.alt || title} />
                          </div>
                        </div>
                        {hasText && (
                          <div className="tx-zigzag__text">
                            <ScrollRevealText
                              className={`tx-copy ${isMobile768 ? '! !p-[10px] !text-[16px] !mb-4' : ''}`}
                              text={block.lead.text}
                            />
                          </div>
                        )}
                      </div>
                      {block.rest.length > 0 && (
                        <div className={`tx-copy ${isMobile768 ? '! !p-[10px] !text-[16px] !mb-6' : ''}`}>
                          {block.rest.map((p, j) => (
                            <p
                              key={j}
                              text={p.text}
                              className='tex-copy__paragraph'
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                // standalone paragraph run — no adjacent image
                return (
                  <div key={i} className={`tx-copy ${isMobile768 ? '! !p-[10px] !text-[16px] !mb-6' : ''}`}>
                    {block.paragraphs.map((p, j) => (
                      <ScrollRevealText
                        key={j}
                        text={p.text}
                      />
                    ))}
                  </div>
                )
              })}

              <div className="tx-end">
                <span className="tx-end__label">— End of Transmission —</span>
                <button type="button" className="tx-link-btn" onClick={() => navigate('/news')}>
                  Back to News
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
      <Contact />
      <Footer />
    </>
  )
}

export default NewsPage
