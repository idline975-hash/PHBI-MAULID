import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserSubtype } from '../types';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { state, setCurrentUser } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('usser');
  const [selectedUsserSubtype, setSelectedUsserSubtype] = useState<UserSubtype>('Usser 1 - RT 08');
  const [username, setUsername] = useState('usser1');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch role handler with smart defaults
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'admin') {
      setUsername('riyan');
      setPassword('123456');
    } else if (role === 'bendahara') {
      const bendaharaAcc = state.users.find(u => u.role === 'bendahara') || { username: 'bendahara' };
      setUsername(bendaharaAcc.username);
      setPassword('123');
    } else {
      // usser
      handleSubtypeChange('Usser 1 - RT 08');
    }
  };

  const handleSubtypeChange = (subtype: UserSubtype) => {
    setSelectedUsserSubtype(subtype);
    setErrorMsg(null);
    const found = state.users.find(u => u.userSubtype === subtype);
    if (found) {
      setUsername(found.username);
      setPassword(found.password);
    } else {
      if (subtype === 'Usser 1 - RT 08' || subtype === 'Usser 1') {
        setUsername('usser1');
        setPassword('123');
      } else if (subtype === 'Usser 2 - RT 09' || subtype === 'Usser 2') {
        setUsername('usser2');
        setPassword('123');
      } else if (subtype === 'Usser 3 - RT 10' || subtype === 'Usser 3') {
        setUsername('usser3');
        setPassword('123');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check credentials against registered users
    const matched = state.users.find(
      u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (matched) {
      setCurrentUser(matched);
      return;
    }

    // Fallback for default admin
    if (cleanUser === 'riyan' && cleanPass === '123456') {
      const adminAcc = state.users.find(u => u.username.toLowerCase() === 'riyan') || {
        id: 'usr_admin',
        username: 'riyan',
        name: 'Riyan (Administrator)',
        role: 'admin' as const,
        userSubtype: 'Admin' as const,
        password: '123456',
        createdAt: '2026-10-20'
      };
      setCurrentUser(adminAcc);
      return;
    }

    setErrorMsg('Username atau Password salah! Silakan periksa kembali kredensial Anda.');
  };

  // Quick direct login bypass
  const handleQuickLogin = (role: UserRole, subtype?: UserSubtype) => {
    if (role === 'admin') {
      const acc = state.users.find(u => u.username.toLowerCase() === 'riyan') || {
        id: 'usr_admin',
        username: 'riyan',
        name: 'Riyan (Administrator)',
        role: 'admin' as const,
        userSubtype: 'Admin' as const,
        password: '123456',
        createdAt: '2026-10-20'
      };
      setCurrentUser(acc);
    } else if (role === 'bendahara') {
      const acc = state.users.find(u => u.role === 'bendahara') || {
        id: 'usr_bendahara',
        username: 'bendahara',
        name: 'Bendahara PHBI',
        role: 'bendahara' as const,
        userSubtype: 'Bendahara' as const,
        password: '123',
        createdAt: '2026-10-20'
      };
      setCurrentUser(acc);
    } else {
      const targetSubtype = subtype || 'Usser 1 - RT 08';
      const isUsser2 = targetSubtype.includes('2') || targetSubtype.includes('09');
      const isUsser3 = targetSubtype.includes('3') || targetSubtype.includes('10');
      const defaultUsername = isUsser3 ? 'usser3' : isUsser2 ? 'usser2' : 'usser1';
      const defaultName = isUsser3 ? 'Usser 3 - RT 10' : isUsser2 ? 'Usser 2 - RT 09' : 'Usser 1 - RT 08';
      const defaultSubtype: UserSubtype = isUsser3 ? 'Usser 3 - RT 10' : isUsser2 ? 'Usser 2 - RT 09' : 'Usser 1 - RT 08';

      const acc = state.users.find(u => u.userSubtype === targetSubtype || u.username === defaultUsername) || {
        id: isUsser3 ? 'usr_3' : isUsser2 ? 'usr_2' : 'usr_1',
        username: defaultUsername,
        name: defaultName,
        role: 'usser' as const,
        userSubtype: defaultSubtype,
        password: '123',
        createdAt: '2026-10-20'
      };
      setCurrentUser(acc);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 relative bg-white">
      <div className="w-full max-w-xl relative z-10">
        {/* Emblem & Portal Header */}
        <div className="text-center mb-6">
          <div className="inline-block relative mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl overflow-hidden border-2 border-indigo-600 shadow-xl bg-white p-1">
              <img
                src="/src/assets/images/logo_phbi_maulid_1792487457839.jpg"
                alt="Logo PHBI"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1">
            Sistem Iuran Maulid Nabi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            PANITIA PHBI • Kp Kedung Sapi Desa Kp Baru Kec. Pamarayan Serang – Banten
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Pilih Akses Menu Login
              </span>
              <h3 className="text-lg font-black text-slate-900">Silakan Pilih Peran Anda</h3>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
            {/* Usser */}
            <button
              type="button"
              onClick={() => handleRoleChange('usser')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'usser'
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-md ring-2 ring-indigo-500/30 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'usser' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-sm">Usser</div>
                <div className="text-[11px] text-slate-500 font-normal hidden sm:block">Pencatat Donasi</div>
              </div>
            </button>

            {/* Bendahara */}
            <button
              type="button"
              onClick={() => handleRoleChange('bendahara')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'bendahara'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-500/30 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'bendahara' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-sm">Bendahara</div>
                <div className="text-[11px] text-slate-500 font-normal hidden sm:block">Kas & Pengeluaran</div>
              </div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-md ring-2 ring-amber-500/30 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-sm">Admin</div>
                <div className="text-[11px] text-slate-500 font-normal hidden sm:block">Kontrol Lengkap</div>
              </div>
            </button>
          </div>

          {/* Subtype Selector for Usser */}
          {selectedRole === 'usser' && (
            <div className="mb-6 p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-900 mb-2">
                Pilih Akun Petugas Usser:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['Usser 1 - RT 08', 'Usser 2 - RT 09', 'Usser 3 - RT 10'] as UserSubtype[]).map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubtypeChange(sub)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedUsserSubtype === sub
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selectedUsserSubtype === sub ? 'text-white' : 'text-slate-400'}`} />
                    <span>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                />
              </div>
              {selectedRole === 'admin' && (
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Default Admin Username: <span className="font-mono font-bold text-amber-900">riyan</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                />
                {/* Eye toggle button on password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {selectedRole === 'admin' && (
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Default Admin Password: <span className="font-mono font-bold text-amber-900">123456</span>
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Masuk ke Dashboard {selectedRole === 'admin' ? 'Admin' : selectedRole === 'bendahara' ? 'Bendahara' : selectedUsserSubtype}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Tap Access */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-2.5 font-bold">
              Akses Cepat Pengurus (1 Klik):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                ⚡ Admin (riyan)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
              >
                ⚡ Bendahara
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('usser', 'Usser 1 - RT 08')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 transition-colors cursor-pointer"
              >
                ⚡ Usser 1 - RT 08
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('usser', 'Usser 2 - RT 09')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 transition-colors cursor-pointer"
              >
                ⚡ Usser 2 - RT 09
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('usser', 'Usser 3 - RT 10')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 transition-colors cursor-pointer"
              >
                ⚡ Usser 3 - RT 10
              </button>
            </div>
          </div>
        </div>

        {/* Info Footnote */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Sinkronisasi real-time multi-perangkat aktif • Data tersimpan aman di cloud server
        </div>
      </div>
    </div>
  );
};
