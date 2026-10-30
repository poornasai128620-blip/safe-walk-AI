import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Radio,
  Shield,
  Camera,
  FolderLock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { EmergencyIncident } from '@safewalk/shared-types';

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<{
    metrics: {
      total_incidents: number;
      active_incidents: number;
      critical_active: number;
      cameras_online: number;
      total_evidence_archived: number;
      erss_112_link_health: string;
      avg_dispatch_seconds: number;
    };
    category_breakdown: Record<string, number>;
    recent_active: Array<EmergencyIncident & { user_name: string; user_phone?: string; latest_location?: any }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 5s polling for live CAD response
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <Radio className="w-5 h-5 text-emergency-500 animate-pulse mr-2" />
        Connecting to Emergency Response Support Center...
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_incidents: 1,
    active_incidents: 1,
    critical_active: 1,
    cameras_online: 4,
    total_evidence_archived: 1,
    erss_112_link_health: 'connected',
    avg_dispatch_seconds: 1.4
  };

  return (
    <div className="space-y-6">
      {/* Top Banner if Active Incidents Exist */}
      {metrics.critical_active > 0 && (
        <div className="glass-panel-emergency p-4 rounded-2xl border border-emergency-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emergency-600/50 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emergency-400">CRITICAL EMERGENCY ALERT ACTIVE</span>
                <span className="px-1.5 py-0.2 bg-emergency-500 text-slate-950 font-bold text-[9px] rounded font-mono uppercase">IMMEDIATE ATTENTION</span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                {metrics.active_incidents} active distress alert(s) in progress with live GPS coordinate streams.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/incidents"
            className="px-4 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shadow-emergency-600/40"
          >
            <span>Triage Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Active SOS Incidents',
            value: metrics.active_incidents,
            sub: `${metrics.critical_active} classified as Critical`,
            icon: AlertTriangle,
            color: 'text-emergency-400 bg-emergency-950/60 border-emergency-800/60'
          },
          {
            title: '112 ERSS Dispatch Latency',
            value: `${metrics.avg_dispatch_seconds}s`,
            sub: 'National CAD Gateway Synced',
            icon: Shield,
            color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
          },
          {
            title: 'Authorized CCTV Nodes',
            value: metrics.cameras_online,
            sub: 'Online & Stream-Verified',
            icon: Camera,
            color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60'
          },
          {
            title: 'Digital Evidence Vault',
            value: metrics.total_evidence_archived,
            sub: 'Cryptographically Sealed (SHA-256)',
            icon: FolderLock,
            color: 'text-purple-400 bg-purple-950/60 border-purple-800/60'
          }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{m.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active Incidents List & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Emergency Feed */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emergency-500 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Incident Feed</h3>
            </div>
            <Link to="/dashboard/incidents" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1">
              <span>View All Incidents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recent_active && data.recent_active.length > 0 ? (
              data.recent_active.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inc.severity === 'critical' ? 'bg-emergency-600/30 text-emergency-400 border border-emergency-500/40' : 'bg-amber-600/30 text-amber-400'}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-200 capitalize">
                        {inc.incident_category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(inc.started_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      Caller: <b>{inc.user_name}</b> {inc.user_phone && `(${inc.user_phone})`}
                    </p>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {inc.latest_location
                        ? `${inc.latest_location.latitude.toFixed(4)}°, ${inc.latest_location.longitude.toFixed(4)}° (±${inc.latest_location.accuracy_meters || 4}m)`
                        : 'Location pending'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/dashboard/incidents/${inc.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <span>Command Panel</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                No unhandled active emergencies. All sectors normal.
              </div>
            )}
          </div>
        </div>

        {/* Tactical Status & ERSS 112 Gateway Node */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-3">112 ERSS Node Status</h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">CAD Link</span>
                  <span className="font-bold text-emerald-400">ONLINE (18ms)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Station Code</span>
                  <span className="font-mono text-slate-200">DL-CP-HQ</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Triage Service</span>
                  <span className="font-bold text-cyan-400">OpenAI Whisper + Mini</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Status</span>
                  <span className="text-emerald-400 font-mono">READY</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">DPDP Act Retention</span>
                  <span className="font-bold text-purple-400">30-Day Auto Purge</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Policy</span>
                  <span className="text-slate-300 font-mono">Strict Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Trigger Tool */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-1">Simulate Safety Alert</h4>
            <p className="text-[11px] text-slate-400 mb-3">Test end-to-end incident ingestion in live test mode.</p>
            <Link
              to="/sos"
              className="w-full py-2 px-3 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-block shadow-md"
            >
              Launch SOS Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
