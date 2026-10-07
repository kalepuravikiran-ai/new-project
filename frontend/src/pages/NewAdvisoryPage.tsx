import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.client.js';
import { CropAdvisoryInput, DemoScenario } from '../types/index.js';
import { AdvisoryIntakeForm } from '../components/AdvisoryIntakeForm.js';
import { Sparkles, Shield, Compass, ArrowLeft } from 'lucide-react';

export const NewAdvisoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.getDemoScenarios().then(setScenarios).catch(() => []);
  }, []);

  const handleFormSubmit = async (formData: CropAdvisoryInput) => {
    setIsSubmitting(true);
    try {
      const response = await api.runAdvisory(formData);
      if (response.advisory?.id) {
        navigate(`/advisor/${response.advisory.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create Crop Advisory & Diagnostic
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              6 Agents Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Input soil parameters, visual symptoms, and weather context to trigger deterministic multi-agent agronomic reasoning.
          </p>
        </div>
      </div>

      {/* Advisory Intake Form */}
      <AdvisoryIntakeForm
        scenarios={scenarios}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
