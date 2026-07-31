import React from 'react';
import { useParams } from 'react-router-dom';
import BlogPostLayout from './blog/BlogPostLayout';
import BlogComingSoon from './BlogComingSoon';

// Registry of built blog posts keyed by their slug
import blogPart1 from '../content/posts/blog_part1_initiate_calibration';
import blogPart2 from '../content/posts/blog_part2_activate_immersion';
import blogPart3 from '../content/posts/blog_part3_render_creation';
import blogPart4 from '../content/posts/blog_part4_brand_universe';
import blogPart5 from '../content/posts/blog_part5_design_language';

const POSTS_REGISTRY = {
  [blogPart1.slug]: blogPart1,
  [blogPart2.slug]: blogPart2,
  [blogPart3.slug]: blogPart3,
  [blogPart4.slug]: blogPart4,
  [blogPart5.slug]: blogPart5,
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

