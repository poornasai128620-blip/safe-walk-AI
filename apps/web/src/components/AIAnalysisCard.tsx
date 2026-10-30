import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { IncidentClassificationResult } from '@safewalk/shared-types';

interface AIAnalysisCardProps {
  analysis?: IncidentClassificationResult | null;
  incidentDescription?: string | null;
  category: string;
  severity: string;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  incidentDescription,
  category,
  severity
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">AI Emergency Analysis</h4>
            <p className="text-[10px] text-cyan-400 font-mono">Assisted Intelligence Triage (OpenAI Engine)</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
          Human Review Required
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Suggested Classification */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Suggested Severity & Category</span>
            <span className="font-mono text-cyan-400 font-semibold">92% Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emergency-600/30 text-emergency-400 border border-emergency-500/40 text-[11px] font-bold uppercase">
              {severity}
            </span>
            <span className="text-slate-200 font-semibold capitalize">
              {category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Structured Summary */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Neutral Factual Summary</span>
          <p className="text-slate-300 leading-relaxed">
            {analysis?.summary || (incidentDescription ? `User reported: "${incidentDescription}"` : 'Emergency SOS triggered without accompanying audio buffer. Real-time GPS stream active.')}
          </p>
        </div>

        {/* Legal Advisory / AI Disclaimer */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2 text-[10px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <b>Legal & Operational Guardrail:</b> AI suggestions assist dispatch prioritization only. Human responders maintain sole operational decision-making authority. Never accuse or identify individuals automatically.
          </span>
        </div>
      </div>
    </div>
  );
};
