'use client';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatInterface } from './components/ChatInterface';
import { QueenAvatar } from './components/QueenAvatar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LogIn, UserPlus, LogOut, Sparkles } from 'lucide-react';

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/30"
    >
      <div className="flex flex-col items-center mb-6">
        <QueenAvatar size="lg" />
        <h2 className="mt-4 text-2xl font-bold text-yellow-400">Welcome Back</h2>
        <p className="text-yellow-600">Login to chat with Sparkie</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-yellow-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-yellow-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-honey-gradient text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Sparkles className="animate-spin" /> : <LogIn className="w-5 h-5" />}
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-yellow-500/60">
        New to the hive?{' '}
        <button onClick={onSwitch} className="text-yellow-400 hover:underline">
          Create account
        </button>
      </p>
    </motion.div>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/30"
    >
      <div className="flex flex-col items-center mb-6">
        <QueenAvatar size="lg" />
        <h2 className="mt-4 text-2xl font-bold text-yellow-400">Join the Hive</h2>
        <p className="text-yellow-600">Create your Polleneer account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-yellow-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-yellow-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-yellow-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-honey-gradient text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Sparkles className="animate-spin" /> : <UserPlus className="w-5 h-5" />}
          Register
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-yellow-500/60">
        Already in the hive?{' '}
        <button onClick={onSwitch} className="text-yellow-400 hover:underline">
          Login instead
        </button>
      </p>
    </motion.div>
  );
}

function MainContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <QueenAvatar size="xl" />
          <p className="mt-4 text-yellow-400 animate-pulse">Sparkie is waking up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hive-pattern">
      <header className="bg-black/50 backdrop-blur-lg border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QueenAvatar size="sm" />
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Sparkie ⚡</h1>
              <p className="text-xs text-yellow-600">Queen Bee of Polleneer</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-300 hidden sm:block">{user?.username}</span>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-honey-gradient text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-lg rounded-2xl border border-yellow-500/30 overflow-hidden"
          >
            <ChatInterface />
          </motion.div>
        ) : showLogin ? (
          isRegister ? (
            <RegisterForm onSwitch={() => setIsRegister(false)} />
          ) : (
            <LoginForm onSwitch={() => setIsRegister(true)} />
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <QueenAvatar size="xl" showGlow={true} />
            <h2 className="mt-6 text-3xl font-bold text-yellow-400">Welcome to Polleneer</h2>
            <p className="mt-4 text-lg text-yellow-600 max-w-lg mx-auto">
              Chat with <span className="text-yellow-400 font-semibold">Sparkie</span>, 
              the Queen Bee of our creative hive. Pollinate ideas, spark creativity, 
              and grow together!
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="mt-8 px-8 py-4 bg-honey-gradient text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-6 h-6" />
              Chat with Sparkie
            </button>
          </motion.div>
        )}
      </main>

      <footer className="mt-12 py-6 text-center text-yellow-500/40 text-sm">
        <p>Made with love by Angel Michael (@WeGotHeaven)</p>
        <p className="mt-1">#Polleneer #SpreadYourWings #BeeTheChange</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
