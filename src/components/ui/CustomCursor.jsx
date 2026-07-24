import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isHoveredRef = useRef(false);

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
        "a, button, input, select, textarea, [data-cursor], .cursor-pointer, [role='button'], [onclick], [onClick]"
      );

      const isPointer = Boolean(target) || (e.target && window.getComputedStyle(e.target).cursor === "pointer");
      if (isPointer !== isHoveredRef.current) {
        isHoveredRef.current = isPointer;
        setIsHovered(isPointer);
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

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* Outer Circle with Smooth Trail Delay (Expands to solid filled circle on hover) */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
        }}
        animate={{
          scale: isHovered ? 2.2 : 1,
          backgroundColor: isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
          borderColor: isHovered ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0.85)",
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          backgroundColor: { duration: 0.15 },
          borderColor: { duration: 0.15 },
        }}
        className="absolute -top-4 -left-4 w-8 h-8 rounded-full border border-white/85 mix-blend-difference"
      />

      {/* Inner Central Dot (Instant tracking, fades out on hover) */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white mix-blend-difference"
      />
    </div>
  );
}
