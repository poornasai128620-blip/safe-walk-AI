import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Filter, MapPin, ChevronRight, CheckCircle2, XCircle, Radio, Clock } from 'lucide-react';
import { api } from '../services/api';
import { EmergencyIncident } from '@safewalk/shared-types';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = inc.user_profile?.full_name?.toLowerCase() || '';
      const desc = inc.description?.toLowerCase() || '';
      const id = inc.id.toLowerCase();
      const cat = inc.incident_category.toLowerCase();
      if (!name.includes(q) && !desc.includes(q) && !id.includes(q) && !cat.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emergency-500" />
            <span>Emergency Incident Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review active and resolved incidents with full audit chain of custody</p>
        </div>

        <Link
          to="/sos"
          className="px-3.5 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emergency-600/30 self-start sm:self-auto"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>New Emergency SOS</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by caller, category, ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
          {['all', 'active', 'resolved', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-emergency-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading incident records...</div>
        ) : filteredIncidents.length > 0 ? (
          filteredIncidents.map((inc) => {
            const isCritical = inc.severity === 'critical';
            const isActive = inc.status === 'active';

            return (
              <div
                key={inc.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isActive ? 'border-emergency-500/40 bg-slate-900/90' : 'border-slate-800/80'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-emergency-600/30 text-emergency-400 border border-emergency-500/50'
                          : 'bg-amber-600/30 text-amber-400'
                      }`}
                    >
                      {inc.severity}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {inc.status}
                    </span>

                    <span className="text-xs font-bold text-slate-200 capitalize">
                      {inc.incident_category.replace(/_/g, ' ')}
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {inc.id.slice(0, 8)}...
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    Caller: <span className="font-semibold text-white">{inc.user_profile?.full_name || 'Anonymous SafeWalk User'}</span>
                    {inc.user_profile?.phone_number && ` • ${inc.user_profile.phone_number}`}
                  </p>

                  {inc.description && (
                    <p className="text-xs text-slate-400 italic">"{inc.description}"</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(inc.started_at).toLocaleString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {inc.latest_location
                        ? `${inc.latest_location.latitude.toFixed(4)}°, ${inc.latest_location.longitude.toFixed(4)}°`
                        : 'No GPS stream'}
                    </span>

                    <span className="text-purple-400">
                      {inc.evidence_count || 0} Evidence File(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/dashboard/incidents/${inc.id}`}
                    className="px-4 py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emergency-600/30 transition-transform active:scale-95"
                  >
                    <span>Inspect Incident</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
            No incidents matched your query.
          </div>
        )}
      </div>
    </div>
  );
};
