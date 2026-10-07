import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NewAdvisoryPage } from './pages/NewAdvisoryPage.js';
import { AdvisoryDetailsPage } from './pages/AdvisoryDetailsPage.js';
import { AdvisoryHistoryPage } from './pages/AdvisoryHistoryPage.js';
import { AgentMonitoringPage } from './pages/AgentMonitoringPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { Sprout, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/advisor/new" element={<NewAdvisoryPage />} />
              <Route path="/advisor/:advisoryId" element={<AdvisoryDetailsPage />} />
              <Route path="/advisories" element={<AdvisoryHistoryPage />} />
              <Route path="/monitoring/agents" element={<AgentMonitoringPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-300">Agri-AURA</span>
                <span>• Autonomous Agricultural Reasoning & Action System</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  WHO Class II & PHI Verified
                </span>
                <span>•</span>
                <span>Gemini 2.5/3.8 Flash Engine</span>
                <span>•</span>
                <span>Supabase PostgreSQL RLS</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
