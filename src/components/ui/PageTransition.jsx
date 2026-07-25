import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const NUM_LINES = 4;

const COVER_DURATION = 0.3;
const COVER_STAGGER = 0.1;

const UNCOVER_DURATION = 0.55;
const UNCOVER_STEP = UNCOVER_DURATION * 0.25; // 25% of screen exit threshold
const HOLD_DELAY = 0.5; // Lines wait at 0% until text appears on screen

const lineVariants = {
  initial: {
    y: "0%",
  },
  animate: (i) => ({
    y: "100%",
    transition: {
      duration: UNCOVER_DURATION,
      ease: [0.76, 0, 0.24, 1],
      delay: HOLD_DELAY + (NUM_LINES - 1 - i) * UNCOVER_STEP,
    },
  }),
  exit: (i) => ({
    y: ["-100%", "0%"],
    transition: {
      duration: COVER_DURATION,
      ease: [0.76, 0, 0.24, 1],
      delay: i * COVER_STAGGER,
    },
  }),
};

const TEXT_LETTERS = ["H", "Y", "P", "E", "R", "S", "P", "A", "C", "E"];

const textContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: "-50%",
    transition: {
      duration: 0.25,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const letterVariants = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  animate: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

export default function PageTransition({ children }) {
  const location = useLocation();

  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative w-full min-h-screen">
      {/* 4 Line Transition Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] flex w-screen h-screen overflow-hidden"
        aria-hidden="true"
      >
        {[...Array(NUM_LINES)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={lineVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full w-1/4 bg-white border-r border-[#1f1f2e]/40 last:border-r-0 relative"
          >
            {/* Subtle aesthetic accent line */}
            <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#885CF6]/30 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Centered SplitText HYPERSPACE text on Home page open / reload */}
      {isHomePage && (
        <motion.div
          key={`home-text-${location.pathname}`}
          initial={{ y: "0%", opacity: 1 }}
          animate={{
            y: "100%",
            opacity: 0,
            transition: {
              duration: UNCOVER_DURATION + 0.1,
              ease: [0.76, 0, 0.24, 1],
              delay: HOLD_DELAY + 0.05,
            },
          }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <motion.div
            variants={textContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center gap-[0.08em] overflow-hidden py-2"
          >
            {TEXT_LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block font-mono font-bold text-black text-xl sm:text-3xl md:text-5xl tracking-wide select-none"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    </div>
  );
}
