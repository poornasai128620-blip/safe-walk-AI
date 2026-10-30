import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Phone, Radio, AlertTriangle } from 'lucide-react';
import { EmergencySOSButton } from '../components/EmergencySOSButton';

export const QuickSOSPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SafeWalk AI Home</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emergency-600/20 border border-emergency-500/40 text-emergency-400 text-xs font-bold uppercase font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Active Web Checkpoint</span>
        </div>
      </div>

      {/* Center SOS Arena */}
      <div className="max-w-xl mx-auto w-full py-8 text-center flex flex-col items-center">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Emergency SOS Trigger
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Press the emergency button to stream your live GPS coordinates, notify trusted contacts, and alert authorized emergency services.
          </p>
        </div>

        <div className="glass-panel-elevated p-8 rounded-3xl border border-slate-700/80 w-full shadow-2xl">
          <EmergencySOSButton
            onIncidentCreated={(id) => navigate(`/dashboard/incidents/${id}`)}
          />
        </div>

        {/* Immediate Direct Emergency Dial Fallback */}
        <div className="mt-8 p-4 rounded-2xl glass-panel border border-slate-800 w-full flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency-600/20 border border-emergency-500/40 flex items-center justify-center text-emergency-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Immediate Direct Phone Call</span>
              <span className="text-[11px] text-slate-400 block">Dial official emergency police and ambulance line directly</span>
            </div>
          </div>
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 whitespace-nowrap"
          >
            Call 112 Now
          </a>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="max-w-2xl mx-auto w-full text-center text-[11px] text-slate-500">
        SafeWalk AI provides assisted emergency response coordination. In critical life-threatening situations, always dial 112 directly if device audio allows.
      </div>
    </div>
  );
};
