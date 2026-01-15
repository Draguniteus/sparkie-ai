'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface SparkInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SparkInput({ onSend, isLoading, placeholder = 'Ask Sparkie anything...' }: SparkInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="chat-input rounded-2xl p-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none py-2 px-3 max-h-[150px] overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          
          <motion.button
            type="submit"
            disabled={!message.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              'p-2 rounded-xl transition-all duration-200',
              message.trim() && !isLoading
                ? 'bg-honey-gradient text-black'
                : 'bg-gray-700 text-gray-400'
            )}
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
      
      <div className="flex justify-end px-2 mt-1">
        <span className={clsx('text-xs', message.length > 10000 ? 'text-red-400' : 'text-gray-500')}>
          {message.length.toLocaleString()} / 10,000
        </span>
      </div>
    </form>
  );
}

export default SparkInput;
