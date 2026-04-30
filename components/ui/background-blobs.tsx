"use client";
import { useEffect, useState } from "react";

export function BackgroundBlobs() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    // Add event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial call to set correct position
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Red Top Left - moves down as you scroll down */}
      <div 
        className="pointer-events-none fixed top-[-15%] left-[-12%] w-[700px] h-[700px] rounded-full bg-[#C8102E]/25 blur-[130px] z-0 transition-transform duration-700 ease-out" 
        style={{ transform: `translateY(${scrollY * 0.35}px)` }} 
      />
      
      {/* Blue Middle Right - organic side-to-side and slight tilt  */}
      <div 
        className="pointer-events-none fixed top-[15%] right-[-25%] w-[600px] h-[800px] rounded-[100%] bg-[#0044FF]/20 blur-[140px] z-0 transition-transform duration-500 ease-out" 
        style={{ transform: `translate(${-scrollY * 0.15}px, ${-scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)` }} 
      />
      
    </>
  );
}
