'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (localStorage.getItem('token')) {
            window.location.href = '/';
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
          header { border-bottom: 1px solid #27272a; padding: 16px 0; }
          header .container { display: flex; justify-content: space-between; align-items: center; }
          .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; }
          .logo-icon { width: 32px; height: 32px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: url('/sparkie-avatar.png') center/cover; }
          .logo-text { font-weight: 500; }
          .login-section { padding: 80px 0; display: flex; flex-direction: column; align-items: center; }
          .avatar { width: 96px; height: 96px; margin: 0 auto 24px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: url('/sparkie-avatar.png') center/cover; }
          .login-section h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
          .login-section p { color: #71717a; margin-bottom: 32px; }
          .form { width: 100%; max-width: 320px; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 14px; color: #a3a3a3; margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 12px 16px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; }
          .form-group input:focus { border-color: #f59e0b; }
          .form-group input::placeholder { color: #52525b; }
          .submit-btn { width: 100%; padding: 12px; background: #fff; color: #000; border: none; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
          .submit-btn:hover { background: #e5e5e5; }
          .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .error { background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; padding: 12px; margin-bottom: 16px; color: #fca5a5; font-size: 14px; text-align: center; }
          footer { padding: 40px 0; text-align: center; color: #52525b; font-size: 14px; border-top: 1px solid #27272a; }
        `}} />
      </head>
      <body>
        <header>
          <div className="container">
            <a href="/" className="logo">
              <div className="logo-icon"></div>
              <span className="logo-text">Sparkie ⚡</span>
            </a>
          </div>
        </header>
        
        <main className="container">
          <section className="login-section">
            <div className="avatar"></div>
            <h1>Sign in to Sparkie ⚡</h1>
            <p>Access the Queen Bee of Polleneer</p>
            
            <form className="form" onSubmit={handleSubmit}>
              {error && <div className="error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required 
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            
            <p style={{ marginTop: '24px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
              No account? <a href="/register" style={{ color: '#fff', textDecoration: 'underline' }}>Create one</a>
            </p>
          </section>
        </main>
        
        <footer>
          <p>A Polleneer Experience</p>
        </footer>
      </body>
    </html>
  );
}
