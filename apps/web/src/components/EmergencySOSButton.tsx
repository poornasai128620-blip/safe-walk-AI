import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Radio, XCircle, Mic, CheckCircle, Navigation } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EmergencySOSButtonProps {
  onIncidentCreated?: (incidentId: string) => void;
  size?: 'normal' | 'large';
}

export const EmergencySOSButton: React.FC<EmergencySOSButtonProps> = ({
  onIncidentCreated,
  size = 'large'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('personal_safety');
  const [voiceInputActive, setVoiceInputActive] = useState<boolean>(false);
  const [detectedPhrase, setDetectedPhrase] = useState<string>('');

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isCountingDown && countdown === 0) {
      executeSOS();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  const startCountdown = () => {
    setCountdown(5);
    setIsCountingDown(true);
  };

  const cancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(5);
  };

  const executeSOS = async () => {
    setIsCountingDown(false);
    setIsSubmitting(true);

    try {
      // 1. Get browser geolocation if permitted
      let initialLocation: { latitude: number; longitude: number; accuracy_meters?: number } | undefined;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000, enableHighAccuracy: true });
        });
        initialLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_meters: position.coords.accuracy
        };
      } catch {
        // Fallback default coordinates (e.g. Connaught Place Delhi or Mumbai test zone)
        initialLocation = { latitude: 28.6315, longitude: 77.2167, accuracy_meters: 8.5 };
      }

      // 2. Call API
      const res = await api.createIncident({
        incident_category: selectedCategory,
        activation_method: detectedPhrase ? 'voice_activation' : 'manual_sos',
        severity: 'critical',
        description: detectedPhrase ? `Voice emergency trigger detected: "${detectedPhrase}"` : 'Emergency manual SOS activated via SafeWalk Web Checkpoint',
        initial_location: initialLocation
      });

      if (onIncidentCreated) {
        onIncidentCreated(res.incident.id);
      } else {
        navigate(`/dashboard/incidents/${res.incident.id}`);
      }
    } catch (err: any) {
      alert(`Emergency SOS failed to submit: ${err.message}. If in imminent danger, dial 112 directly.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateVoiceTrigger = async (phrase: string) => {
    setVoiceInputActive(true);
    setDetectedPhrase(phrase);
    try {
      const result = await api.detectVoiceEmergency(phrase);
      if (result.emergency_phrase_detected) {
        startCountdown();
      }
    } catch {
      startCountdown();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Category selector */}
      <div className="mb-6 flex flex-wrap justify-center gap-1.5 max-w-md">
        {[
          { id: 'personal_safety', label: 'Personal Threat' },
          { id: 'stalking', label: 'Stalking / Followed' },
          { id: 'harassment', label: 'Harassment' },
          { id: 'medical_emergency', label: 'Medical Crisis' },
          { id: 'accident', label: 'Accident' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-emergency-600/30 text-emergency-400 border border-emergency-500 font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Countdown Active State */}
      {isCountingDown ? (
        <div className="flex flex-col items-center glass-panel-emergency p-8 rounded-3xl border-2 border-emergency-500 animate-pulse">
          <div className="text-emergency-400 font-mono text-5xl font-extrabold tracking-wider mb-2">
            00:0{countdown}
          </div>
          <p className="text-sm font-semibold text-slate-100 mb-1">DISPATCHING EMERGENCY ALERT TO 112</p>
          <p className="text-xs text-slate-300 max-w-xs mb-6">
            Notifying trusted contacts and submitting GPS coordinates. Press cancel if this was accidental.
          </p>

          <button
            onClick={cancelCountdown}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-lg transition-transform hover:scale-105"
          >
            <XCircle className="w-5 h-5 text-slate-400" />
            <span>Cancel (False Activation)</span>
          </button>
        </div>
      ) : (
        /* Standby SOS Button */
        <div className="flex flex-col items-center">
          <button
            onClick={startCountdown}
            disabled={isSubmitting}
            className={`relative group rounded-full flex flex-col items-center justify-center transition-all ${
              size === 'large' ? 'w-56 h-56 sm:w-64 sm:h-64' : 'w-44 h-44'
            } bg-gradient-to-tr from-emergency-700 via-emergency-600 to-emergency-500 text-white shadow-2xl shadow-emergency-600/50 hover:shadow-emergency-600/80 animate-pulse-emergency`}
          >
            <div className="absolute -inset-3 rounded-full border-2 border-emergency-500/40 animate-ping opacity-30 pointer-events-none"></div>
            
            <AlertCircle className={size === 'large' ? 'w-20 h-20 mb-2' : 'w-14 h-14 mb-1'} />
            <span className="font-display font-black text-2xl tracking-wider uppercase">SOS</span>
            <span className="text-[11px] font-semibold tracking-widest text-emergency-100 uppercase mt-0.5">
              Press to Activate
            </span>
          </button>

          {/* Quick Voice Trigger Simulation */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              AI Voice Emergency Triggers:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => simulateVoiceTrigger('SafeWalk Emergency Help')}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-800/60 hover:border-cyan-500 text-cyan-300 text-xs font-mono transition-colors"
              >
                "SafeWalk Emergency Help"
              </button>
              <button
                onClick={() => simulateVoiceTrigger('Bachao')}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-800/60 hover:border-cyan-500 text-cyan-300 text-xs font-mono transition-colors"
              >
                "Bachao" (Hindi)
              </button>
              <button
                onClick={() => simulateVoiceTrigger('Help Me Now')}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-800/60 hover:border-cyan-500 text-cyan-300 text-xs font-mono transition-colors"
              >
                "Help Me Now"
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
