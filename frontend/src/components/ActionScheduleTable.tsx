import React from 'react';
import { AdvisoryActionTask, TaskStatus } from '../types/index.js';
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  FlaskConical,
  Sprout,
  Droplets,
  Wrench,
  Check
} from 'lucide-react';

interface ActionScheduleTableProps {
  tasks: AdvisoryActionTask[];
  onToggleTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  isApproved: boolean;
}

export const ActionScheduleTable: React.FC<ActionScheduleTableProps> = ({
  tasks,
  onToggleTaskStatus,
  isApproved
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'CHEMICAL_SYNTHETIC':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <FlaskConical className="w-3 h-3" /> Synthetic Chemical
          </span>
        );
      case 'ORGANIC_BIOLOGICAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Sprout className="w-3 h-3" /> Organic Biological
          </span>
        );
      case 'FERTIGATION_MINERAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Droplets className="w-3 h-3" /> Mineral Fertigation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/30">
            <Wrench className="w-3 h-3" /> Cultural / Mechanical
          </span>
        );
    }
  };

  const getStatusButton = (task: AdvisoryActionTask) => {
    const isDone = task.status === 'COMPLETED';
    const isProgress = task.status === 'IN_PROGRESS';

    const nextStatus: TaskStatus = isDone
      ? 'PENDING'
      : isProgress
      ? 'COMPLETED'
      : 'IN_PROGRESS';

    return (
      <button
        type="button"
        disabled={!isApproved}
        onClick={() => onToggleTaskStatus && onToggleTaskStatus(task.id, nextStatus)}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
          !isApproved
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
            : isDone
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            : isProgress
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/40'
        }`}
      >
        {isDone ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
          </>
        ) : isProgress ? (
          <>
            <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress
          </>
        ) : (
          <>
            <Circle className="w-3.5 h-3.5" /> Mark Active
          </>
        )}
      </button>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Field Execution Schedule & Chemical Application Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated dosages, delivery methods, and Pre-Harvest Interval (PHI) compliance
          </p>
        </div>

        {!isApproved && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            Locked until Farm Manager Sign-off
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-bold">Field Task</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Dosage / Application Rate</th>
              <th className="py-3.5 px-4 font-bold">Delivery Method</th>
              <th className="py-3.5 px-4 font-bold">PHI</th>
              <th className="py-3.5 px-4 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-slate-900/40 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-xs">{task.task_title}</div>
                  {task.scheduled_date && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Scheduled: {task.scheduled_date}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getCategoryBadge(task.category)}
                </td>

                <td className="py-3.5 px-4 font-mono font-medium text-emerald-300">
                  {task.dosage_or_rate || 'Calibrated rate'}
                </td>

                <td className="py-3.5 px-4 text-slate-300">
                  {task.application_method}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {task.pre_harvest_interval_days > 0 ? (
                    <span className="font-mono font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {task.pre_harvest_interval_days} Days
                    </span>
                  ) : (
                    <span className="text-slate-400">0d (None)</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {getStatusButton(task)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
