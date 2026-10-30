import React, { useEffect, useState } from 'react';
import { Settings, Shield, Mic, MapPin, Volume2, Film, CheckCircle2, Save } from 'lucide-react';
import { api } from '../services/api';
import { UserSafetySettings, UserConsent } from '@safewalk/shared-types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSafetySettings | null>(null);
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getSafetySettings(), api.getConsents()]).then(([s, c]) => {
      setSettings(s);
      setConsents(c);
    });
  }, []);

  const handleToggleConsent = async (consentType: string, currentGranted: boolean) => {
    try {
      const updated = await api.updateConsent(consentType, !currentGranted);
      setConsents((prev) => prev.map((c) => (c.consent_type === consentType ? updated : c)));
    } catch (err: any) {
      alert(`Failed to update consent: ${err.message}`);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccessMessage(null);
    try {
      const res = await api.updateSafetySettings(settings);
      setSettings(res);
      setSuccessMessage('Safety configuration successfully saved & synced with emergency server.');
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Safety Preferences & Statutory Consents</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure emergency voice triggers, sensor permissions, and law enforcement 112 dispatch authorizations
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Voice Detection Settings */}
      {settings && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Mic className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Voice Trigger Configuration</h3>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-200 block">Enable Emergency Voice Trigger</span>
                <span className="text-[11px] text-slate-400">Listens for configured phrases during high-risk walking journeys</span>
              </div>
              <input
                type="checkbox"
                checked={settings.voice_detection_enabled}
                onChange={(e) => setSettings({ ...settings, voice_detection_enabled: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
            </label>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Primary Trigger Phrase</label>
              <input
                type="text"
                value={settings.emergency_phrase_config?.primary_phrase || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergency_phrase_config: {
                      ...settings.emergency_phrase_config,
                      primary_phrase: e.target.value
                    }
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Voice Recognition Sensitivity</label>
              <select
                value={settings.emergency_phrase_config?.sensitivity || 'medium'}
                onChange={(e: any) =>
                  setSettings({
                    ...settings,
                    emergency_phrase_config: {
                      ...settings.emergency_phrase_config,
                      sensitivity: e.target.value
                    }
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="low">Low (Requires strict exact pronunciation)</option>
                <option value="medium">Medium (Standard acoustic detection)</option>
                <option value="high">High (Maximum sensitivity with confirmation step)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Privacy & Consent Settings (DPDP Act) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Statutory User Consents & Authorizations</h3>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              type: 'location_tracking',
              title: 'Real-Time Location Sharing',
              desc: 'Allows transmission of high-precision GPS coordinates during active SOS events'
            },
            {
              type: 'microphone_emergency',
              title: 'Emergency Audio Capture',
              desc: 'Permits recording 15-second audio evidence buffer when an alert is active'
            },
            {
              type: 'police_dispatch_112',
              title: 'National 112 ERSS Police Dispatch Gateway',
              desc: 'Authorizes automated packet transmission to emergency services dispatch centers'
            }
          ].map((item) => {
            const consent = consents.find((c) => c.consent_type === item.type);
            const isGranted = consent ? consent.granted : false;

            return (
              <div
                key={item.type}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{item.title}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConsent(item.type, isGranted)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-colors ${
                    isGranted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isGranted ? 'GRANTED' : 'REVOKED'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emergency-600/30 transition-transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};
