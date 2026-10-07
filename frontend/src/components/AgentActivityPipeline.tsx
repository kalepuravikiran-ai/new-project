import React from 'react';
import { AdvisoryAgentEvent, AgentRole } from '../types/index.js';
import {
  Compass,
  Microscope,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface AgentConfig {
  role: AgentRole;
  name: string;
  shortDesc: string;
  icon: React.ReactNode;
}

const AGENTS: AgentConfig[] = [
  {
    role: 'PLANNER',
    name: 'Crop Planner Agent',
    shortDesc: 'Decomposes field anomalies into diagnostic subtasks',
    icon: <Compass className="w-5 h-5 text-sky-400" />
  },
  {
    role: 'RESEARCHER',
    name: 'Soil & Agronomic Researcher',
    shortDesc: 'Evaluates NPK, pH chemistry & pathology vectors',
    icon: <Microscope className="w-5 h-5 text-emerald-400" />
  },
  {
    role: 'DECISION',
    name: 'Intervention Decision Agent',
    shortDesc: 'Weighs biological vs synthetic treatments',
    icon: <Cpu className="w-5 h-5 text-indigo-400" />
  },
  {
    role: 'VERIFIER',
    name: 'Safety & Regulatory Verifier',
    shortDesc: 'Audits PHI days, rain washoff & biosecurity thresholds',
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />
  },
  {
    role: 'EXECUTOR',
    name: 'Action Executor Agent',
    shortDesc: 'Generates precision dosage rates & spray schedules',
    icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />
  },
  {
    role: 'COMMUNICATOR',
    name: 'Field Communicator Agent',
    shortDesc: 'Renders executive brief & worker field instructions',
    icon: <MessageSquare className="w-5 h-5 text-purple-400" />
  }
];

interface AgentActivityPipelineProps {
  events: AdvisoryAgentEvent[];
  isAnalyzing?: boolean;
  currentStep?: number;
}

export const AgentActivityPipeline: React.FC<AgentActivityPipelineProps> = ({
  events,
  isAnalyzing = false,
  currentStep = 6
}) => {
  const [expandedAgent, setExpandedAgent] = React.useState<AgentRole | null>(null);

  const toggleExpand = (role: AgentRole) => {
    setExpandedAgent(expandedAgent === role ? null : role);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Deterministic Multi-Agent Execution Trace
            </h3>
            {isAnalyzing && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Live Reasoning
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full transparent audit trail across 6 specialized precision agronomy intelligence agents
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Regulatory Flag
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Pending
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {AGENTS.map((agent, index) => {
          const stepNum = index + 1;
          const event = events.find(e => e.agent === agent.role || e.step_number === stepNum);
          const isDone = !!event;
          const isRunning = isAnalyzing && currentStep === stepNum && !isDone;
          const isWarning = event?.status === 'WARNING';
          const isFailed = event?.status === 'FAILED';
          const isExpanded = expandedAgent === agent.role;

          let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
          let statusText = 'Waiting in Pipeline';

          if (isDone) {
            if (isWarning) {
              badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
              statusText = 'Regulatory Warning';
            } else if (isFailed) {
              badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
              statusText = 'Failed';
            } else {
              badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              statusText = 'Verified & Completed';
            }
          } else if (isRunning) {
            badgeColor = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
            statusText = 'Reasoning in Progress...';
          }

          return (
            <div
              key={agent.role}
              className={`rounded-xl border transition-all ${
                isDone
                  ? isWarning
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  : isRunning
                  ? 'border-sky-500/40 bg-sky-950/20 shadow-lg shadow-sky-500/5'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-75'
              }`}
            >
              <div
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => event && toggleExpand(agent.role)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isDone
                        ? 'bg-slate-800 border-slate-700'
                        : isRunning
                        ? 'bg-sky-900/30 border-sky-500/40 animate-pulse'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {agent.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{stepNum}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {agent.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {agent.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {event && event.latency_ms > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {event.latency_ms}ms
                    </span>
                  )}

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {statusText}
                  </span>

                  {event && (
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Summary line */}
              {event && (
                <div className="px-4 pb-3 pt-0 text-xs text-slate-300 font-medium">
                  <span className="text-slate-400">Summary: </span>
                  {event.summary}
                </div>
              )}

              {/* Collapsible Deep Reasoning Trace */}
              {event && isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/60 rounded-b-xl space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Reasoning Trace & Cross-Checks
                    </h5>
                    <pre className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 overflow-x-auto font-mono text-[11px] text-emerald-300">
                      {JSON.stringify(event.reasoning_trace, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Structured Output Schema Data
                    </h5>
                    <pre className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 overflow-x-auto font-mono text-[11px] text-sky-300">
                      {JSON.stringify(event.output_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
