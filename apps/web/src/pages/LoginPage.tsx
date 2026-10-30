import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Activity, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'responder' | 'admin') => {
    setIsSubmitting(true);
    try {
      await loginAsDemo(role);
      navigate(role === 'user' ? '/sos' : '/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emergency-600 flex items-center justify-center shadow-lg shadow-emergency-600/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl text-white tracking-tight">SafeWalk<span className="text-emergency-500">.AI</span></span>
      </Link>

      <div className="max-w-md w-full glass-panel-elevated p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
        <h2 className="text-xl font-bold text-white text-center mb-1">Sign In to SafeWalk AI</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Access your personal safety dashboard or responder console</p>

        {/* 1-Click Evaluation Demo Switchers */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-2 text-center">
            Instant Demo Account Access:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 border border-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emergency-400" />
              <span>Citizen User</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('responder')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 border border-slate-700 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>112 Responder</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 border border-slate-700 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>System Admin</span>
            </button>
          </div>
        </div>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative px-3 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase">Or sign in with email</span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-emergency-600/15 border border-emergency-500/30 text-emergency-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@safewalk.ai"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emergency-600/30 flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          New to SafeWalk AI?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
