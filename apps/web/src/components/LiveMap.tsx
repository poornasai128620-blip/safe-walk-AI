import React, { useState } from 'react';
import { MapPin, Camera, Shield, Navigation, AlertTriangle, Radio } from 'lucide-react';
import { IncidentLocation, AuthorizedCamera } from '@safewalk/shared-types';

interface LiveMapProps {
  locations?: IncidentLocation[];
  activeLocation?: IncidentLocation | null;
  cameras?: Array<AuthorizedCamera & { distance_meters?: number }>;
  interactive?: boolean;
  className?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  locations = [],
  activeLocation,
  cameras = [],
  className = 'h-96 w-full'
}) => {
  const [selectedPin, setSelectedPin] = useState<{ type: 'incident' | 'camera'; data: any } | null>(null);

  // Focus coordinate
  const currentLat = activeLocation?.latitude || (locations.length > 0 ? locations[locations.length - 1].latitude : 28.6315);
  const currentLon = activeLocation?.longitude || (locations.length > 0 ? locations[locations.length - 1].longitude : 77.2167);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-800 bg-[#070D18] radar-grid ${className}`}>
      {/* Top Map HUD */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-slate-300">
            {currentLat.toFixed(5)}° N, {currentLon.toFixed(5)}° E
          </span>
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded border border-emerald-500/30">
            GPS LOCK ±{activeLocation?.accuracy_meters || 4.2}m
          </span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-20 glass-panel px-3 py-1.5 rounded-lg text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emergency-500 animate-pulse"></span>
          <span>SOS Incident</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Authorized CCTV</span>
        </div>
      </div>

      {/* Tactical Canvas Representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Animated Radar Sweep */}
        <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/10 pointer-events-none">
          <div className="w-full h-full rounded-full border border-cyan-500/20 scale-75"></div>
          <div className="w-full h-full rounded-full border border-cyan-500/30 scale-50"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/5 to-transparent animate-radar-sweep"></div>
        </div>

        {/* Tactical Roads & Corridors (Vector Lines) */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-800/80 stroke-[1.5] fill-none">
          <path d="M 0 150 Q 300 200 800 120" />
          <path d="M 120 0 Q 250 300 350 600" />
          <path d="M 400 0 L 400 600" />
          <path d="M 0 350 L 900 350" strokeDasharray="4 4" />
          {/* Breadcrumb Path Trail */}
          <path d="M 360 270 L 380 290 L 420 280 L 450 310" className="stroke-emergency-500/60 stroke-[3] stroke-dasharray-[6 6]" />
        </svg>

        {/* Center: Live Emergency Incident Pin */}
        <div 
          onClick={() => setSelectedPin({ type: 'incident', data: activeLocation })}
          className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: '50%', top: '50%' }}
        >
          {/* Accuracy Halo */}
          <div className="absolute -inset-6 rounded-full bg-emergency-600/20 border border-emergency-500/40 animate-pulse"></div>
          {/* Pin */}
          <div className="relative w-10 h-10 rounded-full bg-emergency-600 border-2 border-white flex items-center justify-center shadow-xl shadow-emergency-600/80 group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 border border-emergency-500/40 text-[10px] text-emergency-400 font-bold px-2 py-0.5 rounded shadow">
            ACTIVE SOS
          </div>
        </div>

        {/* Nearby CCTV Camera Pins */}
        {cameras.slice(0, 4).map((cam, idx) => {
          const offsets = [
            { x: -140, y: -80 },
            { x: 130, y: 70 },
            { x: -90, y: 110 },
            { x: 160, y: -100 }
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <div
              key={cam.id}
              onClick={() => setSelectedPin({ type: 'camera', data: cam })}
              className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
            >
              {/* Coverage radius circle */}
              <div className="absolute -inset-5 rounded-full border border-cyan-500/20 bg-cyan-500/5 group-hover:bg-cyan-500/15 transition-colors"></div>
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-cyan-400/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/80 border border-slate-800 text-[9px] text-slate-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {cam.camera_name.slice(0, 20)}...
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedPin && (
        <div className="absolute bottom-3 left-3 right-3 z-30 glass-panel-elevated p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${selectedPin.type === 'incident' ? 'bg-emergency-600/30 text-emergency-400' : 'bg-cyan-600/30 text-cyan-400'}`}>
                {selectedPin.type === 'incident' ? 'Verified Incident Coordinate' : 'Authorized CCTV Node'}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {selectedPin.data?.id?.slice(0, 8)}...</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-1">
              {selectedPin.type === 'incident' 
                ? `GPS Accuracy: ±${selectedPin.data?.accuracy_meters || 4}m | Altitude: ${selectedPin.data?.altitude_meters || 215}m`
                : `${selectedPin.data?.camera_name} (${selectedPin.data?.external_camera_id})`}
            </p>
          </div>
          <button
            onClick={() => setSelectedPin(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
