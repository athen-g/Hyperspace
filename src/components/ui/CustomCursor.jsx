import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hoverType, setHoverType] = useState(null); // null | "default" | "invert" | "transparent"
  const [isVisible, setIsVisible] = useState(false);
  const hoverTypeRef = useRef(null);

  // Direct mouse position motion values (instantaneous, 0 lag)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Silky smooth, responsive spring for trailing outer circle
  const springConfig = { damping: 28, stiffness: 450, mass: 0.25 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only activate cursor for non-touch fine pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      const target = e.target.closest(
        "a, button, input, select, textarea, [data-cursor], .cursor-pointer, .cursor-invert, .cursor-transparent, [role='button'], [onclick], [onClick]"
      );

      let currentHoverType = null;

      if (target) {
        const customType = target.getAttribute("data-cursor");
        if (customType === "invert" || target.classList.contains("cursor-invert")) {
          currentHoverType = "invert";
        } else if (customType === "transparent" || target.classList.contains("cursor-transparent")) {
          currentHoverType = "transparent";
        } else {
          currentHoverType = "default";
        }
      } else if (e.target && window.getComputedStyle(e.target).cursor === "pointer") {
        currentHoverType = "default";
      }

      if (currentHoverType !== hoverTypeRef.current) {
        hoverTypeRef.current = currentHoverType;
        setHoverType(currentHoverType);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  const isHovered = hoverType !== null;
  const isInvert = hoverType === "invert";
  const isTransparent = hoverType === "transparent";

  // Dynamic animation values based on hover class / type
  const scale = isHovered ? (isInvert ? 2.8 : isTransparent ? 2.4 : 2.2) : 1;

  let backgroundColor = "rgba(255, 255, 255, 0)";
  let borderColor = "rgba(255, 255, 255, 0.85)";

  if (isHovered) {
    if (isInvert) {
      backgroundColor = "rgba(255, 255, 255, 1)";
      borderColor = "rgba(255, 255, 255, 0)";
    } else if (isTransparent) {
      backgroundColor = "rgba(255, 255, 255, 0.25)";
      borderColor = "rgba(255, 255, 255, 0.9)";
    } else {
      // Semi-transparent difference background so background content & text remain visible underneath with contrasting tones
      backgroundColor = "rgba(255, 255, 255, 0.85)";
      borderColor = "rgba(255, 255, 255, 0.4)";
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* Outer Circle */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
        }}
        animate={{
          scale,
          backgroundColor,
          borderColor,
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          backgroundColor: { duration: 0.15 },
          borderColor: { duration: 0.15 },
        }}
        className={`absolute -top-4 -left-4 w-8 h-8 rounded-full border ${
          isInvert ? "mix-blend-difference" : isTransparent ? "backdrop-blur-[2px] mix-blend-normal" : "mix-blend-difference"
        }`}
      />

      {/* Inner Central Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isHovered ? (isTransparent ? 0.5 : 0) : 1,
          opacity: isHovered ? (isTransparent ? 0.6 : 0) : 1,
        }}
        transition={{ duration: 0.12 }}
        className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white mix-blend-difference"
      />
    </div>
  );
}
