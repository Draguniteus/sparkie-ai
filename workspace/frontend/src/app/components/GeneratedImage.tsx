'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, AlertCircle, Sparkles, RefreshCw, Download } from 'lucide-react';

interface GeneratedImageProps {
  dataUrl: string;
  url?: string;
  prompt: string;
  isPending?: boolean;
  error?: string;
  onRetry?: () => void;
  onDownload?: () => void;
}

export function GeneratedImage({
  dataUrl,
  url,
  prompt,
  isPending = false,
  error,
  onRetry,
  onDownload
}: GeneratedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const displayUrl = dataUrl || url;

  if (isPending) {
    return (
      <div className="max-w-md mx-auto bg-black/40 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-honey-gradient animate-spin flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <p className="text-yellow-300 text-sm">Sparkie is painting your image... 🐝🎨</p>
          <p className="text-yellow-500/60 text-xs text-center max-w-xs">"{prompt}"</p>
        </div>
      </div>
    );
  }

  if (error || imageError) {
    return (
      <div className="max-w-md mx-auto bg-red-500/10 rounded-xl p-4 border border-red-500/30">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-red-400 text-sm">
            {error || 'Failed to load image'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 
                       text-yellow-400 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto bg-black/40 rounded-xl overflow-hidden border border-yellow-500/30"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={displayUrl}
          alt={prompt}
          className="w-full h-auto"
          onError={() => setImageError(true)}
          onLoad={() => setIsLoading(false)}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
          </div>
        )}
        
        {/* Download button */}
        {onDownload && displayUrl && (
          <a
            href={displayUrl}
            download={`sparkie-image-${Date.now()}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 
                     rounded-lg text-yellow-400 transition-colors"
            title="Download image"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
      
      {/* Prompt */}
      <div className="p-3 bg-yellow-900/20 border-t border-yellow-500/20">
        <p className="text-yellow-300 text-xs text-center">
          "{prompt}"
        </p>
      </div>
    </motion.div>
  );
}

export default GeneratedImage;
