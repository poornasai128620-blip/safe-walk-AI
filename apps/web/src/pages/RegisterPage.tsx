import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'RESPONDER'>('USER');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        password,
        confirm_password: confirmPassword,
        role,
        terms_accepted: termsAccepted,
        privacy_consent: privacyConsent
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 flex flex-col justify-center items-center p-4 py-12">
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emergency-600 flex items-center justify-center shadow-lg shadow-emergency-600/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl text-white tracking-tight">SafeWalk<span className="text-emergency-500">.AI</span></span>
      </Link>

      <div className="max-w-md w-full glass-panel-elevated p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
        <h2 className="text-xl font-bold text-white text-center mb-1">Create SafeWalk Account</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Join the AI-powered emergency safety network</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-emergency-600/15 border border-emergency-500/30 text-emergency-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number (with country code)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  role === 'USER'
                    ? 'bg-emergency-600/20 border-emergency-500 text-emergency-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Citizen User
              </button>
              <button
                type="button"
                onClick={() => setRole('RESPONDER')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  role === 'RESPONDER'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Emergency Responder
              </button>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-2 pt-2 text-[11px] text-slate-400">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emergency-500"
              />
              <span>I accept SafeWalk AI Terms of Service and Emergency Protocols.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
              <span>I consent to temporary GPS and audio transmission during active SOS events (DPDP Act).</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !termsAccepted || !privacyConsent}
            className="w-full py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emergency-600/30 flex items-center justify-center gap-2 mt-4"
          >
            <span>Register & Initialize Safety Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
