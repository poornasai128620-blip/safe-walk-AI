import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, Radio, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, logout, loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emergency-600 to-emergency-500 flex items-center justify-center shadow-lg shadow-emergency-600/30 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white tracking-tight">SafeWalk<span className="text-emergency-500">.AI</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">112 ERSS</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Personal Safety & Emergency Response</p>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            Platform
          </Link>
          <Link to="/sos" className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${location.pathname === '/sos' ? 'text-emergency-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            <Radio className="w-4 h-4 text-emergency-500 animate-pulse" />
            Quick Web SOS
          </Link>
          {isAuthenticated && (role === 'RESPONDER' || role === 'ADMIN') && (
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isDashboard ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Responder Command Center
            </Link>
          )}
        </nav>

        {/* Right CTA & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher for Evaluation */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 font-mono text-[11px]">Role:</span>
            <button
              onClick={() => loginAsDemo('user')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${role === 'USER' ? 'bg-emergency-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              User
            </button>
            <button
              onClick={() => { loginAsDemo('responder'); navigate('/dashboard'); }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${role === 'RESPONDER' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              112 Responder
            </button>
            <button
              onClick={() => { loginAsDemo('admin'); navigate('/dashboard'); }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>

          {/* SOS Hot Button */}
          <Link
            to="/sos"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emergency-600 to-emergency-500 hover:from-emergency-500 hover:to-emergency-400 text-white text-xs font-bold shadow-lg shadow-emergency-600/40 hover:shadow-emergency-600/60 transition-all uppercase tracking-wider"
          >
            <AlertCircle className="w-4 h-4" />
            <span>SOS</span>
          </Link>

          {/* User Account / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link to="/dashboard" className="flex items-center gap-2 text-xs text-slate-300 hover:text-white">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-medium">{user?.full_name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900"
            >
              <span>Sign In</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
