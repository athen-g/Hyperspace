import React from 'react';
import { parseInlineMarkup } from './blogContentUtils';

/**
 * Renders the article body from a list of content blocks. Supported
 * block `type`s:
 *
 *   heading    { id, text }
 *   paragraph  { text }                         // supports <b>...</b>
 *   pullQuote  { text }
 *   media      { src, alt, caption?, aspectRatio? }
 *   posterGrid { items: [{ src, alt, caption?, aspectRatio? }, ...] }
 *   rule       {}                                // horizontal divider
 *   signature  { text }                          // closing byline
 *
 * To write a new blog post you only ever add objects to this array —
 * no component code changes needed.
 */
const BlogContent = ({ blocks = [] }) => (
  <>
    {blocks.map((block, i) => {
      switch (block.type) {
        case 'heading':
          return (
            <h2 id={block.id} key={block.id}>
              {block.text}
            </h2>
          );

        case 'paragraph':
          return <p key={i}>{parseInlineMarkup(block.text)}</p>;

        case 'pullQuote':
          return (
            <div className="pull-quote" key={i}>
              <p>{parseInlineMarkup(block.text)}</p>
            </div>
          );

        case 'media':
          return (
            <div className="media-block" key={i}>
              <img
                src={block.src}
                alt={block.alt}
                style={
                  block.aspectRatio
                    ? {
                        width: '100%',
                        aspectRatio: block.aspectRatio,
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'block',
                      }
                    : undefined
                }
              />
              {block.caption && (
                <div className="media-caption">
                  {parseInlineMarkup(block.caption)}
                </div>
              )}
            </div>
          );

        case 'posterGrid':
          return (
            <div className="poster-grid" key={i}>
              {block.items.map((item, j) => (
                <div key={j}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'block',
                      aspectRatio: item.aspectRatio || '3/4',
                      objectFit: 'cover',
                    }}
                  />
                  {item.caption && (
                    <div className="media-caption">
                      {parseInlineMarkup(item.caption)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );

        case 'rule':
          return <div className="section-rule" key={i}></div>;

        case 'signature':
          return (
            <p
              key={i}
              style={{
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
                fontSize: '0.875rem',
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              {block.text}
            </p>
          );

        default:
          return null;
      }
    })}
  </>
);

export default BlogContent;
