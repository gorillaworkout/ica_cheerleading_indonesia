"use client";

import { useEffect } from "react";

interface HeroLCPProps {
  title?: string;
  subtitle?: string;
  onImageLoad?: () => void;
}

export default function HeroLCP({ title, subtitle, onImageLoad }: HeroLCPProps) {
  // Trigger onImageLoad immediately untuk bypass React completely
  useEffect(() => {
    if (onImageLoad) {
      // Trigger immediately tanpa React
      onImageLoad();
    }
  }, [onImageLoad]);

  // Return static HTML tanpa React rendering
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Hero Image - Static HTML dengan inline styles */}
      <img
        src="/ica-hero.webp"
        alt="ICA Cheerleading Indonesia Hero Image"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          display: 'block',
          visibility: 'visible',
          opacity: 1
        }}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        onLoad={() => {
          // Force callback tanpa React state
          if (onImageLoad) onImageLoad();
        }}
      />

      {/* Overlay untuk teks */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 2
        }}
      />

    </div>
  );
}
