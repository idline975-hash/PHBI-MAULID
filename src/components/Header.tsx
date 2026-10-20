import React from 'react';
import { useApp } from '../context/AppContext';
import { useRealtimeClock } from '../utils/format';
import {
  LogOut,
  RefreshCw,
  Wifi,
  ShieldCheck,
  User,
  Wallet,
  Clock,
  MapPin
} from 'lucide-react';

export const Header: React.FC<{ onOpenReportModal?: (type: string) => void }> = () => {
  const { currentUser, setCurrentUser, isSyncing, refreshState } = useApp();
  const { dateTime } = useRealtimeClock();

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          Admin ({currentUser.name})
        </span>
      );
    }
    if (currentUser.role === 'bendahara') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
          <Wallet className="w-3.5 h-3.5 text-emerald-700" />
          Bendahara ({currentUser.name})
        </span>
      );
    }
    const label = (currentUser.name && currentUser.userSubtype && currentUser.name.trim() === currentUser.userSubtype.trim())
      ? currentUser.name
      : `${currentUser.userSubtype || 'Usser'} (${currentUser.name})`;
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
        <User className="w-3.5 h-3.5 text-indigo-700" />
        {label}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Running Marquee Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white text-xs py-2 px-4 overflow-hidden border-b border-indigo-900/20 relative shadow-inner">
        <div className="flex items-center">
          <span className="shrink-0 flex items-center gap-1 font-bold text-amber-300 pr-3 z-10 bg-indigo-950/90 py-0.5 rounded px-2 mr-2 shadow-sm text-[11px]">
            <MapPin className="w-3 h-3 text-amber-400" />
            PHBI PUSAT
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee hover:pause cursor-default">
              <span className="mx-6 font-semibold tracking-wide">
                ⭐ PANITIA MAULID NABI — Alamat: Kp Kedung Sapi Desa Kp Baru Kecamatan Pamarayan Serang – Banten ⭐
              </span>
              <span className="mx-6 font-medium text-amber-200">
                Peringatan Hari Besar Islam (PHBI) • Menjalin Ukhuwah Islamiyah, Menebar Keberkahan
              </span>
              <span className="mx-6 font-semibold tracking-wide">
                ⭐ PANITIA MAULID NABI — Alamat: Kp Kedung Sapi Desa Kp Baru Kecamatan Pamarayan Serang – Banten ⭐
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation & Info Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title Lockup */}
          <div className="flex items-center gap-3.5">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-md bg-white flex items-center justify-center p-0.5">
                <img
                  src="/src/assets/images/logo_phbi_maulid_1792487457839.jpg"
                  alt="Logo PHBI Panitia Maulid Nabi"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                  PANITIA MAULID NABI
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                  PHBI
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium hidden sm:block truncate max-w-md">
                Kp Kedung Sapi Desa Kp Baru Kec. Pamarayan Serang – Banten
              </p>
            </div>
          </div>

          {/* Real-time Clock, Sync & User Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Realtime Clock */}
            <div className="hidden lg:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{dateTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <Wifi className="w-3 h-3 animate-pulse text-emerald-600" />
                <span>Online & Sinkron Real-time</span>
              </div>
            </div>

            {/* Quick manual sync button */}
            <button
              onClick={() => refreshState()}
              disabled={isSyncing}
              title="Sinkronisasi data sekarang"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Sinkron</span>
            </button>

            {/* Role Badge */}
            {currentUser && (
              <div className="hidden sm:block">
                {getRoleBadge()}
              </div>
            )}

            {/* Logout / Switch User */}
            {currentUser && (
              <button
                onClick={() => setCurrentUser(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors active:scale-95 cursor-pointer shadow-sm"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ganti Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
