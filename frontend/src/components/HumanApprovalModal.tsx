import React, { useState } from 'react';
import { CropAdvisoryEntity, AdvisoryActionTask } from '../types/index.js';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Edit3,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';

interface HumanApprovalModalProps {
  isOpen: boolean;
  advisory: CropAdvisoryEntity;
  tasks: AdvisoryActionTask[];
  onDecision: (action: 'APPROVE' | 'REJECT' | 'MODIFY', modifications?: string) => Promise<void>;
  onClose?: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  advisory,
  tasks,
  onDecision,
  onClose
}) => {
  const [modifications, setModifications] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const highRiskTasks = tasks.filter(t => t.is_high_risk || t.category === 'CHEMICAL_SYNTHETIC');
  const maxPhi = Math.max(...tasks.map(t => t.pre_harvest_interval_days || 0), 0);

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'MODIFY') => {
    setIsSubmitting(true);
    try {
      await onDecision(action, modifications);
      setIsModifying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Header Alert Strip */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-rose-600/30 p-5 border-b border-amber-500/30 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                HITL Gatekeeper
              </span>
              <span className="text-xs font-semibold text-amber-200">
                Safety Protocol 4.2 Activated
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Mandatory Human-In-The-Loop Chemical Approval Required
            </h3>
            <p className="text-xs text-amber-100/80 mt-1">
              Field &quot;{advisory.field_name}&quot; ({advisory.crop_type}) triggered strict regulatory gatekeeping due to high-impact synthetic chemistry.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Key Hazard Flags */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Flagged Agrochemical Hazard Criteria:
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                Synthetic Active Ingredient classified under WHO Class II toxicity or high residue potential.
              </li>
              <li>
                Enforces a strict <strong>Pre-Harvest Interval (PHI) of {maxPhi > 0 ? maxPhi : 14} days</strong> prior to harvest.
              </li>
              <li>
                Requires certified farm manager authorization and PPE verification before work orders unlock.
              </li>
            </ul>
          </div>

          {/* Action Tasks Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Proposed Intervention Execution Items:
            </h4>
            <div className="space-y-2">
              {highRiskTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{task.task_title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Rate: <span className="text-emerald-300">{task.dosage_or_rate}</span> via {task.application_method}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    PHI: {task.pre_harvest_interval_days} Days
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Modification Input */}
          {isModifying && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300">
                Agronomist Override / Dosage Modification Instructions:
              </label>
              <textarea
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                placeholder="e.g. Reduce dosage by 20%, mandate evening spraying, or substitute with biological surfactant..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsModifying(!isModifying)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isModifying ? 'Hide Modification Notes' : 'Add Custom Override / Instructions'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('REJECT')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Treatment
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction(isModifying ? 'MODIFY' : 'APPROVE')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isModifying ? 'Approve with Modifications' : 'Authorize & Unlock Field Tasks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
