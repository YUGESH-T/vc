import React from 'react';
import { motion } from 'motion/react';

interface ExerciseAnimationProps {
  type: string;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({ type }) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes('push up')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.g
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Body */}
          <line x1="20" y1="60" x2="80" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {/* Head */}
          <circle cx="85" cy="55" r="5" fill="currentColor" />
          {/* Arms */}
          <line x1="70" y1="60" x2="70" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        {/* Floor */}
        <line x1="10" y1="82" x2="90" y2="82" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  if (normalizedType.includes('squat')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.g
          animate={{ scaleY: [1, 0.6, 1], y: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Torso */}
          <line x1="50" y1="30" x2="50" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {/* Head */}
          <circle cx="50" cy="20" r="6" fill="currentColor" />
          {/* Legs */}
          <path d="M50 60 L35 85 M50 60 L65 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        <line x1="20" y1="87" x2="80" y2="87" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  if (normalizedType.includes('plank')) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.g
          animate={{ y: [0, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Body */}
          <line x1="20" y1="70" x2="80" y2="70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {/* Head */}
          <circle cx="85" cy="65" r="5" fill="currentColor" />
          {/* Elbows */}
          <line x1="70" y1="70" x2="70" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="70" x2="30" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        <line x1="10" y1="87" x2="90" y2="87" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }

  // Default placeholder
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl">
      <Activity className="text-slate-300" size={40} />
    </div>
  );
};

import { Activity } from 'lucide-react';
