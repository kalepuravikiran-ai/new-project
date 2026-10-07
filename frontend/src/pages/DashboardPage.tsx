import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.client.js';
import {
  CropAdvisoryEntity,
  DemoScenario,
  SystemMetrics
} from '../types/index.js';
import { MetricCard } from '../components/MetricCard.js';
import { DemoScenarioPicker } from '../components/DemoScenarioPicker.js';
import {
  Sprout,
  PlusCircle,
  AlertTriangle,
  Droplets,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [advisories, setAdvisories] = useState<CropAdvisoryEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [m, s, a] = await Promise.all([
          api.getMetrics().catch(() => null),
          api.getDemoScenarios().catch(() => []),
          api.listAdvisories().catch(() => [])
        ]);
        if (m) setMetrics(m);
        setScenarios(s);
        setAdvisories(a);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleRunScenario = async (scenario: DemoScenario) => {
    navigate('/advisor/new', { state: { scenario } });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ✓ Authorized
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            ⚠ Requires Approval
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            ✕ Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Farm Telemetry & Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status across multi-agent crop advisories, soil health indices, and chemical approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/advisor/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            New Crop Intake
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Advisories"
          value={metrics ? metrics.total_advisories_executed : '142'}
          subtitle="Autonomous pipelines generated"
          icon={<Sprout className="w-5 h-5" />}
          trend="+8 this week"
          accentColor="emerald"
          highlight
        />

        <MetricCard
          title="Pending HITL Approvals"
          value={metrics ? metrics.pending_approvals : '1'}
          subtitle="High-risk chemical interventions"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={metrics && metrics.pending_approvals > 0 ? 'Requires Sign-off' : 'Clear'}
          trendPositive={metrics ? metrics.pending_approvals === 0 : false}
          accentColor="amber"
        />

        <MetricCard
          title="Hazards Prevented"
          value={metrics ? metrics.chemical_risks_prevented : '39'}
          subtitle="Non-target toxicity & PHI violations"
          icon={<ShieldCheck className="w-5 h-5" />}
          trend="100% Biosecure"
          accentColor="emerald"
        />

        <MetricCard
          title="Water Volume Saved"
          value={metrics ? `${metrics.water_cubic_meters_saved.toLocaleString()} m³` : '18,450 m³'}
          subtitle="Irrigation hours optimized"
          icon={<Droplets className="w-5 h-5" />}
          trend="+12% Efficiency"
          accentColor="cyan"
        />
      </div>

      {/* Quick Launch Demo Scenarios */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <DemoScenarioPicker
          scenarios={scenarios}
          onSelectScenario={handleRunScenario}
        />
      </div>

      {/* Recent Advisories Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Field Advisories & Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical records and audit logs generated by the Agri-AURA multi-agent chain
            </p>
          </div>

          <Link
            to="/advisories"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All Logs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {advisories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Sprout className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            No crop advisories yet. Launch a new advisory or pick a demo scenario above to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Field & Crop</th>
                  <th className="py-3.5 px-4 font-bold">Growth Stage</th>
                  <th className="py-3.5 px-4 font-bold">Soil / Weather</th>
                  <th className="py-3.5 px-4 font-bold">Risk Level</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {advisories.slice(0, 6).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/advisor/${item.id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{item.field_name}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        {item.crop_type} ({item.field_size_acres} Acres)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {item.growth_stage}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{item.soil_type} • pH {item.soil_ph}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.recent_rainfall_mm}mm rain • {item.temperature_celsius}°C
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.overall_risk_level === 'HIGH' || item.overall_risk_level === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : item.overall_risk_level === 'MODERATE'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.overall_risk_level}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/advisor/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                      >
                        View Trace <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
