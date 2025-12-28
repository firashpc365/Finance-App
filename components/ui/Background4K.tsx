
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../../types';
import { useSettings } from '../../context/SettingsContext';

// Wallpaper Presets Configuration
export const WALLPAPER_PRESETS: Record<string, string> = {
  'default': "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=3840&auto=format&fit=crop", // Dark Abstract
  'onyx': "https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=3840&auto=format&fit=crop", // Deep Space/Stars
  'royal': "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=3840&auto=format&fit=crop", // Liquid Blue/Purple
  'corporate': "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=3840&auto=format&fit=crop", // Architecture
  'desert': "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=3840&auto=format&fit=crop", // Sand/Gold
  'circuit': "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3840&auto=format&fit=crop" // Tech
};

const ASSETS = {
  PERSONAL: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=3840&auto=format&fit=crop",
  BUSINESS_TECH_GRID: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3840&auto=format&fit=crop"
};

interface Background4KProps {
  mode: AppMode;
}

const Background4K: React.FC<Background4KProps> = ({ mode }) => {
  const { settings } = useSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const isBusiness = mode === AppMode.BUSINESS;

  // Determine active background source
  const activeBg = WALLPAPER_PRESETS[settings.activeWallpaper] || WALLPAPER_PRESETS['default'];
  
  const finalBg = (!isBusiness && settings.activeWallpaper === 'default') 
    ? ASSETS.PERSONAL 
    : activeBg;

  useEffect(() => {
    setIsLoaded(false);
  }, [finalBg]);

  // Layer Rendering Logic
  const techGridLayer = settings.enableTechGrid && (settings.activeWallpaper === 'default' || settings.activeWallpaper === 'circuit') && isBusiness ? (
    <div className={`absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none overflow-hidden ${settings.techGridPosition === 'front' ? 'z-[5]' : 'z-0'}`}>
      <img 
        src={ASSETS.BUSINESS_TECH_GRID} 
        alt="" 
        className={`w-full h-full object-cover scale-150 rotate-12 animate-tech-drift ${settings.techGridPosition === 'front' ? 'opacity-100 brightness-150' : ''}`} 
      />
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden bg-slate-950">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={finalBg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* 1. Base Image Layer */}
          <img 
            src={finalBg} 
            alt="Background" 
            loading="eager"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              filter: isBusiness ? "brightness(0.5) contrast(1.2) saturate(0.8)" : "brightness(1.05)"
            }}
          />

          {/* 2. Configurable Overlay Layer (The tint) */}
          <div 
            className={`absolute inset-0 transition-all duration-700 ${!isBusiness ? 'bg-white' : 'bg-black'}`} 
            style={{ 
              opacity: settings.bgOverlayOpacity,
              backdropFilter: `blur(var(--glass-blur))`,
              WebkitBackdropFilter: `blur(var(--glass-blur))`
            }} 
          />

          {/* 3. Logic-Driven Composition */}
          {!isBusiness ? (
            // Personal Mode Gradient
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/5 mix-blend-soft-light" />
          ) : (
            // Business Mode Stacking
            <>
              {/* If grid is "Back", render it before the gradient */}
              {settings.techGridPosition === 'back' && techGridLayer}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-900/60 to-transparent" />
              
              {/* If grid is "Front", render it after the gradient for prominence */}
              {settings.techGridPosition === 'front' && techGridLayer}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Global Noise Overlay (Optional) */}
      {settings.enableNoise && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-[10]"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
      )}

      <style>{`
        @keyframes tech-drift {
          0% { transform: scale(1.5) rotate(12deg) translate(0, 0); }
          100% { transform: scale(1.6) rotate(14deg) translate(-2%, -2%); }
        }
        .animate-tech-drift { animation: tech-drift 30s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};

export default Background4K;
