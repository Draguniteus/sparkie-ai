'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="typing-indicator flex gap-1">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="text-yellow-400 text-sm ml-2">Sparkie is thinking...</span>
    </div>
  );
}

export default TypingIndicator;
