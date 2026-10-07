import React, { useEffect, useState } from 'react';
import { api } from '../services/api.client.js';
import { AgentTelemetry } from '../types/index.js';
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Compass,
  Microscope,
  MessageSquare,
  Sparkles,
  Zap,
  Server
} from 'lucide-react';

export const AgentMonitoringPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastPing, setLastPing] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    async function fetchAgents() {
      try {
        const data = await api.getAgentMonitoring();
        setAgents(data);
        setLastPing(new Date().toLocaleTimeString());
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // 10s live ping
    return () => clearInterval(interval);
  }, []);

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'PLANNER':
        return <Compass className="w-5 h-5 text-sky-400" />;
      case 'RESEARCHER':
        return <Microscope className="w-5 h-5 text-emerald-400" />;
      case 'DECISION':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'VERIFIER':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'EXECUTOR':
        return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      case 'COMMUNICATOR':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agent System Monitoring & Telemetry
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time health, latency distributions, and safety gatekeeper rejections across all 6 specialized agents
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Last Health Ping: <strong className="text-white">{lastPing}</strong></span>
        </div>
      </div>

      {/* Aggregate Architecture Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-emerald-950/20">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Invocations
            </span>
            <div className="text-2xl font-black text-white mt-1">924 Runs</div>
            <span className="text-[11px] text-emerald-400 font-medium">100% Pipeline Uptime</span>
          </div>

          <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Average Chain Latency
            </span>
            <div className="text-2xl font-black text-sky-400 mt-1">1,780 ms</div>
            <span className="text-[11px] text-slate-400 font-medium">Sub-2s Full Synthesis</span>
          </div>

          <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-4">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              HITL Intercept Rate
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">27.5%</div>
            <span className="text-[11px] text-amber-400 font-medium">High-risk biocides halted</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Reasoning Engine
            </span>
            <div className="text-2xl font-black text-emerald-300 mt-1">Gemini 2.5/3.8</div>
            <span className="text-[11px] text-slate-400 font-medium">Deterministic JSON Schemas</span>
          </div>
        </div>
      </div>

      {/* Agents Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.role}
            className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between glass-panel-hover"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {getAgentIcon(agent.role)}
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {agent.status}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {agent.role} AGENT
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {agent.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Executions</span>
                <strong className="text-white font-mono">{agent.executionCount}</strong>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Success Rate</span>
                <strong className="text-emerald-400 font-mono">{agent.successRatePct}%</strong>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg. Step Latency</span>
                <strong className="text-sky-400 font-mono">{agent.avgLatencyMs} ms</strong>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${agent.successRatePct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
