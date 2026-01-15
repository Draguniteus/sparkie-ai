'use client';

import { motion } from 'framer-motion';

interface QueenAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function QueenAvatar({ size = 'md', showGlow = true }: QueenAvatarProps) {
  return (
    <motion.div
      className={`relative ${sizeClasses[size]} flex-shrink-0`}
      animate={showGlow ? { scale: [1, 1.02, 1] } : undefined}
      transition={showGlow ? { duration: 2, repeat: Infinity } : undefined}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-yellow-400 blur-lg opacity-30 animate-pulse" />
      )}
      
      <div className={`relative w-full h-full rounded-full queen-glow bg-honey-gradient overflow-hidden`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M25 35 L30 20 L40 30 L50 15 L60 30 L70 20 L75 35 L75 40 L25 40 Z" fill="#FFD700" stroke="#1a1a1a" strokeWidth="2" />
          <ellipse cx="50" cy="60" rx="20" ry="25" fill="#FFE4B5" stroke="#1a1a1a" strokeWidth="1.5" />
          <ellipse cx="42" cy="55" rx="4" ry="5" fill="#1a1a1a" />
          <ellipse cx="58" cy="55" rx="4" ry="5" fill="#1a1a1a" />
          <circle cx="43" cy="54" r="1.5" fill="white" />
          <circle cx="59" cy="54" r="1.5" fill="white" />
          <path d="M42 68 Q50 75 58 68" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="25" cy="50" rx="8" ry="20" fill="rgba(255, 255, 255, 0.4)" stroke="#FFD700" strokeWidth="1" transform="rotate(-20, 25, 50)" />
          <ellipse cx="75" cy="50" rx="8" ry="20" fill="rgba(255, 255, 255, 0.4)" stroke="#FFD700" strokeWidth="1" transform="rotate(20, 75, 50)" />
          <path d="M35 40 Q30 30 25 32" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M65 40 Q70 30 75 32" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <text x="80" y="25" fontSize="12">✨</text>
          <text x="15" y="35" fontSize="10">✨</text>
        </svg>
      </div>
    </motion.div>
  );
}

export default QueenAvatar;
