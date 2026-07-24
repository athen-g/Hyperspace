import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";

import LandingPage from "./components/LandingPage";
import Blog from "./components/Blog";
import BlogPage from "./components/BlogPage";
import EventsPage from "./components/EventsPage";
import EventPageTemplate from "./components/EventPageTemplate";
import Blog_Home from "./components/Blog_Home";
import News from "./components/News";
import NewsPage from "./components/NewsPage";
import EventRouter from "./components/EventRouter";
import RegistrationsPage from "./components/RegistrationsPage";
import TeamPage from "./components/TeamPage";
import PageTransition from "./components/ui/PageTransition";
import CustomCursor from "./components/ui/CustomCursor";

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  const progressRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <div className="reading-progress" ref={progressRef}></div>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Events */}
          <Route path="/events" element={<PageTransition><EventsPage /></PageTransition>} />
          <Route
            path="/events/:slug"
            element={<PageTransition><EventRouter /></PageTransition>}
          />

          {/* Blogs */}
          <Route path="/blogs" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blogs/:slug" element={<PageTransition><BlogPage /></PageTransition>} />

          {/* Team */}
          <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />

          {/* News */}
          <Route
            path="/news"
            element={
              <PageTransition><News /></PageTransition>
            }
          />
          <Route path="/news/:slug" element={<PageTransition><NewsPage /></PageTransition>} />

          <Route path="/register/:slug" element={<PageTransition><RegistrationsPage /></PageTransition>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;