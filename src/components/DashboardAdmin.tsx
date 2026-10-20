import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserSubtype } from '../types';
import {
  formatRupiah,
  formatInputNumber,
  parseFormattedNumber
} from '../utils/format';
import { ReportType } from './OfficialReportModal';
import { RekapitulasiMingguan } from './RekapitulasiMingguan';
import {
  ShieldCheck,
  UserPlus,
  Target,
  FileSpreadsheet,
  FileCheck2,
  Users,
  HeartHandshake,
  Wallet,
  History,
  Lock,
  Eye,
  EyeOff,
  User,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface DashboardAdminProps {
  onOpenReportModal: (type: ReportType) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({ onOpenReportModal }) => {
  const {
    state,
    totalDonasiWarga,
    totalDonasiSukarela,
    totalPengeluaran,
    uangTersedia,
    updateTarget,
    createUser,
    deleteUser
  } = useApp();

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<
    | 'ringkasan'
    | 'target'
    | 'buat_akun'
    | 'donasi_warga'
    | 'donasi_sukarela'
    | 'bendahara'
    | 'perubahan_data'
  >('ringkasan');

  // Form State: Buat Akun
  const [akunNama, setAkunNama] = useState('');
  const [akunUsername, setAkunUsername] = useState('');
  const [akunPassword, setAkunPassword] = useState('');
  const [akunShowPassword, setAkunShowPassword] = useState(false);
  const [akunSubtype, setAkunSubtype] = useState<UserSubtype>('Usser 1 - RT 08');
  const [akunError, setAkunError] = useState<string | null>(null);

  // Form State: Set Target Per Orang
  const [targetInput, setTargetInput] = useState(formatInputNumber(state.targetPerOrang));
  const [targetError, setTargetError] = useState<string | null>(null);

  // Submits
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAkunError(null);

    if (!akunNama.trim() || !akunPassword.trim()) {
      setAkunError('Nama dan Password wajib diisi!');
      return;
    }

    const generatedUsername = akunUsername.trim()
      ? akunUsername.trim().toLowerCase()
      : akunSubtype.toLowerCase().replace(/\s+/g, '') + '_' + Math.floor(Math.random() * 100);

    const res = await createUser({
      name: akunNama.trim(),
      username: generatedUsername,
      password: akunPassword.trim(),
      userSubtype: akunSubtype
    });

    if (res.success) {
      setAkunNama('');
      setAkunUsername('');
      setAkunPassword('');
    } else {
      setAkunError(res.error || 'Gagal membuat akun');
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setTargetError(null);
    const nominal = parseFormattedNumber(targetInput);
    if (nominal <= 0) {
      setTargetError('Target iuran per orang harus lebih dari 0');
      return;
    }
    await updateTarget(nominal);
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Identity & Hero with White Background & Elegant Gold/Indigo Accents */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                DASHBOARD ADMINISTRATOR UTAMA
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Login: <strong className="text-slate-800">riyan</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pusat Kendali & Tata Kelola Maulid Nabi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Hak akses penuh: Kelola akun Usser (RT 08, RT 09, RT 10) & Bendahara, tetapkan target per warga, pantau arus kas real-time, audit jejak perubahan, dan terbitkan surat laporan ber-kop resmi.
            </p>
          </div>

          {/* Quick PDF Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => onOpenReportModal('admin_mingguan')}
              className="py-2.5 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Download Lap. Mingguan</span>
            </button>
            <button
              onClick={() => onOpenReportModal('admin_keseluruhan')}
              className="py-2.5 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Download Lap. Keseluruhan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Feature Navigation Ribbon (Scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setAdminTab('ringkasan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'ringkasan'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Sisa Saldo & Tabulasi 15 Minggu</span>
        </button>

        <button
          onClick={() => setAdminTab('target')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'target'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Set Target Per Orang</span>
        </button>

        <button
          onClick={() => setAdminTab('buat_akun')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'buat_akun'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Buat Akun (Usser 1, 2, 3, Bendahara)</span>
        </button>

        <button
          onClick={() => setAdminTab('donasi_warga')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'donasi_warga'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cek Donasi Warga + PDF</span>
        </button>

        <button
          onClick={() => setAdminTab('donasi_sukarela')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'donasi_sukarela'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Cek Donasi Suka Rela + PDF</span>
        </button>

        <button
          onClick={() => setAdminTab('bendahara')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'bendahara'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Cek Bendahara + PDF</span>
        </button>

        <button
          onClick={() => setAdminTab('perubahan_data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            adminTab === 'perubahan_data'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Perubahan Data & Audit Log</span>
        </button>
      </div>

      {/* FEATURE 1: RINGKASAN & TABULASI 15 MINGGU */}
      {adminTab === 'ringkasan' && (
        <div className="space-y-6">
          <RekapitulasiMingguan />
        </div>
      )}

      {/* FEATURE 2: SET TARGET PER ORANG */}
      {adminTab === 'target' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md max-w-2xl mx-auto">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Atur Target Iuran Per Warga</h3>
              <p className="text-xs text-slate-500">
                Target iuran wajib per KK / Warga selama 15 minggu
              </p>
            </div>
          </div>

          {targetError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{targetError}</span>
            </div>
          )}

          <form onSubmit={handleSaveTarget} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominal Target Per Orang (Rp)
              </label>
              <input
                type="text"
                required
                value={targetInput}
                onChange={(e) => setTargetInput(formatInputNumber(e.target.value))}
                placeholder="Contoh: 150.000"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
              <div className="flex gap-2 mt-2">
                {[100000, 150000, 200000, 300000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetInput(formatInputNumber(amt))}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation of automatic decrement behavior */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-amber-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Mekanisme Pengurangan Otomatis:</span>
              </div>
              <p>
                Ketika petugas (Usser 1, Usser 2, Usser 3) menginput pembayaran warga di minggu ke-1, ke-2, dst., sisa target warga tersebut akan <strong>berkurang secara otomatis</strong> secara real-time di semua dashboard.
              </p>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-emerald-800 font-bold">
                Simulasi: Target {formatRupiah(parseFormattedNumber(targetInput) || 150000)} - Bayar M1 (Rp 10.000) - Bayar M2 (Rp 10.000) = Sisa Target Rp {(Math.max(0, (parseFormattedNumber(targetInput) || 150000) - 20000)).toLocaleString('id-ID')}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Terapkan Target Per Orang</span>
            </button>
          </form>
        </div>
      )}

      {/* FEATURE 3: BUAT AKUN (User Management) */}
      {adminTab === 'buat_akun' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Buat Akun */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Buat Akun Baru</h3>
                <p className="text-xs text-slate-500">Pilih role Usser (RT 08, RT 09, RT 10) atau Bendahara</p>
              </div>
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>

            {akunError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{akunError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              {/* Role Selection: Pilihan Usser RT & Bendahara */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe / Subtype Akun (Pilihan):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Usser 1 - RT 08', 'Usser 2 - RT 09', 'Usser 3 - RT 10', 'Bendahara'] as UserSubtype[]).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setAkunSubtype(sub)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                        akunSubtype === sub
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Petugas
                </label>
                <input
                  type="text"
                  required
                  value={akunNama}
                  onChange={(e) => setAkunNama(e.target.value)}
                  placeholder="Contoh: Muhammad Ridwan"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login (Opsional / Otomatis)
                </label>
                <input
                  type="text"
                  value={akunUsername}
                  onChange={(e) => setAkunUsername(e.target.value)}
                  placeholder="Contoh: ridwan_mn"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Akun
                </label>
                <div className="relative">
                  <input
                    type={akunShowPassword ? 'text' : 'password'}
                    required
                    value={akunPassword}
                    onChange={(e) => setAkunPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setAkunShowPassword(!akunShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {akunShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Buat Akun Sekarang</span>
              </button>
            </form>
          </div>

          {/* Daftar Akun Aktif */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daftar Akun Pengguna</h3>
                <p className="text-xs text-slate-500">Total {state.users.length} Akun Terdaftar</p>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {state.users.map((u) => {
                const isAdmin = u.username.toLowerCase() === 'riyan';
                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : u.role === 'bendahara'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        }`}>
                          {u.userSubtype || u.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
                        <span>Username: <strong className="text-slate-800">{u.username}</strong></span>
                        <span>Password: ••••••••</span>
                      </div>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus akun ${u.name} (${u.username})?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-2 rounded-xl text-xs bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 4: CEK DONASI WARGA & DOWNLOAD PDF */}
      {adminTab === 'donasi_warga' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Cek Data Uang Masuk Donasi Warga</h3>
              <p className="text-xs text-slate-500">
                Total Masuk: <strong className="font-mono text-emerald-700">{formatRupiah(totalDonasiWarga)}</strong> • {state.warga.length} Warga
              </p>
            </div>

            <button
              onClick={() => onOpenReportModal('admin_warga')}
              className="py-2.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF (Kop Surat & TTD Ketua & Admin)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center">No</th>
                  <th className="p-3">Nama Warga</th>
                  <th className="p-3 text-center">Minggu Bayar</th>
                  <th className="p-3 text-right">Total Bayar</th>
                  <th className="p-3 text-right">Sisa Target</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Pencatat Awal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {state.warga.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">Belum ada data warga.</td>
                  </tr>
                ) : (
                  state.warga.map((w, idx) => {
                    const total = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
                    const sisa = Math.max(0, state.targetPerOrang - total);
                    const paidWeeks = (w.mingguan || []).filter(m => m > 0).length;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-mono text-slate-600">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">
                          {w.nama}
                          {w.rt && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {w.rt}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-medium">{paidWeeks} / 15 Minggu</td>
                        <td className="p-3 text-right font-mono font-bold text-indigo-800">{formatRupiah(total)}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-800">{formatRupiah(sisa)}</td>
                        <td className="p-3 text-center">
                          {sisa === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Lunas</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Belum</span>
                          )}
                        </td>
                        <td className="p-3 text-center text-slate-500">{w.createdBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEATURE 5: CEK DONASI SUKA RELA & DOWNLOAD PDF */}
      {adminTab === 'donasi_sukarela' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Cek Data Uang Masuk Donasi Suka Rela</h3>
              <p className="text-xs text-slate-500">
                Total Masuk: <strong className="font-mono text-purple-700">{formatRupiah(totalDonasiSukarela)}</strong> • {state.donasiSukarela.length} Donatur
              </p>
            </div>

            <button
              onClick={() => onOpenReportModal('admin_sukarela')}
              className="py-2.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF (Kop Surat & TTD Ketua & Admin)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center">No</th>
                  <th className="p-3">Nama Donatur</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-right">Jumlah Donasi</th>
                  <th className="p-3 text-center">Pencatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {state.donasiSukarela.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Belum ada donasi suka rela.</td>
                  </tr>
                ) : (
                  state.donasiSukarela.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-mono text-slate-600">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-3 text-slate-600">{s.tanggal}</td>
                      <td className="p-3 text-slate-600">{s.keterangan || '-'}</td>
                      <td className="p-3 text-right font-mono font-bold text-purple-800">{formatRupiah(s.jumlah)}</td>
                      <td className="p-3 text-center text-slate-500">{s.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEATURE 6: CEK BENDAHARA & DOWNLOAD PDF */}
      {adminTab === 'bendahara' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Cek Data Uang Keluar (Pengeluaran Bendahara)</h3>
              <p className="text-xs text-slate-500">
                Total Keluar: <strong className="font-mono text-rose-700">{formatRupiah(totalPengeluaran)}</strong> • Sisa Saldo: <strong className="font-mono text-emerald-700">{formatRupiah(uangTersedia)}</strong>
              </p>
            </div>

            <button
              onClick={() => onOpenReportModal('admin_pengeluaran')}
              className="py-2.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF (Kop Surat & TTD Ketua & Admin)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center">No</th>
                  <th className="p-3">Keperluan / Keterangan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3 text-right">Uang Keluar</th>
                  <th className="p-3 text-center">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {state.pengeluaran.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Belum ada data pengeluaran.</td>
                  </tr>
                ) : (
                  state.pengeluaran.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-mono text-slate-600">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{p.keperluan}</td>
                      <td className="p-3 text-slate-600">{p.kategori}</td>
                      <td className="p-3 text-slate-600">{p.tanggal}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">-{formatRupiah(p.jumlah)}</td>
                      <td className="p-3 text-center text-slate-500">{p.dicatatOleh}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEATURE 7: PERUBAHAN DATA (Audit Trail & Realtime Log) */}
      {adminTab === 'perubahan_data' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                Jejak Perubahan Data & Audit Trail (Real-Time)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Setiap perubahan data dari Usser 1, Usser 2, Usser 3, Bendahara, dan Admin tercatat detail dengan hari, tanggal, tahun, jam, dan nama akun pengubah.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {state.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-600">
                      Oleh: <strong className="text-slate-900">{log.actor}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{log.detail}</p>
                </div>

                <div className="text-[11px] text-slate-600 font-mono shrink-0 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{log.tanggalStr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
