import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.client.js';
import { CropAdvisoryEntity } from '../types/index.js';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowRight,
  Sprout,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const AdvisoryHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [advisories, setAdvisories] = useState<CropAdvisoryEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    api.listAdvisories().then(data => {
      setAdvisories(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredAdvisories = advisories.filter(item => {
    const matchesSearch =
      item.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.crop_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.observed_symptoms.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAdvisories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agri_aura_advisories_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
            ⚠ Awaiting Sign-off
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
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Advisory History & Field Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete audit trail of all precision agriculture decisions, agent traces, and chemical interventions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportToJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>

          <Link
            to="/advisor/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 font-bold text-xs text-slate-950 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" /> New Intake
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by field name, crop variety, or symptom keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl p-1 text-xs">
          {['ALL', 'APPROVED', 'AWAITING_APPROVAL', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'AWAITING_APPROVAL' ? 'Pending' : st === 'ALL' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Advisories Grid / Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading field records...
          </div>
        ) : filteredAdvisories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <History className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            No advisories match your current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Field & Plot</th>
                  <th className="py-3.5 px-4 font-bold">Crop & Growth Stage</th>
                  <th className="py-3.5 px-4 font-bold">Soil / Weather</th>
                  <th className="py-3.5 px-4 font-bold">Risk Level</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAdvisories.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/advisor/${item.id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{item.field_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.field_size_acres} Acres • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-400">{item.crop_type}</div>
                      <div className="text-[11px] text-slate-400">{item.growth_stage}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{item.soil_type} • pH {item.soil_ph}</div>
                      <div className="text-[11px] text-slate-400">
                        N:{item.soil_n_status} P:{item.soil_p_status} K:{item.soil_k_status}
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

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/advisor/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                      >
                        View <ArrowRight className="w-3 h-3" />
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
