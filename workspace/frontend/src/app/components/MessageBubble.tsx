'use client';

import { Message } from '../types';
import clsx from 'clsx';
import QueenAvatar from './QueenAvatar';
import GeneratedImage from './GeneratedImage';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  onRegenerate?: (messageId: number, prompt: string) => void;
  isRegenerating?: boolean;
}

export function MessageBubble({ 
  message, 
  showAvatar = false,
  onRegenerate,
  isRegenerating = false
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  // Check if this is an image message
  const isImageMessage = message.is_image_request && message.image_prompt;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-yellow-500/60 bg-yellow-900/20 px-4 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex gap-3 my-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="flex-shrink-0">
          <QueenAvatar size="sm" />
        </div>
      )}
      
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-yellow-500 text-black rounded-tr-sm'
            : 'bg-transparent text-white rounded-tl-sm'
        )}
      >
        {/* Image content */}
        {isImageMessage && (
          <div className="mb-3">
            <GeneratedImage
              dataUrl={message.image_data_url || ''}
              url={message.image_url}
              prompt={message.image_prompt || ''}
              isPending={message.image_status === 'pending'}
              error={message.image_status === 'error' ? message.image_error : undefined}
              onRetry={() => onRegenerate && message.id && message.image_prompt && onRegenerate(message.id, message.image_prompt)}
            />
          </div>
        )}
        
        {/* Text content (if any) */}
        {message.content && (
          <p className="whitespace-pre-wrap text-white">
            {message.content}
          </p>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-xs text-gray-300">
            {message.content.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
