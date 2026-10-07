import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.client.js';
import {
  CropAdvisoryEntity,
  AdvisoryAgentEvent,
  AdvisoryActionTask,
  TaskStatus
} from '../types/index.js';
import { AgentActivityPipeline } from '../components/AgentActivityPipeline.js';
import { DecisionTraceCard } from '../components/DecisionTraceCard.js';
import { ActionScheduleTable } from '../components/ActionScheduleTable.js';
import { WorkerInstructionsCard } from '../components/WorkerInstructionsCard.js';
import { HumanApprovalModal } from '../components/HumanApprovalModal.js';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  Share2,
  Printer,
  ChevronRight,
  Layers,
  Droplets
} from 'lucide-react';

export const AdvisoryDetailsPage: React.FC = () => {
  const { advisoryId } = useParams<{ advisoryId: string }>();
  const navigate = useNavigate();

  const [advisory, setAdvisory] = useState<CropAdvisoryEntity | null>(null);
  const [events, setEvents] = useState<AdvisoryAgentEvent[]>([]);
  const [tasks, setTasks] = useState<AdvisoryActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const loadData = async () => {
    if (!advisoryId) return;
    try {
      const data = await api.getAdvisoryById(advisoryId);
      setAdvisory(data.advisory);
      setEvents(data.events || []);
      setTasks(data.tasks || []);

      if (data.advisory.status === 'AWAITING_APPROVAL' && data.advisory.requires_human_approval) {
        setShowApprovalModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [advisoryId]);

  const handleDecision = async (action: 'APPROVE' | 'REJECT' | 'MODIFY', modifications?: string) => {
    if (!advisoryId) return;
    try {
      const result = await api.submitDecision(advisoryId, action, modifications);
      setAdvisory(result.advisory);
      setTasks(result.tasks);
      setShowApprovalModal(false);
      // Reload full data to refresh event trace
      loadData();
    } catch (err: any) {
      alert(`Error submitting decision: ${err.message}`);
    }
  };

  const handleToggleTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!advisoryId) return;
    try {
      const updated = await api.updateTaskStatus(advisoryId, taskId, newStatus);
      setTasks(tasks.map(t => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold">Retrieving multi-agent advisory & decision trace...</p>
      </div>
    );
  }

  if (!advisory) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-white">Advisory Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The requested advisory ID does not exist.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-xs font-bold text-emerald-400">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const isAwaitingApproval = advisory.status === 'AWAITING_APPROVAL';
  const isApproved = advisory.status === 'APPROVED' || advisory.is_approved;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/advisories" className="hover:text-white transition-colors">Field Logs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-mono truncate max-w-[200px]">{advisory.id}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {advisory.field_name}
              </h1>

              {/* Status Badge */}
              {isApproved && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Authorized by Manager
                </span>
              )}

              {isAwaitingApproval && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Awaiting HITL Approval
                </span>
              )}

              {advisory.status === 'REJECTED' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  ✕ Rejected by Manager
                </span>
              )}

              {/* Risk Level Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  advisory.overall_risk_level === 'HIGH' || advisory.overall_risk_level === 'CRITICAL'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : advisory.overall_risk_level === 'MODERATE'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                Risk: {advisory.overall_risk_level}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-3">
              <span><strong>Crop:</strong> {advisory.crop_type} ({advisory.growth_stage})</span>
              <span>•</span>
              <span><strong>Area:</strong> {advisory.field_size_acres} Acres</span>
              <span>•</span>
              <span><strong>Soil:</strong> {advisory.soil_type} (pH {advisory.soil_ph})</span>
              <span>•</span>
              <span className="text-slate-400">Created: {new Date(advisory.created_at).toLocaleString()}</span>
            </p>
          </div>

          {/* Quick Action Button for Approval */}
          {isAwaitingApproval && (
            <button
              type="button"
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/20 transition-all self-start lg:self-auto"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              Review & Sign Off High-Risk Treatment
            </button>
          )}
        </div>
      </div>

      {/* HITL Gatekeeper Banner if Pending */}
      {isAwaitingApproval && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                Human-in-the-Loop Gatekeeper: High-Risk Intervention Pending Verification
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                The Safety & Regulatory Verifier Agent flagged Class II synthetic chemistry with an active Pre-Harvest Interval (PHI). Field tasks and chemical tank mixes remain locked until explicitly approved by certified farm management.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowApprovalModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs whitespace-nowrap self-end sm:self-auto"
          >
            Open Approval Modal
          </button>
        </div>
      )}

      {/* Component 1: Multi-Agent Activity Pipeline */}
      <AgentActivityPipeline events={events} />

      {/* Component 2: Decision Trace Card */}
      <DecisionTraceCard advisory={advisory} events={events} />

      {/* Component 3: Action Schedule Table */}
      <ActionScheduleTable
        tasks={tasks}
        onToggleTaskStatus={handleToggleTask}
        isApproved={isApproved}
      />

      {/* Component 4: Worker Instructions Card */}
      {advisory.worker_instructions && (
        <WorkerInstructionsCard
          instructions={advisory.worker_instructions}
          fieldName={advisory.field_name}
          cropType={advisory.crop_type}
        />
      )}

      {/* HITL Approval Modal */}
      <HumanApprovalModal
        isOpen={showApprovalModal}
        advisory={advisory}
        tasks={tasks}
        onDecision={handleDecision}
        onClose={() => setShowApprovalModal(false)}
      />
    </div>
  );
};
