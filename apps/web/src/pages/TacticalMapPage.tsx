import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Radio, Camera, Shield, Filter } from 'lucide-react';
import { api } from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { EmergencyIncident, AuthorizedCamera } from '@safewalk/shared-types';

export const TacticalMapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [cameras, setCameras] = useState<AuthorizedCamera[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incList, camList] = await Promise.all([
          api.getIncidents(),
          api.getAuthorizedCameras()
        ]);
        setIncidents(incList);
        setCameras(camList);
        if (incList.length > 0) setSelectedIncident(incList[0]);
      } catch (err) {
        console.error('Failed to load tactical map data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <span>Tactical Situational Awareness Map</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time geospatial overlay of active SOS coordinates, coverage corridors, and registered CCTV nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Map Viewport */}
        <div className="lg:col-span-9">
          <LiveMap
            locations={selectedIncident?.latest_location ? [selectedIncident.latest_location] : []}
            activeLocation={selectedIncident?.latest_location}
            cameras={cameras}
            className="h-[600px] w-full"
          />
        </div>

        {/* Sidebar: Incidents & Node Filter */}
        <div className="lg:col-span-3 space-y-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Active Geospatial Targets</h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedIncident?.id === inc.id
                      ? 'bg-emergency-600/20 border-emergency-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="capitalize">{inc.incident_category.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] uppercase font-mono">{inc.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 truncate">
                    {inc.user_profile?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    {inc.latest_location ? `${inc.latest_location.latitude.toFixed(4)}°, ${inc.latest_location.longitude.toFixed(4)}°` : 'Location pending'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
