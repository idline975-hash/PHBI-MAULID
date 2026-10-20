import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WargaRecord, DonasiSukarelaRecord } from '../types';
import {
  formatRupiah,
  formatInputNumber,
  parseFormattedNumber,
  useRealtimeClock
} from '../utils/format';
import { RekapitulasiMingguan } from './RekapitulasiMingguan';
import {
  Users,
  HeartHandshake,
  TableProperties,
  PlusCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Calendar,
  Search,
  X,
  Home,
  Printer
} from 'lucide-react';

interface DashboardUsserProps {
  onOpenReportModal?: (type: string) => void;
}

export const DashboardUsser: React.FC<DashboardUsserProps> = ({ onOpenReportModal }) => {
  const {
    state,
    currentUser,
    saveWarga,
    deleteWarga,
    saveDonasiSukarela,
    deleteDonasiSukarela,
    totalDonasiWarga,
    totalDonasiSukarela
  } = useApp();

  const { dateTime } = useRealtimeClock();

  // Active view tab (only 3 menus: warga, sukarela, rekap)
  const [activeTab, setActiveTab] = useState<'warga' | 'sukarela' | 'rekap'>('warga');

  // Determine default RT based on logged in usser subtype
  const getDefaultRt = () => {
    const sub = currentUser?.userSubtype || '';
    if (sub.includes('RT 09')) return 'RT 09';
    if (sub.includes('RT 10')) return 'RT 10';
    if (sub.includes('RT 08')) return 'RT 08';
    return 'RT 08';
  };

  // DONASI WARGA Form State (with exact tab/field order: Minggu -> Tanggal -> Rt -> Nama -> Jumlah)
  const [wargaMinggu, setWargaMinggu] = useState<number>(1);
  const [wargaRt, setWargaRt] = useState(getDefaultRt());
  const [wargaNama, setWargaNama] = useState('');
  const [wargaUangMasuk, setWargaUangMasuk] = useState('10.000');
  const [wargaError, setWargaError] = useState<string | null>(null);

  // DONASI WARGA Edit Modal State
  const [editingWarga, setEditingWarga] = useState<WargaRecord | null>(null);
  const [editWargaMinggu, setEditWargaMinggu] = useState<number>(1);
  const [editWargaRt, setEditWargaRt] = useState('RT 01');
  const [editWargaNama, setEditWargaNama] = useState('');
  const [editWargaUang, setEditWargaUang] = useState('');
  const [editWargaError, setEditWargaError] = useState<string | null>(null);

  // DONASI SUKA RELA Form State
  const [srNama, setSrNama] = useState('');
  const [srUangMasuk, setSrUangMasuk] = useState('50.000');
  const [srKeterangan, setSrKeterangan] = useState('');
  const [srError, setSrError] = useState<string | null>(null);

  // DONASI SUKA RELA Edit Modal State
  const [editingSr, setEditingSr] = useState<DonasiSukarelaRecord | null>(null);
  const [editSrNama, setEditSrNama] = useState('');
  const [editSrUang, setEditSrUang] = useState('');
  const [editSrKeterangan, setEditSrKeterangan] = useState('');
  const [editSrError, setEditSrError] = useState<string | null>(null);

  // Search query for lists
  const [searchWarga, setSearchWarga] = useState('');
  const [searchSr, setSearchSr] = useState('');

  // 1. Submit Donasi Warga
  const handleSaveWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setWargaError(null);

    const cleanName = wargaNama.trim();
    if (!cleanName) {
      setWargaError('Nama warga wajib diisi!');
      return;
    }

    // Check duplicate name rule
    const isDuplicate = state.warga.some(
      w => w.nama.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      setWargaError(`Akses ditolak! Nama warga "${cleanName}" sudah terdaftar dalam sistem. Silakan cari di daftar rekapitulasi untuk menambah iuran minggu berikutnya.`);
      return;
    }

    const amount = parseFormattedNumber(wargaUangMasuk);
    if (amount <= 0) {
      setWargaError('Jumlah uang masuk harus lebih dari Rp 0!');
      return;
    }

    const res = await saveWarga({
      nama: cleanName,
      rt: wargaRt.trim() || 'RT 01',
      minggu: wargaMinggu,
      jumlah: amount
    });

    if (res.success) {
      setWargaNama('');
      setWargaMinggu(1);
      setWargaRt(getDefaultRt());
      setWargaUangMasuk('10.000');
    } else {
      setWargaError(res.error || 'Gagal menyimpan data');
    }
  };

  // 2. Open Edit Warga
  const handleOpenEditWarga = (w: WargaRecord) => {
    setEditingWarga(w);
    setEditWargaMinggu(1);
    setEditWargaRt(w.rt || 'RT 01');
    setEditWargaNama(w.nama);
    setEditWargaUang(formatInputNumber(w.mingguan?.[0] || 0));
    setEditWargaError(null);
  };

  const handleMingguChangeInEdit = (m: number) => {
    setEditWargaMinggu(m);
    if (editingWarga) {
      const existingAmount = editingWarga.mingguan?.[m - 1] || 0;
      setEditWargaUang(formatInputNumber(existingAmount));
    }
  };

  // 3. Submit Edit Warga
  const handleSaveEditWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarga) return;
    setEditWargaError(null);

    const cleanName = editWargaNama.trim();
    if (!cleanName) {
      setEditWargaError('Nama warga tidak boleh kosong!');
      return;
    }

    // Prevent duplicate name with another citizen
    const isDuplicate = state.warga.some(
      w => w.id !== editingWarga.id && w.nama.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setEditWargaError(`Akses ditolak! Nama warga "${cleanName}" sudah terdaftar.`);
      return;
    }

    const amount = parseFormattedNumber(editWargaUang);
    const res = await saveWarga({
      id: editingWarga.id,
      nama: cleanName,
      rt: editWargaRt.trim() || 'RT 01',
      minggu: editWargaMinggu,
      jumlah: amount
    });

    if (res.success) {
      setEditingWarga(null);
    } else {
      setEditWargaError(res.error || 'Gagal memperbarui');
    }
  };

  // 4. Submit Donasi Suka Rela
  const handleSaveDonasiSukarela = async (e: React.FormEvent) => {
    e.preventDefault();
    setSrError(null);

    const cleanName = srNama.trim();
    if (!cleanName) {
      setSrError('Nama donatur suka rela wajib diisi!');
      return;
    }

    // Duplicate check for Sukarela
    const isDuplicate = state.donasiSukarela.some(
      s => s.nama.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setSrError(`Akses ditolak! Nama "${cleanName}" sudah terdaftar dalam donasi suka rela. Gunakan nama yang berbeda atau edit data yang ada.`);
      return;
    }

    const amount = parseFormattedNumber(srUangMasuk);
    if (amount <= 0) {
      setSrError('Jumlah uang masuk harus lebih dari Rp 0!');
      return;
    }

    const res = await saveDonasiSukarela({
      nama: cleanName,
      jumlah: amount,
      keterangan: srKeterangan.trim()
    });

    if (res.success) {
      setSrNama('');
      setSrUangMasuk('50.000');
      setSrKeterangan('');
    } else {
      setSrError(res.error || 'Gagal menyimpan');
    }
  };

  // 5. Open Edit Sukarela
  const handleOpenEditSr = (s: DonasiSukarelaRecord) => {
    setEditingSr(s);
    setEditSrNama(s.nama);
    setEditSrUang(formatInputNumber(s.jumlah));
    setEditSrKeterangan(s.keterangan || '');
    setEditSrError(null);
  };

  // 6. Submit Edit Sukarela
  const handleSaveEditSr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSr) return;
    setEditSrError(null);

    const cleanName = editSrNama.trim();
    if (!cleanName) {
      setEditSrError('Nama tidak boleh kosong!');
      return;
    }

    const isDuplicate = state.donasiSukarela.some(
      s => s.id !== editingSr.id && s.nama.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setEditSrError(`Akses ditolak! Nama "${cleanName}" sudah terdaftar.`);
      return;
    }

    const amount = parseFormattedNumber(editSrUang);
    const res = await saveDonasiSukarela({
      id: editingSr.id,
      nama: cleanName,
      jumlah: amount,
      keterangan: editSrKeterangan.trim()
    });

    if (res.success) {
      setEditingSr(null);
    } else {
      setEditSrError(res.error || 'Gagal memperbarui');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Card with White Background */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                Dashboard {currentUser?.userSubtype || 'Usser'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Pencatatan Donasi Maulid Nabi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Selamat Datang, {currentUser?.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Input data iuran warga per minggu (1–15) dan donasi suka rela secara online dan tersinkronisasi otomatis ke semua perangkat.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs (Clean White Background Theme) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('warga')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'warga'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Donasi Warga</span>
        </button>

        <button
          onClick={() => setActiveTab('sukarela')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'sukarela'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Donasi Suka Rela</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-indigo-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TableProperties className="w-4 h-4" />
          <span>Rekapitulasi 15 Minggu</span>
        </button>

        <div className="ml-auto">
          <button
            onClick={() => onOpenReportModal && onOpenReportModal('usser_total')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DONASI WARGA */}
      {activeTab === 'warga' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input Donasi Warga: ORDER SESUAI PERMINTAAN USER:
              1. Pembayaran untuk minggu ke
              2. Tanggal dan waktu
              3. Rt
              4. Nama warga
              5. Jumlah uang masuk
          */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Input Donasi Warga</h3>
                <p className="text-xs text-slate-500">Urutan formulir input pembayaran donasi warga</p>
              </div>
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>

            {wargaError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{wargaError}</span>
              </div>
            )}

            <form onSubmit={handleSaveWarga} className="space-y-4">
              {/* 1. Pembayaran untuk minggu ke */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>1. Pembayaran Untuk Minggu Ke: <span className="text-indigo-600">*</span></span>
                  <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Minggu {wargaMinggu}
                  </span>
                </label>
                <select
                  tabIndex={1}
                  value={wargaMinggu}
                  onChange={(e) => setWargaMinggu(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                >
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Minggu ke-{i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Tanggal dan waktu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>2. Tanggal dan Waktu</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Otomatis Real-time
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    tabIndex={2}
                    type="text"
                    readOnly
                    value={dateTime}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-mono font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 3. Rt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>3. RT (Rukun Tetangga) <span className="text-indigo-600 font-bold">Tererkunci Sesuai Login</span></span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Otomatis Akun
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    tabIndex={3}
                    type="text"
                    readOnly
                    value={getDefaultRt()}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold cursor-not-allowed shadow-inner"
                  />
                </div>
              </div>

              {/* 4. Nama warga */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Nama Warga <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    tabIndex={4}
                    type="text"
                    required
                    value={wargaNama}
                    onChange={(e) => {
                      setWargaNama(e.target.value);
                      setWargaError(null);
                    }}
                    placeholder="Ketik nama warga (Contoh: Bpk. H. Supriadi)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                  />
                </div>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Sistem otomatis mendeteksi nama ganda; jika nama sudah terdaftar, input akan ditolak.
                </p>
              </div>

              {/* 5. Jumlah uang masuk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Jumlah Uang Masuk (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    Rp
                  </div>
                  <input
                    tabIndex={5}
                    type="text"
                    required
                    value={wargaUangMasuk}
                    onChange={(e) => setWargaUangMasuk(formatInputNumber(e.target.value))}
                    placeholder="10.000"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                {/* Quick nominal buttons */}
                <div className="flex gap-2 mt-2">
                  {['5.000', '10.000', '20.000', '50.000'].map(nominal => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setWargaUangMasuk(nominal)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {nominal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                tabIndex={6}
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Data Donasi Warga</span>
              </button>
            </form>
          </div>

          {/* List Data Donasi Warga */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daftar Donasi Warga</h3>
                <p className="text-xs text-slate-500">
                  Total Terkumpul: <strong className="font-mono text-indigo-700">{formatRupiah(totalDonasiWarga)}</strong> ({state.warga.length} Warga)
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchWarga}
                  onChange={(e) => setSearchWarga(e.target.value)}
                  placeholder="Cari warga / RT..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {state.warga.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada data warga yang diinput. Silakan isi form di samping.
                </div>
              ) : (
                state.warga
                  .filter(w => {
                    const q = searchWarga.toLowerCase();
                    return w.nama.toLowerCase().includes(q) || (w.rt && w.rt.toLowerCase().includes(q));
                  })
                  .map((w) => {
                    const totalBayar = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
                    const sisaTarget = Math.max(0, state.targetPerOrang - totalBayar);
                    const bayarCount = (w.mingguan || []).filter(m => m > 0).length;

                    return (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{w.nama}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {w.rt || 'RT 01'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {bayarCount}/15 Minggu
                            </span>
                            {sisaTarget === 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Target Lunas
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-indigo-700 font-bold">
                              Total: {formatRupiah(totalBayar)}
                            </span>
                            <span className="text-slate-500">
                              Sisa Target: {formatRupiah(sisaTarget)}
                            </span>
                          </div>

                          {/* Last edited info */}
                          {w.lastEditedBy && (
                            <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                              Di edit oleh: <strong>{w.lastEditedBy}</strong> ({w.lastEditedAt})
                            </div>
                          )}
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleOpenEditWarga(w)}
                            className="p-2 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit Data Warga & Uang Masuk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus seluruh data donasi warga "${w.nama}"?`)) {
                                deleteWarga(w.id);
                              }
                            }}
                            className="p-2 rounded-xl text-xs bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Data Warga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DONASI SUKA RELA */}
      {activeTab === 'sukarela' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input Donasi Suka Rela */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Input Donasi Suka Rela</h3>
                <p className="text-xs text-slate-500">Donasi bebas nominal dan terbuka dari donatur</p>
              </div>
              <HeartHandshake className="w-5 h-5 text-purple-600" />
            </div>

            {srError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{srError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDonasiSukarela} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Donatur Suka Rela <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={srNama}
                  onChange={(e) => {
                    setSrNama(e.target.value);
                    setSrError(null);
                  }}
                  placeholder="Ketik nama donatur (Contoh: Hamba Allah / Bpk. Roni)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Jika terdapat nama yang sama sistem otomatis menolak input.
                </p>
              </div>

              {/* Tanggal Real-time (Auto-filled) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tanggal & Waktu</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Otomatis Real-time
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={dateTime}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Uang Masuk dengan Pemisah Titik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Uang Masuk (Rp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    Rp
                  </div>
                  <input
                    type="text"
                    required
                    value={srUangMasuk}
                    onChange={(e) => setSrUangMasuk(formatInputNumber(e.target.value))}
                    placeholder="50.000"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  />
                </div>
                {/* Quick nominal buttons */}
                <div className="flex gap-2 mt-2">
                  {['20.000', '50.000', '100.000', '200.000'].map(nominal => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setSrUangMasuk(nominal)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {nominal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={srKeterangan}
                  onChange={(e) => setSrKeterangan(e.target.value)}
                  placeholder="Contoh: Titipan donasi dari keluarga..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Simpan Donasi Suka Rela</span>
              </button>
            </form>
          </div>

          {/* List Data Donasi Suka Rela */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daftar Donasi Suka Rela</h3>
                <p className="text-xs text-slate-500">
                  Total: <strong className="font-mono text-purple-700">{formatRupiah(totalDonasiSukarela)}</strong> ({state.donasiSukarela.length} Donatur)
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSr}
                  onChange={(e) => setSearchSr(e.target.value)}
                  placeholder="Cari donatur..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {state.donasiSukarela.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada donasi suka rela yang tercatat.
                </div>
              ) : (
                state.donasiSukarela
                  .filter(s => s.nama.toLowerCase().includes(searchSr.toLowerCase()))
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{s.nama}</span>
                          <span className="font-mono font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                            {formatRupiah(s.jumlah)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>{s.tanggal}</span>
                          {s.keterangan && <span>• {s.keterangan}</span>}
                        </div>

                        {s.lastEditedBy && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                            Di edit oleh: <strong>{s.lastEditedBy}</strong> ({s.lastEditedAt})
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEditSr(s)}
                          className="p-2 rounded-xl text-xs font-bold bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit Donasi Suka Rela"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus donasi suka rela dari ${s.nama}?`)) {
                              deleteDonasiSukarela(s.id);
                            }
                          }}
                          className="p-2 rounded-xl text-xs bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REKAPITULASI 15 MINGGU */}
      {activeTab === 'rekap' && (
        <RekapitulasiMingguan />
      )}

      {/* Modal: Edit Donasi Warga (Order sesuai permintaan: Minggu -> Tanggal -> RT -> Nama -> Uang) */}
      {editingWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Edit Data Donasi Warga</h4>
                <p className="text-xs text-slate-500">
                  Dicatat real-time • Di edit oleh: {currentUser?.name}
                </p>
              </div>
              <button onClick={() => setEditingWarga(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editWargaError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editWargaError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditWarga} className="space-y-4">
              {/* 1. Pembayaran untuk minggu ke */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Pilih Minggu yang Akan Dirubah
                </label>
                <select
                  value={editWargaMinggu}
                  onChange={(e) => handleMingguChangeInEdit(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Minggu ke-{i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Tanggal dan waktu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Tanggal dan Waktu Perubahan
                </label>
                <input
                  type="text"
                  readOnly
                  value={dateTime}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-mono cursor-not-allowed"
                />
              </div>

              {/* 3. Rt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. RT (Rukun Tetangga)
                </label>
                <input
                  type="text"
                  required
                  value={editWargaRt}
                  onChange={(e) => setEditWargaRt(e.target.value)}
                  placeholder="Contoh: RT 01"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 4. Nama warga */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Edit Nama Warga
                </label>
                <input
                  type="text"
                  required
                  value={editWargaNama}
                  onChange={(e) => setEditWargaNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* 5. Jumlah uang masuk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Edit Uang Masuk Minggu ke-{editWargaMinggu} (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={editWargaUang}
                  onChange={(e) => setEditWargaUang(formatInputNumber(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWarga(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Donasi Suka Rela */}
      {editingSr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Edit Donasi Suka Rela</h4>
                <p className="text-xs text-slate-500">
                  Dicatat real-time • Di edit oleh: {currentUser?.name}
                </p>
              </div>
              <button onClick={() => setEditingSr(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSrError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editSrError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditSr} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Edit Nama Donatur
                </label>
                <input
                  type="text"
                  required
                  value={editSrNama}
                  onChange={(e) => setEditSrNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Edit Uang Masuk (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={editSrUang}
                  onChange={(e) => setEditSrUang(formatInputNumber(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Edit Keterangan
                </label>
                <input
                  type="text"
                  value={editSrKeterangan}
                  onChange={(e) => setEditSrKeterangan(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSr(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
