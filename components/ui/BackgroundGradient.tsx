'use client';

import { useEffect, useState } from 'react';

export default function BackgroundGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Calculate gradient positions based on mouse movement
  const gradientX = mousePosition.x * 100;
  const gradientY = mousePosition.y * 100;
  
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base background */}
      <div className="absolute inset-0 bg-[url('/images/fifa-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
      
      {/* Dynamic gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95"
        style={{
          backgroundPosition: `${gradientX}% ${gradientY}%`,
        }}
      />
      
      {/* Accent glow */}
      <div 
        className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-yellow-500/5 blur-3xl"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
        }}
      />
      <div 
        className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-amber-500/5 blur-3xl"
        style={{
          transform: `translate(${-mousePosition.x * 20}px, ${-mousePosition.y * 20}px)`,
        }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-5" />
    </div>
  );
}