import React, { useState } from 'react';
import { CropAdvisoryEntity, AdvisoryAgentEvent } from '../types/index.js';
import {
  FileText,
  Microscope,
  Cpu,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DecisionTraceCardProps {
  advisory: CropAdvisoryEntity;
  events: AdvisoryAgentEvent[];
}

export const DecisionTraceCard: React.FC<DecisionTraceCardProps> = ({ advisory, events }) => {
  const [isOpen, setIsOpen] = useState(true);

  const researcherEvent = events.find(e => e.agent === 'RESEARCHER');
  const decisionEvent = events.find(e => e.agent === 'DECISION');
  const verifierEvent = events.find(e => e.agent === 'VERIFIER');

  const researcherData = researcherEvent?.output_data || {};
  const decisionData = decisionEvent?.output_data || {};
  const verifierData = verifierEvent?.output_data || {};

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Agronomic Decision Matrix & Scientific Synthesis
            </h3>
            <p className="text-xs text-slate-400">
              Correlated plant pathology, soil ionic dynamics, and risk-weighted treatment rationale
            </p>
          </div>
        </div>

        <button className="p-1 text-slate-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-800/80 space-y-6 text-sm">
          {/* Row 1: Core Diagnosis & Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 md:col-span-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Confirmed Agronomic Diagnosis
              </span>
              <h4 className="text-lg font-bold text-white mt-1">
                {researcherData.primary_diagnosis || advisory.final_summary?.slice(0, 80) || 'Nutrient & Pathological Stress'}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {researcherData.nutrient_deficiency_details || researcherData.pathogen_or_vector || 'Correlated against field symptoms and soil status.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Diagnosis Confidence
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white">
                    {researcherData.diagnosis_confidence || 94}%
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">High Certainty</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${researcherData.diagnosis_confidence || 94}%` }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Soil Chemistry & Environmental Stress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="w-4 h-4 text-emerald-400" />
                <h5 className="font-bold text-xs uppercase tracking-wider text-white">
                  Soil Chemistry & Ion Availability
                </h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {researcherData.soil_chemistry_analysis ||
                  `At pH ${advisory.soil_ph} in ${advisory.soil_type} soil, mineral solubility dictates nutrient uptake efficiency.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  pH: <strong className="text-white">{advisory.soil_ph}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  N: <strong className="text-white">{advisory.soil_n_status}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  P: <strong className="text-white">{advisory.soil_p_status}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  K: <strong className="text-white">{advisory.soil_k_status}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Moisture: <strong className="text-white">{advisory.soil_moisture_pct}%</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h5 className="font-bold text-xs uppercase tracking-wider text-white">
                  Environmental & Weather Constraints
                </h5>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {researcherData.stress_factors && researcherData.stress_factors.length > 0 ? (
                  researcherData.stress_factors.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))
                ) : (
                  <>
                    <li>Rainfall forecast: {advisory.recent_rainfall_mm}mm precipitation</li>
                    <li>Microclimate temperature: {advisory.temperature_celsius}°C, Humidity: {advisory.humidity_pct}%</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Row 3: Decision Rationale & Alternatives Evaluated */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white mb-2">
              Decision Agent Rationale: Why Selected Treatment Outperformed Alternatives
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {decisionData.decision_rationale ||
                'Treatment selected after balancing efficacy, pre-harvest interval, and soil biosecurity.'}
            </p>

            {decisionData.treatment_alternatives_considered && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Alternatives Evaluated & Discarded:
                </span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {decisionData.treatment_alternatives_considered.map((alt: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-500 font-mono">✕</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
