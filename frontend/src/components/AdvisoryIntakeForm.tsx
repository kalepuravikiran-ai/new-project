import React, { useState, useEffect } from 'react';
import {
  CropAdvisoryInput,
  DemoScenario,
  NutrientStatus,
  SoilType,
  SymptomDistribution
} from '../types/index.js';
import { DemoScenarioPicker } from './DemoScenarioPicker.js';
import {
  Sprout,
  Thermometer,
  CloudRain,
  Droplets,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdvisoryIntakeFormProps {
  scenarios: DemoScenario[];
  onSubmit: (data: CropAdvisoryInput) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_FORM: CropAdvisoryInput = {
  field_name: 'North Pivot 4 - River Basin',
  field_size_acres: 120,
  crop_type: 'Maize (Dent Corn)',
  growth_stage: 'Vegetative V3-V4',
  soil_type: 'Sandy Loam',
  soil_ph: 6.2,
  soil_n_status: 'Deficient',
  soil_p_status: 'Optimal',
  soil_k_status: 'Optimal',
  soil_moisture_pct: 78,
  recent_rainfall_mm: 48,
  temperature_celsius: 24.5,
  humidity_pct: 82,
  observed_symptoms: 'Pronounced yellowing (chlorosis) beginning along midribs of lower, older leaves forming an inverted V-shape. Crop exhibits stunted shoot elongation across lower drainage zone.',
  symptom_distribution: 'Along Irrigation Lines'
};

const SOIL_TYPES: SoilType[] = [
  'Sandy',
  'Sandy Loam',
  'Clay Loam',
  'Silt Loam',
  'Heavy Clay',
  'Peat',
  'Saline/Alkaline'
];

const NUTRIENT_OPTIONS: NutrientStatus[] = ['Deficient', 'Low', 'Optimal', 'Excess'];

const DISTRIBUTIONS: SymptomDistribution[] = [
  'Isolated Patches',
  'Field-Wide Uniform',
  'Along Irrigation Lines',
  'Perimeter/Edge Only'
];

export const AdvisoryIntakeForm: React.FC<AdvisoryIntakeFormProps> = ({
  scenarios,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<CropAdvisoryInput>(DEFAULT_FORM);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-1-maize-nitrogen');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenarioId(scenario.id);
    setFormData({ ...scenario.data });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.observed_symptoms.trim().length < 10) {
      setErrorMsg('Please describe symptoms in more detail (min 10 characters).');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing agent pipeline.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1-Click Demo Scenarios Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <DemoScenarioPicker
          scenarios={scenarios}
          selectedId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          onInstantRun={(sc) => {
            handleSelectScenario(sc);
            onSubmit(sc.data);
          }}
          isSubmitting={isSubmitting}
        />
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Field & Crop Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Field & Crop Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              1. Field Metadata & Crop Lifecycle
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Identifier / Plot Name
            </label>
            <input
              type="text"
              required
              value={formData.field_name}
              onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. North Pivot 4 - River Basin"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Field Area (Acres)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={formData.field_size_acres}
                onChange={(e) => setFormData({ ...formData, field_size_acres: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Crop Variety / Species
              </label>
              <input
                type="text"
                required
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. Maize, Cotton, Tomato"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Growth Stage
            </label>
            <input
              type="text"
              required
              value={formData.growth_stage}
              onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Vegetative V3-V4, Flowering, Boll Set"
            />
          </div>
        </div>

        {/* Section 2: Weather & Local Telemetry */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CloudRain className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white">
              2. Weather Forecast & Local Telemetry
            </h3>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Rainfall Forecast (Next 24-48h)
              </label>
              <span className="text-xs font-bold font-mono text-sky-400">
                {formData.recent_rainfall_mm} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={formData.recent_rainfall_mm}
              onChange={(e) => setFormData({ ...formData, recent_rainfall_mm: parseFloat(e.target.value) || 0 })}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>0mm (Dry)</span>
              <span>25mm (Moderate)</span>
              <span>50mm+ (Heavy Wash-off)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ambient Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.temperature_celsius}
                  onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">°C</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Relative Humidity (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.humidity_pct}
                  onChange={(e) => setFormData({ ...formData, humidity_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-sky-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400">
            💡 Weather telemetry informs the <strong>Safety Verifier Agent</strong> on liquid foliar wash-off and pest dispersal windows.
          </div>
        </div>
      </div>

      {/* Section 3: Soil Chemistry & Moisture Profile */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-white">
            3. Soil Chemistry, Texture & Moisture Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Soil Texture / Type
            </label>
            <select
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value as SoilType })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-1 focus:ring-amber-500"
            >
              {SOIL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Soil pH Level
              </label>
              <span className="text-xs font-bold font-mono text-amber-400">
                pH {formData.soil_ph.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="9.0"
              step="0.1"
              value={formData.soil_ph}
              onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) || 7.0 })}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Acidic (&lt;5.5)</span>
              <span>Neutral (6.5-7.0)</span>
              <span>Alkaline (&gt;7.5)</span>
            </div>
          </div>
        </div>

        {/* Soil Moisture Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Soil Volumetric Moisture Content (%)
            </label>
            <span className="text-xs font-bold font-mono text-cyan-400">
              {formData.soil_moisture_pct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={formData.soil_moisture_pct}
            onChange={(e) => setFormData({ ...formData, soil_moisture_pct: parseFloat(e.target.value) || 50 })}
            className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Macronutrient Ratings (N, P, K) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Soil Macronutrient Availability Ratings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nitrogen */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-bold text-white block mb-2">Nitrogen (N)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {NUTRIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, soil_n_status: opt })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      formData.soil_n_status === opt
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Phosphorus */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-bold text-white block mb-2">Phosphorus (P)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {NUTRIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, soil_p_status: opt })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      formData.soil_p_status === opt
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Potassium */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-bold text-white block mb-2">Potassium (K)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {NUTRIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, soil_k_status: opt })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      formData.soil_k_status === opt
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Observed Symptoms & Spatial Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Droplets className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-base text-white">
            4. Observed Crop Symptoms & Spatial Distribution
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Spatial Field Distribution Pattern
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DISTRIBUTIONS.map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setFormData({ ...formData, symptom_distribution: dist })}
                className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                  formData.symptom_distribution === dist
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Detailed Symptom Observations & Field Notes (Natural Language)
          </label>
          <textarea
            required
            rows={4}
            value={formData.observed_symptoms}
            onChange={(e) => setFormData({ ...formData, observed_symptoms: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:ring-1 focus:ring-emerald-500"
            placeholder="Describe leaf discoloration, lesion shape, pest feeding signs, canopy wilt..."
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>Minimum 10 characters required for multi-agent reasoning.</span>
            <span>{formData.observed_symptoms.length}/1000</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300 hover:to-green-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running 6-Agent Autonomous Diagnostic Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>Launch Autonomous Advisory Pipeline</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
