import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Sparkles } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-welcome',
    title: 'Welcome to Lumina',
    content: "Your AI-powered fitness journey starts here. Let's take a quick look at your new command center.",
  },
  {
    targetId: 'tour-nav',
    title: 'Navigation Hub',
    content: 'Switch between your live progress, your AI-generated training plan, and your biometric profile.',
  },
  {
    targetId: 'tour-stats',
    title: 'Daily Vitals',
    content: 'Track your calories, active duration, steps, and consistency streak in real-time.',
  },
  {
    targetId: 'tour-generate-btn',
    title: 'AI Blueprint',
    content: 'Click here to let our AI synthesize a custom workout plan based on your current performance and goals.',
  },
  {
    targetId: 'tour-performance',
    title: 'Performance Matrix',
    content: 'Visualize your progress over time. Our analytics engine helps you identify peak performance windows.',
  },
  {
    targetId: 'tour-achievements',
    title: 'Elite Rewards',
    content: 'Unlock badges and earn status as you complete your drills. Your journey to Titan begins now.',
  }
];

export const GuidedTour: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    } else {
      // If element not found, skip to next step or finish
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsActive(false);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('lumina_tour_v1');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsActive(true), 1500); // Slight delay for entrance
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      
      const resizeObserver = new ResizeObserver(updateCoords);
      const step = TOUR_STEPS[currentStep];
      const element = document.getElementById(step?.targetId);
      if (element) resizeObserver.observe(element);

      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
        resizeObserver.disconnect();
      };
    }
  }, [isActive, currentStep, updateCoords]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    localStorage.setItem('lumina_tour_v1', 'true');
  };

  if (!isActive || !coords) return null;

  // Tooltip positioning logic
  const spacing = 16;
  const tooltipWidth = 320;
  
  // Vertical Logic (Flip Detection)
  const spaceBelow = windowSize.height - (coords.y + coords.height);
  const showAbove = spaceBelow < 200; // arbitrary threshold for tooltip height
  
  let tooltipY = showAbove 
    ? coords.y - spacing // We'll offset by actual height in style with translateY
    : coords.y + coords.height + spacing;

  // Horizontal Clamping
  let idealLeft = coords.x + coords.width / 2 - tooltipWidth / 2;
  const tooltipX = Math.max(16, Math.min(idealLeft, windowSize.width - tooltipWidth - 16));

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* SVG Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleFinish}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              animate={{
                x: coords.x - 8,
                y: coords.y - 8,
                width: coords.width + 16,
                height: coords.height + 16,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              fill="black"
              rx="16"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.6)"
          mask="url(#spotlight-mask)"
          style={{ backdropFilter: 'blur(3px)' }}
        />
      </svg>

      {/* Pulsing Focus Ring */}
      <motion.div
        animate={{
          x: coords.x - 8,
          y: coords.y - 8,
          width: coords.width + 16,
          height: coords.height + 16,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="absolute border-2 border-brand-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] rounded-2xl pointer-events-none"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 border-4 border-brand-primary/20 rounded-2xl"
        />
      </motion.div>

      {/* Tooltip Content */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: showAbove ? 10 : -10 }}
        animate={{ 
          opacity: 1, 
          x: tooltipX, 
          y: tooltipY,
          translateY: showAbove ? '-100%' : '0%'
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="absolute w-[320px] bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-6 pointer-events-auto ring-1 ring-slate-950/5"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-luminous-lavender rounded-full border border-brand-primary/10">
            <Sparkles size={12} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Guided Tour</span>
          </div>
          <button 
            onClick={handleFinish}
            className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-2 leading-none">
          {TOUR_STEPS[currentStep].title}
        </h3>
        <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6">
          {TOUR_STEPS[currentStep].content}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-brand-primary' : 'w-1 bg-slate-100'}`} 
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] italic shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
