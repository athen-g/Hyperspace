import React, { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';

import Header from '../Header';
import BackgroundLines from '../ui/BackgroundLines';
import Contact from '../Contact';
import Footer from '../Footer';

import BlogHero from './BlogHero';
import BlogContent from './BlogContent';
import BlogSidebar from './BlogSidebar';
import { getHeadingsFromContent } from './blogContentUtils';

/**
 * The generic blog post page. Give it a `post` data object (see
 * src/content/posts/*.js for the shape) and it renders the full page —
 * hero, tags, article body, auto-generated Table of Contents, author
 * card, and related reads. Nothing here is specific to any one post.
 */
const BlogPostLayout = ({ post }) => {
  const headings = getHeadingsFromContent(post.content);
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    // Scroll to top when the post is rendered
    window.scrollTo(0, 0);

    // Table of contents IntersectionObserver (scroll-spy)
    const tocLinks = document.querySelectorAll('.toc-list a');
    const headingEls = [];

    tocLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) headingEls.push(el);
      }
    });

    if (headingEls.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tocLinks.forEach((link) => link.classList.remove('toc-active'));
              const activeLink = document.querySelector(
                `.toc-list a[href="#${entry.target.id}"]`
              );
              if (activeLink) activeLink.classList.add('toc-active');
            }
          });
        },
        { rootMargin: '-20% 0px -75% 0px' }
      );

      headingEls.forEach((h) => observer.observe(h));
      return () => headingEls.forEach((h) => observer.unobserve(h));
    }
  }, [post]);

  return (
    <>
      <div className="blog-page-wrapper">
        <Header />
        <BackgroundLines />

        <BlogHero hero={post.hero} />

        <div className="blog-body">
          <article className="blog-main">
            {post.tags?.map((tag) => (
              <span className="tag-pill" key={tag}>
                {tag}
              </span>
            ))}

            <BlogContent blocks={post.content} />

            {/* Pagination for parts of the Design Journal */}
            {(() => {
              const journalParts = [
                { partNum: 1, title: 'Initiate Calibration', slug: 'crafting-visual-identity-initiate-calibration' },
                { partNum: 2, title: 'Activate Immersion', slug: 'crafting-visual-identity-activate-immersion' },
                { partNum: 3, title: 'Render Creation', slug: 'crafting-visual-identity-render-creation' },
                { partNum: 4, title: 'Brand Universe', slug: 'crafting-visual-identity-brand-universe' },
                { partNum: 5, title: 'Design Language', slug: 'crafting-visual-identity-design-language' },
              ];
              const currentIndex = journalParts.findIndex(p => p.slug === post.slug);
              if (currentIndex === -1) return null;

              const prevPart = currentIndex > 0 ? journalParts[currentIndex - 1] : null;
              const nextPart = currentIndex < journalParts.length - 1 ? journalParts[currentIndex + 1] : null;

              return (
                <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/10 font-mono text-[14px]">
                  {prevPart ? (
                    <Link to={`/blogs/${prevPart.slug}`} className="text-white/60 hover:text-accent-pink transition-colors flex flex-col items-start gap-1">
                      <span className="text-[11px] text-white/30 tracking-widest uppercase">← Previous Part</span>
                      <span className="font-bold">Part {prevPart.partNum}: {prevPart.title}</span>
                    </Link>
                  ) : <div />}

                  {nextPart ? (
                    <Link to={`/blogs/${nextPart.slug}`} className="text-white/60 hover:text-accent-pink transition-colors flex flex-col items-end text-right gap-1">
                      <span className="text-[11px] text-white/30 tracking-widest uppercase">Next Part →</span>
                      <span className="font-bold">Part {nextPart.partNum}: {nextPart.title}</span>
                    </Link>
                  ) : <div />}
                </div>
              );
            })()}
          </article>

          <aside className="blog-sidebar">
            <div className="glass-card-elevated">
              <div className="sidebar-label">Contents</div>
              <ul className="toc-list" id="tocList">
                {headings.map((h, i) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className={i === 0 ? 'toc-active' : ''}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <BlogSidebar author={post.sidebar?.author} related={post.sidebar?.related} />
          </aside>
        </div>
      </div>

      <Contact />
      <Footer />
    </>
  );
};

export default BlogPostLayout;
