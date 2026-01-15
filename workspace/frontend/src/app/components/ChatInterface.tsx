'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import SparkInput from './SparkInput';
import QueenAvatar from './QueenAvatar';
import TypingIndicator from './TypingIndicator';

export function ChatInterface() {
  const { user } = useAuth();
  const { 
    messages, 
    isLoading, 
    isStreaming, 
    isGeneratingImage,
    conversationId, 
    sendMessage, 
    clearChat,
    regenerateImage 
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingImage]);

  const handleSendMessage = async (message: string) => {
    if (!user) {
      alert('Please login to chat with Sparkie!');
      return;
    }
    await sendMessage(message, conversationId || undefined);
  };

  const handleRegenerateImage = async (messageId: number, prompt: string) => {
    await regenerateImage(messageId, prompt);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-500/20">
        <div className="flex items-center gap-3">
          <QueenAvatar size="sm" />
          <div>
            <h2 className="text-lg font-bold text-yellow-400">Sparkie</h2>
            <p className="text-xs text-yellow-600">Queen Bee of Polleneer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-yellow-500 hover:text-yellow-300 px-2 py-1 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              New Chat
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <QueenAvatar size="xl" showGlow={true} />
            <p className="mt-4 text-yellow-400/60 text-sm">
              The hive awaits your wisdom, dear pollinator...
            </p>
            <p className="mt-2 text-yellow-500/40 text-xs">
              💡 Try: "Show me Sparkie" or "Generate an image of a queen bee"
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showAvatar={message.role === 'assistant'}
            onRegenerate={handleRegenerateImage}
            isRegenerating={isGeneratingImage}
          />
        ))}
        
        {(isStreaming || isGeneratingImage) && (
          <MessageBubble
            message={{
              id: -1,
              role: 'assistant',
              content: isGeneratingImage ? '🐝✨ Creating your image...' : '',
              created_at: new Date().toISOString(),
            }}
            showAvatar={true}
          />
        )}
        
        {(isStreaming || isGeneratingImage) && (
          <div className="pl-12">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-4 border-t border-yellow-500/20">
        <SparkInput
          onSend={handleSendMessage}
          isLoading={isLoading || isStreaming || isGeneratingImage}
          placeholder={user ? "Ask Sparkie anything, dear pollinator... (try 'generate an image of...')" : "Please login to chat with Sparkie"}
        />
      </div>
    </div>
  );
}

export default ChatInterface;
