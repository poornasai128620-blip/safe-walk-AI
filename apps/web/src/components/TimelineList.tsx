import React from 'react';
import { Radio, MapPin, Volume2, Film, Users, Shield, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { IncidentTimelineItem } from '@safewalk/shared-types';

interface TimelineListProps {
  timeline: IncidentTimelineItem[];
}

export const TimelineList: React.FC<TimelineListProps> = ({ timeline = [] }) => {
  if (timeline.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
        No chronological audit events registered.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sos_triggered':
        return <Radio className="w-3.5 h-3.5 text-emergency-400" />;
      case 'location_updated':
        return <MapPin className="w-3.5 h-3.5 text-cyan-400" />;
      case 'audio_captured':
        return <Volume2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'video_captured':
        return <Film className="w-3.5 h-3.5 text-pink-400" />;
      case 'contact_notified':
        return <Users className="w-3.5 h-3.5 text-amber-400" />;
      case '112_dispatch_submitted':
      case '112_dispatch_acknowledged':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'resolved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {timeline.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            {getEventIcon(item.event_type)}
          </div>

          <div className="glass-panel p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-200 capitalize">
                {item.event_type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {item.event_description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
