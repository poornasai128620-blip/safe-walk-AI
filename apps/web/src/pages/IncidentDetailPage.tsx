import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Radio,
  MapPin,
  Shield,
  Phone,
  User,
  Clock,
  Camera,
  CheckCircle,
  XCircle,
  FolderLock,
  Sparkles,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { Dispatch112Card } from '../components/Dispatch112Card';
import { EvidencePlayer } from '../components/EvidencePlayer';
import { TimelineList } from '../components/TimelineList';
import { EmergencyIncident } from '@safewalk/shared-types';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadIncident = async () => {
    if (!id) return;
    try {
      const data = await api.getIncident(id);
      setIncident(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
    const interval = setInterval(loadIncident, 4000); // 4-second live polling for telemetry
    return () => clearInterval(interval);
  }, [id]);

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!id) return;
    setStatusUpdating(true);
    try {
      if (newStatus === 'cancelled') {
        await api.cancelIncident(id, reason || 'Operator marked accidental trigger');
      } else if (newStatus === 'resolved') {
        await api.resolveIncident(id, reason || 'Emergency responder closed incident as resolved');
      } else {
        await api.updateIncidentStatus(id, newStatus, reason);
      }
      await loadIncident();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRequestCCTV = async (cameraId: string) => {
    if (!id) return;
    try {
      await api.requestCCTVAccess(cameraId, id, 'Emergency responder immediate situational review');
      alert('Footage access authorized. Audit reference generated.');
      await loadIncident();
    } catch (err: any) {
      alert(`CCTV Request failed: ${err.message}`);
    }
  };

  if (loading && !incident) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        <Radio className="w-5 h-5 text-emergency-500 animate-pulse mr-2" />
        Retrieving incident telemetry & encrypted evidence...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-emergency-500/40">
        <AlertTriangle className="w-8 h-8 text-emergency-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white mb-1">Incident Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'The requested emergency record does not exist or access is restricted.'}</p>
        <Link to="/dashboard/incidents" className="text-xs text-cyan-400 hover:underline">
          Return to Incident Directory
        </Link>
      </div>
    );
  }

  const isCritical = incident.severity === 'critical';
  const isActive = incident.status === 'active';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/incidents"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isCritical ? 'bg-emergency-600/30 text-emergency-400 border border-emergency-500/50' : 'bg-amber-600/30 text-amber-400'}`}>
                {incident.severity}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {incident.status}
              </span>
              <h2 className="text-base font-bold text-white capitalize">
                {incident.incident_category.replace(/_/g, ' ')}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              INCIDENT ID: {incident.id} • Triggered: {new Date(incident.started_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Controls for Responder */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <>
              <button
                onClick={() => handleStatusChange('resolved', 'Responder resolved incident on scene')}
                disabled={statusUpdating}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
              <button
                onClick={() => handleStatusChange('cancelled', 'User reported accidental activation')}
                disabled={statusUpdating}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                <span>Cancel Alert</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleStatusChange('active', 'Re-opened by commanding officer')}
              disabled={statusUpdating}
              className="px-3 py-2 rounded-xl bg-emergency-600 text-white font-bold text-xs uppercase"
            >
              Reopen Incident
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column Map & Evidence | Right Column AI & Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Tactical Map, Location Telemetry, Evidence) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tactical Map */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Real-Time Tactical GPS Stream</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {incident.location_history?.length || 1} coordinate updates
              </span>
            </div>

            <LiveMap
              locations={incident.location_history}
              activeLocation={incident.latest_location}
              cameras={incident.nearby_cameras}
              className="h-80 w-full"
            />
          </div>

          {/* Caller Details Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Distress Caller</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-7 h-7 rounded-full bg-emergency-600 text-white flex items-center justify-center font-bold text-xs">
                  {incident.user_profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{incident.user_profile?.full_name || 'Anonymous User'}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{incident.user_profile?.phone_number || 'No phone recorded'}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Activation Mechanism</span>
              <span className="text-xs font-bold text-slate-200 block mt-1 uppercase font-mono">
                {incident.activation_method}
              </span>
              <span className="text-[11px] text-slate-400">
                {incident.description || 'Emergency SOS button triggered directly'}
              </span>
            </div>
          </div>

          {/* Evidence Locker */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Emergency Evidence Custody</h3>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                {incident.evidence?.length || 0} Files Archived
              </span>
            </div>

            <EvidencePlayer evidence={incident.evidence} />
          </div>

          {/* Authorized Nearby CCTV Cameras Registry Lookup */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Registered CCTV Cameras In Radius</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {incident.nearby_cameras?.length || 0} Nearby
              </span>
            </div>

            <div className="space-y-2">
              {incident.nearby_cameras && incident.nearby_cameras.length > 0 ? (
                incident.nearby_cameras.map((cam: any) => (
                  <div
                    key={cam.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">{cam.camera_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cam.external_camera_id} • Coverage: {cam.coverage_radius_meters}m • Distance: ~{cam.distance_meters || 120}m
                      </span>
                    </div>
                    <button
                      onClick={() => handleRequestCCTV(cam.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider transition-colors"
                    >
                      Request Footage
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No certified public CCTV cameras registered within immediate 1.2km radius.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis, 112 Gateway & Verified Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Analysis Component */}
          <AIAnalysisCard
            incidentDescription={incident.description}
            category={incident.incident_category}
            severity={incident.severity}
          />

          {/* National 112 ERSS Dispatch Component */}
          <Dispatch112Card
            incidentId={incident.id}
            dispatch={incident.dispatch}
            onDispatchUpdated={loadIncident}
          />

          {/* Chronological Incident Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Incident Event Timeline</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Tamper-Evident</span>
            </div>

            <TimelineList timeline={incident.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
};
