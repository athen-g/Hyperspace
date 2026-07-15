import React from 'react';

/**
 * Pulls every `heading` block out of a post's content array, in order.
 * This is what powers the sidebar Table of Contents automatically —
 * you never have to hand-write ToC links again.
 */
export const getHeadingsFromContent = (blocks = []) =>
  blocks
    .filter((block) => block.type === 'heading')
    .map(({ id, text }) => ({ id, text }));

/**
 * Lets blog copy use a tiny inline markup for emphasis without needing
 * real JSX in the content data:
 *
 *   "Our first event was <b>Initiate Calibration</b>, and it went well."
 *
 * becomes a <strong className="blog-strong"> exactly like the original
 * hand-written <strong style={{ color: 'var(--color-text-primary)', ... }}>.
 * Add `.blog-strong { color: var(--color-text-primary); font-weight: 600; }`
 * to your stylesheet once, and every post gets it for free.
 */
export const parseInlineMarkup = (text = '') => {
  const parts = text.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<b>(.*)<\/b>$/s);
    if (match) {
      return (
        <strong className="blog-strong" key={i}>
          {match[1]}
        </strong>
      );
    }
    return part;
  });
};
