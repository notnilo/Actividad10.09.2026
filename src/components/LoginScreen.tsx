import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email.trim(), name.trim() || email.split('@')[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4 shadow-lg shadow-brand-500/30">
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-base-900" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 7v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NexusTrade</h1>
          <p className="text-slate-400 mt-2 text-sm">Crypto & Fiat Exchange Platform</p>
        </div>

        <div className="card p-8 shadow-2xl shadow-base-900/50">
          <div className="flex gap-1 mb-6 p-1 bg-base-900/60 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'tab-active' : 'tab-inactive'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'tab-active' : 'tab-inactive'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field !text-base"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="input-field !text-base"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field !text-base"
              />
            </div>

            <button type="submit" className="btn-primary w-full !py-3 mt-2">
              {mode === 'login' ? 'Sign In to Trade' : 'Create Trading Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-base-600/60">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
                Simulated Environment
              </span>
              <span>Commission: 0.5%</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Demo platform — no real funds are traded. For educational purposes only.
        </p>
      </div>
    </div>
  );
}
