import React from 'react';
import { useMediaQuery } from 'react-responsive';

// Turns "line one\nline two" into React nodes with real <br /> tags,
// same as the manual <br /> that used to live in the JSX.
const renderMultiline = (text = '') =>
  text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

/**
 * hero shape:
 * {
 *   eyebrow: [{ text: '—— Design Journal' }, { text: 'HYPERSPACE XR SIG' }],
 *   title: [
 *     { text: 'CRAFTING VISUAL\nIDENTITY: ', variant: 'pink' },
 *     { text: 'FROM\nBLANK CANVAS TO\nBRAND UNIVERSE', variant: 'white' },
 *   ],
 *   subtitle: '...',
 *   author: { avatarSrc, name, role, date, readTime },
 * }
 */
const BlogHero = ({ hero }) => {
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <section className={`blog-hero ${isMobile768 ? '!px-4 !py-8' : ''}`}>
      <div className="blog-hero-bg"></div>
      <div className="blog-hero-orb blog-hero-orb-1"></div>
      <div className="blog-hero-orb blog-hero-orb-2"></div>
      <div className="blog-hero-orb blog-hero-orb-3"></div>

      <div className="blog-hero-content">
        <div className={`blog-hero-eyebrow ${isMobile768 ? '!text-[11px] !gap-2 !mb-4 flex-wrap' : ''}`}>
          {hero.eyebrow.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="bullet">·</span>}
              <span>{item.text}</span>
            </React.Fragment>
          ))}
        </div>

        <h1 className={`blog-hero-title ${isMobile768 ? '!text-[32px] !leading-tight !mb-6' : ''}`}>
          {hero.title.map((segment, i) => (
            <span
              key={i}
              className={segment.variant === 'pink' ? 'pink-text' : 'white-text'}
            >
              {renderMultiline(segment.text)}
            </span>
          ))}
        </h1>

        <p className={`blog-hero-subtitle ${isMobile768 ? '!text-[13px] !mb-6' : ''}`}>{hero.subtitle}</p>

        <div className={`blog-hero-author-meta ${isMobile768 ? 'flex-wrap gap-2' : ''}`}>
          <div className="author-avatar-img-wrapper">
            <img
              src={hero.author.avatarSrc}
              alt="Avatar"
              className="author-avatar-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="author-text-info">
            <span className="author-name">{hero.author.name}</span>
            <span className="meta-sep">·</span>
            <span className="author-role-date">{hero.author.role}</span>
            <span className="meta-sep">·</span>
            <span className="author-date">{hero.author.date}</span>
            <span className="meta-sep">·</span>
            <span className="read-time">{hero.author.readTime}</span>
          </div>
        </div>
      </div>

      <div className="hero-fade-bottom"></div>
    </section>
  );
};

export default BlogHero;
