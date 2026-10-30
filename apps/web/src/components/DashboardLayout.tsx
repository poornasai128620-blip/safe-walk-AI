import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Camera,
  FolderLock,
  Users,
  ShieldCheck,
  Settings,
  Radio,
  Activity,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Incident Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Active Incidents', path: '/dashboard/incidents', icon: AlertTriangle, badge: 'Live' },
    { label: 'Tactical Situation Map', path: '/dashboard/map', icon: MapPin },
    { label: 'CCTV Camera Registry', path: '/dashboard/cameras', icon: Camera },
    { label: 'Evidence Locker', path: '/dashboard/evidence', icon: FolderLock },
    { label: 'Trusted Contacts', path: '/dashboard/contacts', icon: Users },
    { label: 'Security Audit Logs', path: '/dashboard/audit-logs', icon: ShieldCheck },
    { label: 'System & 112 Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080C14]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emergency-600 flex items-center justify-center shadow-lg shadow-emergency-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                SafeWalk<span className="text-emergency-500">.AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">CAD / Responder Console</p>
            </div>
          </div>
        </div>

        {/* Live System Gateway Status */}
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/90 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ERSS 112 Gateway
            </span>
            <span className="text-emerald-400 text-[10px] uppercase font-mono">Synced</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Latency: 18ms</span>
            <span>AI: Whisper + GPT</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emergency-600/15 text-emergency-400 border border-emergency-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emergency-500/20 text-emergency-400 border border-emergency-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Identity & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Authorized Responder'}</p>
                <span className="inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  {role}
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-950/60 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono">
              SESSION: <span className="text-slate-200">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </span>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>National CAD Node: <b>MH-MUMBAI-01</b></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/sos"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-emergency-600 hover:bg-emergency-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Trigger Test SOS</span>
            </NavLink>
          </div>
        </header>

        {/* Route Outlet */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
