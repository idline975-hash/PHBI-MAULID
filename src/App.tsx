import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardUsser } from './components/DashboardUsser';
import { DashboardBendahara } from './components/DashboardBendahara';
import { DashboardAdmin } from './components/DashboardAdmin';
import { OfficialReportModal, ReportType } from './components/OfficialReportModal';
import { AlertCircle, CheckCircle2, Shield, Heart, MapPin } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, error, successMessage, setError, setSuccessMessage } = useApp();
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header with Marquee, Logo, and Sync status */}
      <Header onOpenReportModal={(type) => setActiveReport(type as ReportType)} />

      {/* Global Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 max-w-md w-full space-y-2 pointer-events-none px-4">
        {error && (
          <div className="pointer-events-auto p-4 rounded-2xl bg-rose-600 text-white text-xs sm:text-sm shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-rose-200 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Pemberitahuan Sistem:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-200 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="pointer-events-auto p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Sukses:</span>
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-200 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {!currentUser ? (
          <LoginScreen />
        ) : currentUser.role === 'admin' ? (
          <DashboardAdmin onOpenReportModal={(type) => setActiveReport(type as ReportType)} />
        ) : currentUser.role === 'bendahara' ? (
          <DashboardBendahara onOpenReportModal={(type) => setActiveReport(type as ReportType)} />
        ) : (
          <DashboardUsser onOpenReportModal={(type) => setActiveReport(type as ReportType)} />
        )}
      </main>

      {/* Official Report Modal (Printable Kop Surat & TTD) */}
      {activeReport && (
        <OfficialReportModal
          reportType={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <div className="flex items-center justify-center gap-2 font-semibold text-slate-800">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>PANITIA MAULID NABI PHBI • Kp Kedung Sapi Desa Kp Baru Kec. Pamarayan Serang – Banten</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Aplikasi Iuran Maulid Nabi • Real-time Multi-User Cloud Synchronization • Didesain untuk Kenyamanan Mobile & Desktop
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
