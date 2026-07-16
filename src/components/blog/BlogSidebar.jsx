import React from 'react';

/**
 * author shape:  { initials, name, role, bio }
 * related shape: [{ category, title, date, href?, thumbClass? }, ...]
 */
const BlogSidebar = ({ author, related = [] }) => (
  <>
    {author && (
      <div className="glass-card">
        <div className="sidebar-label">About the Author</div>
        <div className="author-card-avatar">{author.initials}</div>
        <div className="author-card-name">{author.name}</div>
        <div className="author-card-role">{author.role}</div>
        <div className="author-card-bio">{author.bio}</div>
      </div>
    )}

    {related.length > 0 && (
      <div className="glass-card">
        <div className="sidebar-label">Related Reads</div>

        {related.map((item, i) => (
          <a className="related-post" href={item.href || '#'} key={i}>
            <div className="related-thumb">
              <div className={item.thumbClass || `related-thumb-${(i % 3) + 1}`}></div>
            </div>
            <div className="related-info">
              <div className="related-category">{item.category}</div>
              <div className="related-title">{item.title}</div>
              <div className="related-date">{item.date}</div>
            </div>
          </a>
        ))}
      </div>
    )}
  </>
);

export default BlogSidebar;
