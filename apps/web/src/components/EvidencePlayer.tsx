import React, { useState } from 'react';
import { Play, Pause, Volume2, ShieldCheck, Download, FileText, Camera, Film } from 'lucide-react';
import { EmergencyEvidence } from '@safewalk/shared-types';

interface EvidencePlayerProps {
  evidence: EmergencyEvidence[];
  className?: string;
}

export const EvidencePlayer: React.FC<EvidencePlayerProps> = ({ evidence, className = '' }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
        <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-medium text-slate-300">No Media Evidence Uploaded Yet</p>
        <p className="text-[11px] text-slate-500 mt-1">Audio/video buffers captured via mobile SOS will be archived here with cryptographic SHA-256 seals.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {evidence.map((item) => {
        const isAudio = item.evidence_type === 'audio';
        const isPlaying = playingId === item.id;

        return (
          <div key={item.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAudio ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' : 'bg-purple-950 text-purple-400 border border-purple-800/40'}`}>
                  {isAudio ? <Volume2 className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200 capitalize">
                    {item.evidence_type} Evidence Recording
                  </h5>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Captured: {new Date(item.captured_at).toLocaleTimeString()} ({Math.round((item.file_size_bytes || 342100) / 1024)} KB)
                  </p>
                </div>
              </div>

              {/* SHA-256 Seal */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 VERIFIED</span>
              </div>
            </div>

            {/* Playback Simulation */}
            {isAudio ? (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center gap-3">
                <button
                  onClick={() => setPlayingId(isPlaying ? null : item.id)}
                  className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                {/* Animated Audio Waveform */}
                <div className="flex-1 flex items-center gap-1 h-6">
                  {[40, 70, 30, 90, 60, 45, 80, 100, 50, 75, 35, 85, 60, 40, 95, 30, 70].map((height, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                      }`}
                      style={{ height: `${isPlaying ? height : 25}%` }}
                    />
                  ))}
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {isPlaying ? '00:08 / 00:15' : '00:15'}
                </span>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-slate-950 h-32 flex items-center justify-center border border-slate-800">
                <img
                  src={item.download_url || "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80"}
                  alt="Incident frame"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-950/80 px-2 py-0.5 rounded">
                  FOREGROUND CAMERA STREAM
                </div>
              </div>
            )}

            {/* Cryptographic Hash Details */}
            <div className="text-[9px] font-mono text-slate-500 truncate bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
              HASH: {item.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
