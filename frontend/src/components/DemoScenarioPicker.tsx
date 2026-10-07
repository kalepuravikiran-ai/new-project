import React from 'react';
import { DemoScenario } from '../types/index.js';
import { Zap, AlertTriangle, ShieldCheck, ArrowRight, Droplets, Bug, Sprout, Wine } from 'lucide-react';

interface DemoScenarioPickerProps {
  scenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  selectedId?: string;
  onInstantRun?: (scenario: DemoScenario) => void;
  isSubmitting?: boolean;
}

export const DemoScenarioPicker: React.FC<DemoScenarioPickerProps> = ({
  scenarios,
  onSelectScenario,
  selectedId,
  onInstantRun,
  isSubmitting = false
}) => {
  const getScenarioIcon = (id: string) => {
    if (id.includes('maize')) return <Sprout className="w-5 h-5 text-emerald-400" />;
    if (id.includes('cotton')) return <Bug className="w-5 h-5 text-amber-400" />;
    if (id.includes('tomato')) return <Droplets className="w-5 h-5 text-rose-400" />;
    if (id.includes('vineyard')) return <Wine className="w-5 h-5 text-purple-400" />;
    return <Zap className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1-Click Precision Ag Scenarios (Pre-Seeded Demos)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Instant test presets for hackathon & field demo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map(scenario => {
          const isSelected = selectedId === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`glass-panel p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
              onClick={() => onSelectScenario(scenario)}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    {getScenarioIcon(scenario.id)}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      scenario.highRisk
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {scenario.badge}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {scenario.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(scenario);
                  }}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? '✓ Loaded in Form' : 'Load Form'}
                </button>

                {onInstantRun && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInstantRun(scenario);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    Run AI <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
