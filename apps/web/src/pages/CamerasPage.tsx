import React, { useEffect, useState } from 'react';
import { Camera, ShieldCheck, Activity, Search, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AuthorizedCamera } from '@safewalk/shared-types';

export const CamerasPage: React.FC = () => {
  const [cameras, setCameras] = useState<AuthorizedCamera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuthorizedCameras()
      .then(setCameras)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Authorized CCTV Infrastructure Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered municipal smart city, metro transit, and highway surveillance nodes for emergency evidence collection
          </p>
        </div>
      </div>

      {/* Advisory Alert */}
      <div className="p-4 rounded-xl glass-panel border border-cyan-500/30 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Strict Legal & Privacy Chain of Custody</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            SafeWalk AI adheres to Section 4.I of the National Emergency Response Framework. Camera feeds are never accessed without active incident context, explicit justification, and cryptographic audit logging. No public camera bypassing is permitted.
          </p>
        </div>
      </div>

      {/* Cameras Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
              <tr>
                <th className="p-4">Camera Identifier</th>
                <th className="p-4">Location & Coverage</th>
                <th className="p-4">Provider / Authority</th>
                <th className="p-4">Authorization</th>
                <th className="p-4">Health</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cameras.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block">{cam.camera_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{cam.external_camera_id}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    <div>{cam.latitude.toFixed(4)}° N, {cam.longitude.toFixed(4)}° E</div>
                    <span className="text-[10px] text-slate-500 font-sans">Coverage: ±{cam.coverage_radius_meters}m</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {cam.provider_name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase font-mono">
                      {cam.authorization_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {cam.integration_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => alert(`Simulated synthetic RTSP stream handshake verified for ${cam.external_camera_id}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                    >
                      Verify Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
