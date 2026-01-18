'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Registration failed');
      }

      // Registration successful, redirect to login
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          .back-btn { background: transparent; border: none; color: #a3a3a3; cursor: pointer; font-size: 14px; padding: 8px 16px; text-decoration: none; }
          .back-btn:hover { color: #fff; }
          .register-section { padding: 80px 0; display: flex; flex-direction: column; align-items: center; }
          .avatar { width: 96px; height: 96px; margin: 0 auto 24px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: url('/sparkie-avatar.png') center/cover; }
          .register-section h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
          .register-section p { color: #71717a; margin-bottom: 32px; }
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
            <a href="/login" className="back-btn">Sign in</a>
          </div>
        </header>
        
        <main className="container">
          <section className="register-section">
            <div className="avatar"></div>
            <h1>Create your account</h1>
            <p>Join the Polleneer hive</p>
            
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
                  minLength={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
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
                  placeholder="Password (min 8 characters)"
                  required 
                  minLength={8}
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            
            <p style={{ marginTop: '24px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
              Already have an account? <a href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Sign in</a>
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
