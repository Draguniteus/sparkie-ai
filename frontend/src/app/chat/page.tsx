'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch user info
    fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      });
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <html lang="en">
        <head>
          <style dangerouslySetInnerHTML={{ __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          `}} />
        </head>
        <body>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'url(/sparkie-avatar.png) center/cover' }}></div>
            <p style={{ color: '#a3a3a3' }}>Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
          
          /* Header */
          header { 
            border-bottom: 1px solid #27272a; 
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; }
          .logo-icon { width: 32px; height: 32px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: url('/sparkie-avatar.png') center/cover; }
          .logo-text { font-weight: 500; }
          .user-info { display: flex; align-items: center; gap: 16px; }
          .username { color: #a3a3a3; font-size: 14px; }
          .logout-btn { background: transparent; border: none; color: #a3a3a3; cursor: pointer; font-size: 14px; }
          .logout-btn:hover { color: #fff; }
          
          /* Chat Container */
          .chat-container { flex: 1; display: flex; flex-direction: column; max-width: 900px; margin: 0 auto; width: 100%; padding: 24px; }
          
          /* Messages */
          .messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
          .message { display: flex; gap: 12px; max-width: 80%; }
          .message.user { align-self: flex-end; flex-direction: row-reverse; }
          .message-avatar { width: 32px; height: 32px; flex-shrink: 0; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: url('/sparkie-avatar.png') center/cover; }
          .message.user .message-avatar { background: #f59e0b; }
          .message-content { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
          .message.assistant .message-content { background: #18181b; border: 1px solid #27272a; }
          .message.user .message-content { background: #fff; color: #000; }
          
          /* Input */
          .input-container { margin-top: 24px; }
          .input-form { display: flex; gap: 12px; }
          .message-input { flex: 1; padding: 14px 20px; background: #18181b; border: 1px solid #27272a; border-radius: 24px; color: #fff; font-size: 14px; outline: none; }
          .message-input:focus { border-color: #f59e0b; }
          .send-btn { padding: 14px 24px; background: #fff; color: #000; border: none; border-radius: 24px; font-size: 14px; font-weight: 500; cursor: pointer; }
          .send-btn:hover { background: #e5e5e5; }
          .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        `}} />
      </head>
      <body>
        <header>
          <a href="/" className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">Sparkie ⚡</span>
          </a>
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="logout-btn">Log out</button>
          </div>
        </header>
        
        <main className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#52525b', marginTop: '40px' }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'url(/sparkie-avatar.png) center/cover', opacity: 0.5 }}></div>
                <p>Start a conversation with Sparkie</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar"></div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-container">
            <form className="input-form" onSubmit={sendMessage}>
              <input
                type="text"
                className="message-input"
                placeholder="Message Sparkie..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="send-btn" disabled={sending || !input.trim()}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </main>
      </body>
    </html>
  );
}
