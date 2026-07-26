import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Footer from './Footer';
import Contact from './Contact';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const BlogComingSoon = ({ slug }) => {
  const navigate = useNavigate();
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

  // Format title from slug: e.g. "developing-games-with-unity-hub" -> "DEVELOPING GAMES WITH UNITY HUB"
  const formattedTitle = slug
    ? slug.replace(/-/g, ' ').toUpperCase()
    : 'ARTICLE COMING SOON';

  return (
    <div className="bg-[#0b0b0b] min-h-screen text-white flex flex-col justify-between relative overflow-hidden">
      <Header />
      <BackgroundLines />

      <main className={`relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 ${isMobile768 ? 'mt-[130px] mb-[60px]' : 'mt-[100px] mb-[80px]'}`}>
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-pink/40 bg-accent-pink/10 mb-8"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2.5 h-2.5 rounded-full bg-accent-pink shadow-[0_0_10px_#ff0055]"
          />
          <span className="font-mono text-[12px] uppercase tracking-widest text-accent-pink font-semibold">
            In Production
          </span>
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="font-host font-bold text-white text-[clamp(28px,5vw,64px)] uppercase tracking-tight max-w-[900px] leading-[1.1] mb-6"
        >
          {formattedTitle}
        </motion.h1>

        {/* Subtitle / Teaser */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="font-mono text-white/60 text-sm md:text-base max-w-[550px] uppercase tracking-wider mb-10 leading-relaxed"
        >
          Our team is crafting this article with deep technical insights & design breakdowns. Stay tuned!
        </motion.p>

        {/* Animated Loading Bar / Futuristic Signal */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-[320px] w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative mb-12"
        >
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-accent-pink to-transparent"
          />
        </motion.div>

        {/* Return Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-[280px] sm:max-w-[320px] flex justify-center"
        >
          <Button
            label="BACK TO BLOGS"
            onClick={() => navigate('/blogs')}
            className="!relative !left-0 !w-full"
          />
        </motion.div>

      </main>

      <Contact />
      <Footer />
    </div>
  );
};

export default BlogComingSoon;
