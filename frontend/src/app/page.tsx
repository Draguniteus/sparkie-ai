'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in, otherwise redirect
    if (!localStorage.getItem('token')) {
      setLoading(false);
    } else {
      // Verify token is valid
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          window.location.href = '/chat';
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    }
  }, []);

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
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
            <div style={{ width: '96px', height: '96px', margin: '0 auto 24px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'url(/sparkie-avatar.png) center/cover' }}></div>
            <p style={{ color: '#a3a3a3' }}>Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          function checkAuth() {
            if (localStorage.getItem('token')) {
              window.location.href = '/chat';
            }
          }
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #000; 
            color: #fff; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
          }
          .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
          
          /* Header */
          header { 
            border-bottom: 1px solid #27272a; 
            padding: 16px 0;
          }
          header .container { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .logo { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            text-decoration: none;
            color: #fff;
          }
          .logo-icon {
            width: 32px;
            height: 32px;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            background: url('/sparkie-avatar.png') center/cover;
          }
          .logo-text { font-weight: 500; }
          .signin-btn {
            background: transparent;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            padding: 8px 16px;
            text-decoration: none;
          }
          .signin-btn:hover { color: #a3a3a3; }
          
          /* Hero */
          .hero { 
            text-align: center; 
            padding: 80px 0 60px; 
          }
          .hero-icon {
            width: 96px;
            height: 96px;
            margin: 0 auto 24px;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            background: url('/sparkie-avatar.png') center/cover;
          }
          .hero h1 {
            font-size: 42px;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
          }
          .hero p {
            color: #a3a3a3;
            font-size: 18px;
            max-width: 500px;
            margin: 0 auto 32px;
            line-height: 1.5;
          }
          .cta-btn {
            display: inline-block;
            background: #fff;
            color: #000;
            padding: 12px 32px;
            border-radius: 9999px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.2s;
          }
          .cta-btn:hover { background: #e5e5e5; }
          
          /* Footer */
          footer { 
            padding: 40px 0; 
            text-align: center; 
            color: #52525b;
            font-size: 14px;
            border-top: 1px solid #27272a;
            margin-top: 80px;
          }
        `}} />
      </head>
      <body>
        <header>
          <div className="container">
            <a href="/" className="logo">
              <div className="logo-icon"></div>
              <span className="logo-text">Sparkie ⚡</span>
            </a>
            <button onClick={() => window.location.href = '/login'} className="signin-btn">Sign in</button>
          </div>
        </header>
        
        <main className="container">
          <section className="hero">
            <div className="hero-icon"></div>
            <h1>Chat with Sparkie ⚡</h1>
            <p>The Queen Bee of Polleneer. Smart, helpful, and always buzzing with ideas.</p>
            <a href="/login" className="cta-btn">Get started</a>
          </section>
        </main>
        
        <footer>
          <p>A Polleneer Experience</p>
        </footer>
      </body>
    </html>
  );
}
