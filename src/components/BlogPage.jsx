import React from 'react';
import { useParams } from 'react-router-dom';
import BlogPostLayout from './blog/BlogPostLayout';
import BlogComingSoon from './BlogComingSoon';

// Registry of built blog posts keyed by their slug
import craftingVisualIdentity from '../content/posts/craftingVisualIdentity';

const POSTS_REGISTRY = {
  [craftingVisualIdentity.slug]: craftingVisualIdentity,
};

const BlogPage = () => {
  const { slug } = useParams();
  const post = POSTS_REGISTRY[slug];

  if (!post) {
    return <BlogComingSoon slug={slug} />;
  }

  return <BlogPostLayout post={post} />;
};

export default BlogPage;

