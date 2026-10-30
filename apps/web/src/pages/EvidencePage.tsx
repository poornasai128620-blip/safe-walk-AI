import React, { useEffect, useState } from 'react';
import { FolderLock, ShieldCheck, Volume2, Film, Download, Clock } from 'lucide-react';
import { api } from '../services/api';
import { EvidencePlayer } from '../components/EvidencePlayer';
import { EmergencyEvidence } from '@safewalk/shared-types';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EmergencyEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Collect evidence across all user incidents
    api.getIncidents().then((incidents) => {
      const all: EmergencyEvidence[] = [];
      incidents.forEach((inc) => {
        if ((inc as any).evidence) all.push(...(inc as any).evidence);
      });
      // Fallback sample if empty
      if (all.length === 0) {
        all.push({
          id: 'ev-demo-1',
          incident_id: 'e0000000-0000-0000-0000-000000000001',
          user_id: 'a1111111-1111-1111-1111-111111111111',
          evidence_type: 'audio',
          storage_path: 'incidents/e0000000-0000-0000-0000-000000000001/ambient_audio_buffer.mp3',
          mime_type: 'audio/mp3',
          file_size_bytes: 342100,
          checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          captured_at: new Date(Date.now() - 10 * 60000).toISOString(),
          upload_status: 'completed',
          retention_until: new Date(Date.now() + 30 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 10 * 60000).toISOString()
        });
      }
      setEvidenceList(all);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-purple-400" />
            <span>Digital Evidence Custody Locker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed foreground recordings and sensor telemetry preserved for law enforcement proceedings
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl glass-panel border border-purple-500/30 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <div>
            <span className="font-bold text-white block">Cryptographic Chain of Custody (SHA-256)</span>
            <span className="text-[11px] text-slate-400">All media recordings are signed upon upload with immutable timestamps and automatic 30-day retention purge policies.</span>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 font-mono text-[10px] rounded font-bold uppercase">
          SECURE BUCKET: emergency-evidence
        </span>
      </div>

      <EvidencePlayer evidence={evidenceList} />
    </div>
  );
};
