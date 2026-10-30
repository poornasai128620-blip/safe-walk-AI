import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Radio,
  MapPin,
  Mic,
  Camera,
  Users,
  AlertCircle,
  Lock,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Activity
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { EmergencySOSButton } from '../components/EmergencySOSButton';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emergency-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-emergency-500/30 text-xs font-semibold text-emergency-400">
                <span className="w-2 h-2 rounded-full bg-emergency-500 animate-pulse"></span>
                <span>Production-Ready Emergency Response Platform</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400">112 ERSS India</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
                Your Voice. <br />
                Your Location. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emergency-500 via-rose-400 to-amber-400">
                  Your Safety.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                SafeWalk AI empowers women, solo travelers, elderly citizens, and children with instant voice-activated emergency triggers, real-time GPS tracking, trusted contact broadcasts, and verified 112 emergency response integrations.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/sos"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emergency-600 to-emergency-500 hover:from-emergency-500 hover:to-emergency-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-emergency-600/40 hover:shadow-emergency-600/60 transition-all flex items-center gap-2 uppercase"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Launch Web Emergency SOS</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-xl glass-panel-elevated hover:bg-slate-800/80 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Responder Command Center</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Security & Regulatory Guarantees */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">112 ERSS Ready</span>
                  <span className="text-[11px] text-slate-400 block leading-tight">India National Emergency Architecture</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">DPDP Act Compliant</span>
                  <span className="text-[11px] text-slate-400 block leading-tight">Strict Consent & Digital Privacy</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">SHA-256 Custody</span>
                  <span className="text-[11px] text-slate-400 block leading-tight">Cryptographic Evidence Integrity</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive SOS Demonstration Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emergency-500 animate-ping"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Interactive SOS Checkpoint</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                    GPS SENSOR READY
                  </span>
                </div>

                <EmergencySOSButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Moments When Every Second Counts</h2>
            <p className="text-sm text-slate-400 mt-2">
              Unlike generic tracking apps, SafeWalk AI combines edge voice triggers, cryptographic evidence custody, and official CAD integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
                title: 'AI Voice Detection',
                desc: 'Configure custom trigger phrases like "SafeWalk Emergency Help" or "Bachao". Edge transcription initiates fast alert verification.'
              },
              {
                icon: MapPin,
                color: 'text-emergency-400 bg-emergency-950/60 border-emergency-800/60',
                title: 'Live Tactical GPS Tracking',
                desc: 'Streams verified coordinates, altitude, and accuracy radiuses to authorized responders without public coordinate leaks.'
              },
              {
                icon: PhoneCall,
                color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
                title: 'National 112 ERSS Integration',
                desc: 'Standardized emergency incident payloads for rapid dispatch submission with tamper-evident audit trails.'
              },
              {
                icon: Camera,
                color: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
                title: 'Authorized CCTV Registry',
                desc: 'Automates geographic lookup of certified security cameras near the incident location with authorized chain of custody.'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emergency-500" />
            <span className="font-bold text-slate-300">SafeWalk AI</span>
            <span>— Production-Grade Emergency Response Technology</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/sos" className="hover:text-white">Web SOS</Link>
            <Link to="/login" className="hover:text-white">Responder Login</Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">© 2026 SafeWalk AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
