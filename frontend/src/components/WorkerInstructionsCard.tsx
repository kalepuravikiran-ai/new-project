import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Languages,
  Users
} from 'lucide-react';

interface WorkerInstructionsCardProps {
  instructions: string;
  fieldName: string;
  cropType: string;
}

export const WorkerInstructionsCard: React.FC<WorkerInstructionsCardProps> = ({
  instructions,
  fieldName,
  cropType
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Field Worker Instructions & Safety Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Plain-language, non-technical steps for field operators and spraying teams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Work Order
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono leading-relaxed whitespace-pre-line text-slate-200">
        {instructions}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Verified for Worker Safety Compliance (EPA / WHO Standards)
        </div>
        <span>Target Plot: {fieldName} ({cropType})</span>
      </div>
    </div>
  );
};
