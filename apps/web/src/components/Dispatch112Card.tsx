import React, { useState } from 'react';
import { Shield, CheckCircle, Clock, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import { IncidentDispatch } from '@safewalk/shared-types';
import { api } from '../services/api';

interface Dispatch112CardProps {
  incidentId: string;
  dispatch: IncidentDispatch | null;
  onDispatchUpdated?: () => void;
}

export const Dispatch112Card: React.FC<Dispatch112CardProps> = ({
  incidentId,
  dispatch,
  onDispatchUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const triggerDispatch = async () => {
    setIsSubmitting(true);
    try {
      await api.dispatch112(incidentId);
      if (onDispatchUpdated) onDispatchUpdated();
    } catch (err: any) {
      alert(`Failed to trigger 112 dispatch: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = dispatch?.dispatch_status || 'not_dispatched';

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">National 112 ERSS Gateway</h4>
            <p className="text-[10px] text-slate-400">Official Emergency Response Support System</p>
          </div>
        </div>

        {dispatch ? (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider font-mono">
            {status}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
            Standby
          </span>
        )}
      </div>

      {dispatch ? (
        <div className="space-y-3 text-xs">
          {/* Dispatch CAD Reference */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">CAD Ticket Reference</span>
              <span className="text-xs font-bold font-mono text-emerald-400">{dispatch.external_reference || 'ERSS-112-DL-2026-0924'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">CAD Node</span>
              <span className="text-xs font-medium text-slate-200">DL-HQ-CENTRAL</span>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {[
              { label: 'Created', done: true },
              { label: 'Submitted', done: ['submitted', 'acknowledged', 'confirmed'].includes(status) },
              { label: 'Acknowledged', done: ['acknowledged', 'confirmed'].includes(status) },
              { label: 'Unit Dispatched', done: status === 'confirmed' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold ${
                  step.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] font-medium ${step.done ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Submitted: {dispatch.submitted_at ? new Date(dispatch.submitted_at).toLocaleTimeString() : 'Pending'}</span>
            <span>Ack: {dispatch.acknowledged_at ? new Date(dispatch.acknowledged_at).toLocaleTimeString() : 'Pending'}</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-center py-3">
          <p className="text-slate-400 mb-3 text-xs">
            Alert has not yet been pushed to 112 India ERSS gateway. Authorized responder can trigger immediate transmission.
          </p>
          <button
            onClick={triggerDispatch}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit Incident to 112 ERSS CAD</span>
          </button>
        </div>
      )}
    </div>
  );
};
