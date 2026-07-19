import poster1 from '../src/assets/images/news-posters/Graphic design flyer.jpg'
import poster2 from '../src/assets/images/news-posters/BT Sport on its vision for augmented live sports broadcasting becoming reality with 5G.jpg'
import poster3 from '../src/assets/images/news-posters/virtual reality suit.jpg'

const NEWS_ITEMS = [
  {
    id: 'ar-vr-mainstream-2026',
    category: 'Product',
    date: 'May 24, 2026',
    title: 'AR and VR Surge Into the Mainstream in 2026',
    excerpt:
      'Contrary to popular belief, adoption curves for spatial hardware have not just accelerated — they\u2019ve inverted. Here\u2019s what changed, and what it means for the field.',
    featured: true,
    thumbnail: poster1,
  },
  {
    id: 'optics-lab-4ms',
    category: 'Research',
    date: 'Jun 02, 2026',
    title: 'Inside the Optics Lab: Cutting Latency to 4ms',
    excerpt:
      'A look at the waveguide redesign that shaved motion-to-photon latency below the perceptual threshold.',
    thumbnail: poster2,
  },
  {
    id: 'series-c-manufacturing',
    category: 'Company',
    date: 'Jun 14, 2026',
    title: 'Hyperspace Raises Series C to Scale Manufacturing',
    excerpt:
      'New capital moves production from limited runs to a full assembly line — here\u2019s the plan for scale.',
    thumbnail: poster3,
  },
  {
    id: 'ces-field-notes',
    category: 'Events',
    date: 'Jan 09, 2026',
    title: 'Field Notes From CES: What We Learned in Vegas',
    excerpt:
      'Three days on the show floor, a hundred demos, and one clear signal about where the category is headed.',
    thumbnail: poster1,
  },
  {
    id: 'spatial-computing-work',
    category: 'Culture',
    date: 'Feb 21, 2026',
    title: 'The Case for Spatial Computing at Work',
    excerpt:
      'Desks are optional now. A look at how teams are rebuilding the office around headsets, not monitors.',
    thumbnail: poster3,
  },
  {
    id: 'hand-tracking-v3',
    category: 'Product',
    date: 'Apr 11, 2026',
    title: 'Hand Tracking V3: A Deep Dive',
    excerpt:
      'Sub-pixel joint estimation, rebuilt from the sensor up. Fewer markers, more trust in the model.',
    thumbnail: poster2,
  },
  {
    id: 'next-gen-waveguides-team',
    category: 'Company',
    date: 'Mar 30, 2026',
    title: 'Meet the Team Building Our Next-Gen Waveguides',
    excerpt:
      'Six engineers, one clean room, and the two-year push to get glass this thin to hold an image.',
    thumbnail: poster1,
  },
]
const CATEGORIES = ['All', 'Product', 'Research', 'Company', 'Events', 'Culture']

export {
    NEWS_ITEMS,
    CATEGORIES
}