/**
 * QueenAvatar - Sparkie ⚡ Visual Representation
 * Using user's uploaded bee image for authentic appearance
 */
'use client';

import Image from 'next/image';
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
        <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-40 animate-pulse" />
      )}
      
      <div className={`relative w-full h-full rounded-full overflow-hidden`}>
        <Image
          src="/sparkie-avatar.png"
          alt="Sparkie - Queen Bee"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </motion.div>
  );
}

export default QueenAvatar;
