// COPY THIS FILE to create a new blog post.
// 1. Rename it (e.g. renderCreationRecap.js)
// 2. Fill in the fields below with your text and images
// 3. Import images at the top, the same way BlogPage.jsx used to
// 4. Point a page/route at this file (see README.md)
//
// You do NOT need to touch any component code to add a new post.

// import myImage from '../../assets/images/.../my-image.jpg';

const post = {
  slug: 'my-new-post',

  tags: ['Tag One', 'Tag Two'],

  hero: {
    eyebrow: [{ text: '—— Category' }, { text: 'YOUR SIG NAME' }],
    title: [
      // Use \n for line breaks within a segment, e.g. 'LINE ONE\nLINE TWO'
      { text: 'YOUR TITLE\nHERE', variant: 'pink' }, // variant: 'pink' | 'white'
      { text: 'REST OF THE\nTITLE', variant: 'white' },
    ],
    subtitle: 'One or two sentences that summarise the post.',
    author: {
      avatarSrc: '/favicon.svg',
      name: 'Author Name',
      role: 'Author Role, Team Name',
      date: 'Month Day, Year',
      readTime: 'X min read',
    },
  },

  sidebar: {
    author: {
      initials: 'AN',
      name: 'Author Name',
      role: 'Author Role · Team Name',
      bio: 'A short bio, a sentence or two.',
    },
    related: [
      // { category: 'Category', title: 'Post title', date: 'Month Year', href: '#' },
    ],
  },

  // The article body. Add/remove/reorder blocks freely — this is the
  // only part you'll usually touch for a typical post.
  content: [
    { type: 'heading', id: 'intro', text: 'Your First Section Heading' },
    { type: 'paragraph', text: 'Your opening paragraph goes here.' },

    // Bold inline text: wrap it in <b>...</b> right in the string, e.g.
    // { type: 'paragraph', text: 'We shipped <b>Project Name</b> last week.' },

    // { type: 'pullQuote', text: 'A short standout quote.' },

    // { type: 'media', src: myImage, alt: 'Description', caption: '<b>↑ Caption title</b> — details.' },

    // { type: 'posterGrid', items: [
    //   { src: myImage, alt: 'Poster 1', aspectRatio: '3/4', caption: '<b>↑ Title</b> — details.' },
    //   { src: myImage, alt: 'Poster 2', aspectRatio: '3/4', caption: '<b>↑ Title</b> — details.' },
    // ] },

    // { type: 'rule' },

    { type: 'signature', text: '— Author Name, Role · Team · Month Year' },
  ],
};

export default post;
