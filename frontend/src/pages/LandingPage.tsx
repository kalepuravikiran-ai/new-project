import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle,
  Activity,
  Droplets,
  AlertTriangle,
  Users,
  Compass,
  Microscope,
  FileCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute inset-0 -top-20 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Autonomous Multi-Agent Agronomic Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Precision Crop Advisory Powered by{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
            Deterministic AI Agents
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Agri-AURA systematically breaks down complex crop pathology, balances soil chemistry with weather telemetry, verifies chemical toxicity, and enforces human approval for high-risk interventions.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/advisor/new"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            Launch Advisory Engine <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-center gap-2"
          >
            Explore Farm Dashboard
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-white">6 Specialized</div>
            <div className="text-xs text-slate-400 mt-1">Autonomous Agents</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-emerald-400">100% Deterministic</div>
            <div className="text-xs text-slate-400 mt-1">Structured Outputs</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-amber-400">HITL Gatekeeper</div>
            <div className="text-xs text-slate-400 mt-1">Chemical Safety Audits</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-sky-400">Worker-Ready</div>
            <div className="text-xs text-slate-400 mt-1">Plain Language Plans</div>
          </div>
        </div>
      </section>

      {/* 6-Agent Architecture Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Autonomous Pipeline Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            The Agri-AURA 6-Agent Intelligence Chain
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every field symptom query flows chronologically through our specialized agronomic reasoning graph.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-400">AGENT 01</span>
            <h3 className="text-base font-bold text-white mt-1">Crop Planner Agent</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Decomposes multidimensional crop anomalies into chronological investigation subtasks and pinpoints high-priority diagnostic focus.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">AGENT 02</span>
            <h3 className="text-base font-bold text-white mt-1">Soil & Agronomic Researcher</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Analyzes soil N-P-K mineral levels, pH fixation dynamics, crop growth stages, and pathogen/pest vectors against empirical science.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-400">AGENT 03</span>
            <h3 className="text-base font-bold text-white mt-1">Intervention Decision Agent</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Formulates balanced biological vs. synthetic alternatives, calculating trade-offs and confidence-scored treatment options.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">AGENT 04</span>
            <h3 className="text-base font-bold text-white mt-1">Safety & Regulatory Verifier</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Audits WHO Class II toxicity, rain washoff hazards, and mandatory Pre-Harvest Intervals (PHI). Triggers strict human-in-the-loop approvals.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-400">AGENT 05</span>
            <h3 className="text-base font-bold text-white mt-1">Action Executor Agent</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Translates treatments into scheduled, actionable field tasks with precise dosage per acre, application timing, and equipment instructions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-400">AGENT 06</span>
            <h3 className="text-base font-bold text-white mt-1">Field Communicator Agent</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Distills complex biochemistry into unambiguous, non-technical, printable field instructions for farm hands and tractor operators.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & HITL Callout Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" /> Zero Ungoverned Synthetic Chemistry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Human-in-the-Loop (HITL) Gatekeeper
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike generic LLM chatbots that casually recommend dangerous or illegal pesticide mixtures, Agri-AURA halts execution whenever a WHO Class II biocide, restricted PHI window, or heavy chemical surge is detected. Certified managers must explicitly approve, modify, or reject treatments.
            </p>
            <div className="pt-2">
              <Link
                to="/advisor/new"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300"
              >
                Test Scenario 2 with High-Risk HITL Gatekeeper <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
