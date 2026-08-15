import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, adminInfo: any) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('m.p.17.lal.2.com@gmail.com');
  const [password, setPassword] = useState('Rana@@12');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        onLoginSuccess(data.token, data.admin);
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setError('Authentication server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Work OS Login</h2>
          <p className="text-xs text-slate-400">Private Work Management System for Shakil</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
          >
            {loading ? 'Authenticating...' : 'Sign In to Work OS'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300"
          >
            Return to Public Portfolio
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Protected Route & Encrypted Admin Session</span>
          </p>
        </div>
      </div>
    </div>
  );
};
