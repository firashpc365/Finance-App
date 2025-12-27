
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../../types';
import { useSettings } from '../../context/SettingsContext';

const ASSETS = {
  PERSONAL: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=3840&auto=format&fit=crop",
  BUSINESS: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=3840&auto=format&fit=crop",
  BUSINESS_TECH_GRID: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3840&auto=format&fit=crop"
};

interface Background4KProps {
  mode: AppMode;
}

const Background4K: React.FC<Background4KProps> = ({ mode }) => {
  const { settings } = useSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const isBusiness = mode === AppMode.BUSINESS;

  useEffect(() => {
    setIsLoaded(false);
  }, [mode]);

  return (
    <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden bg-slate-950">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Hardware Accelerated Image Engine */}
          <img 
            src={isBusiness ? ASSETS.BUSINESS : ASSETS.PERSONAL} 
            alt="" 
            loading="eager"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              filter: isBusiness ? "brightness(0.6) contrast(1.25)" : "brightness(1.05)"
            }}
          />

          {/* Overlay layers with dynamic blur based on settings */}
          {!isBusiness ? (
            <>
              <div 
                className="absolute inset-0 bg-white/40 transition-all duration-700" 
                style={{ 
                  transform: "translateZ(0)",
                  backdropFilter: `blur(var(--glass-blur))`,
                  WebkitBackdropFilter: `blur(var(--glass-blur))`
                }} 
              />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/5 mix-blend-soft-light" />
            </>
          ) : (
            <>
              <div 
                className="absolute inset-0 bg-black/60 transition-all duration-700" 
                style={{ 
                  transform: "translateZ(0)",
                  backdropFilter: `blur(var(--glass-blur))`,
                  WebkitBackdropFilter: `blur(var(--glass-blur))`
                }} 
              />
              <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none overflow-hidden">
                <img src={ASSETS.BUSINESS_TECH_GRID} alt="" className="w-full h-full object-cover scale-150 rotate-12 animate-tech-drift" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-900/40 to-teal-900/20" />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global Aesthetics Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

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
