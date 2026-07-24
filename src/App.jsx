import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
import AdminPage from "./components/AdminPage";

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  const progressRef = useRef(null);

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
      <div className="reading-progress" ref={progressRef}></div>

      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Events */}
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/events/:slug"
          element={<EventRouter />}
        />

        {/* Registration */}
        {/* <Route
          path="/register/:slug"
          element={<RegistrationPage />}
        /> */}

        {/* Blogs */}
        <Route path="/blogs" element={<Blog />} />
        <Route path="/blogs/:slug" element={<BlogPage />} />

        {/* Team */}
        <Route path="/team" element={<TeamPage />} />

        {/* News */}
        <Route
          path="/news"
          element={
            <News />
          }
        />
        <Route path="/news/:slug" element={<NewsPage />} />

        <Route path="/register/:slug" element={<RegistrationsPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;