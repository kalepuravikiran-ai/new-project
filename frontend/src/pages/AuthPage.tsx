import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Sprout,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loginAsDemo, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [role, setRole] = useState<'agronomist' | 'farm_manager' | 'field_worker'>('agronomist');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName, farmName, role);
        setSuccessMsg('Account created successfully! Redirecting...');
      } else {
        await signIn(email, password);
      }
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const handleQuickDemo = (demoRole: 'agronomist' | 'farm_manager' | 'field_worker') => {
    loginAsDemo(demoRole);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-emerald-500/20 mb-3">
          <Sprout className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white">
          Agri-AURA Identity & Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Secure agronomic telemetry with Supabase Auth & Row Level Security
        </p>
      </div>

      {/* 1-Click Persona Evaluator */}
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-6 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-4 h-4" /> Quick Hackathon Evaluation (1-Click Login)
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemo('agronomist')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 font-bold text-white text-center hover:border-emerald-400 transition-colors"
          >
            Agronomist
            <span className="block text-[10px] text-emerald-400 font-normal mt-0.5">Dr. Sarah Vance</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('farm_manager')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 font-bold text-white text-center hover:border-amber-400 transition-colors"
          >
            Farm Manager
            <span className="block text-[10px] text-amber-400 font-normal mt-0.5">Marcus Holloway</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('field_worker')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/30 font-bold text-white text-center hover:border-sky-400 transition-colors"
          >
            Field Worker
            <span className="block text-[10px] text-sky-400 font-normal mt-0.5">Carlos Mendez</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-white focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Farm or Enterprise Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Blue Valley AgriTech"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-white focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Agricultural Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:ring-1 focus:ring-emerald-500 text-xs"
                >
                  <option value="agronomist">Agronomist / Pathology Specialist</option>
                  <option value="farm_manager">Farm Operations Manager</option>
                  <option value="field_worker">Field Technician / Tractor Operator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agronomist@farm.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-white focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-white focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Supabase Account' : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
