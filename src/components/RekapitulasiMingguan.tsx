import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WargaRecord } from '../types';
import { formatRupiah, formatInputNumber, parseFormattedNumber, useRealtimeClock } from '../utils/format';
import { ReportType } from './OfficialReportModal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  TrendingDown,
  X,
  CreditCard,
  Printer
} from 'lucide-react';

interface RekapitulasiMingguanProps {
  onOpenReportModal?: (type: ReportType) => void;
}

export const RekapitulasiMingguan: React.FC<RekapitulasiMingguanProps> = ({ onOpenReportModal }) => {
  const { state, currentUser, saveWarga, deleteWarga, totalDonasiWarga } = useApp();
  const { dateTime } = useRealtimeClock();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'belum'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<WargaRecord | null>(null);
  const [quickPayWarga, setQuickPayWarga] = useState<WargaRecord | null>(null);

  // Form states for Add Warga
  const [formNama, setFormNama] = useState('');
  const [formMinggu, setFormMinggu] = useState<number>(1);
  const [formNominal, setFormNominal] = useState('10.000');
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for Full Edit Warga (15 weeks)
  const [editNama, setEditNama] = useState('');
  const [editWeeks, setEditWeeks] = useState<string[]>(Array(15).fill('0'));
  const [editError, setEditError] = useState<string | null>(null);

  // Quick pay states
  const [quickMinggu, setQuickMinggu] = useState<number>(1);
  const [quickNominal, setQuickNominal] = useState('10.000');

  // Open Edit Modal
  const handleOpenEdit = (w: WargaRecord) => {
    setEditingWarga(w);
    setEditNama(w.nama);
    const weeksFormatted = (w.mingguan || Array(15).fill(0)).map(val => formatInputNumber(val || 0));
    setEditWeeks(weeksFormatted);
    setEditError(null);
  };

  // Open Quick Pay Modal
  const handleOpenQuickPay = (w: WargaRecord) => {
    setQuickPayWarga(w);
    // Suggest first unpaid week
    const firstUnpaid = (w.mingguan || []).findIndex(v => (v || 0) <= 0);
    setQuickMinggu(firstUnpaid >= 0 ? firstUnpaid + 1 : 1);
    setQuickNominal('10.000');
  };

  // Submit Add Warga
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clean = formNama.trim();
    if (!clean) {
      setFormError('Nama warga wajib diisi!');
      return;
    }

    // Check duplicate name
    const isDup = state.warga.some(w => w.nama.trim().toLowerCase() === clean.toLowerCase());
    if (isDup) {
      setFormError(`Akses ditolak! Nama "${clean}" sudah terdaftar dalam sistem.`);
      return;
    }

    const amount = parseFormattedNumber(formNominal);
    const result = await saveWarga({
      nama: clean,
      minggu: formMinggu,
      jumlah: amount
    });

    if (result.success) {
      setFormNama('');
      setFormNominal('10.000');
      setIsAddModalOpen(false);
    } else {
      setFormError(result.error || 'Gagal menyimpan data warga');
    }
  };

  // Submit Edit Warga
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarga) return;
    setEditError(null);

    const clean = editNama.trim();
    if (!clean) {
      setEditError('Nama warga tidak boleh kosong!');
      return;
    }

    // Duplicate check if changed name
    const isDup = state.warga.some(
      w => w.id !== editingWarga.id && w.nama.trim().toLowerCase() === clean.toLowerCase()
    );
    if (isDup) {
      setEditError(`Akses ditolak! Nama "${clean}" sudah digunakan warga lain.`);
      return;
    }

    const numericWeeks = editWeeks.map(v => parseFormattedNumber(v));
    const result = await saveWarga({
      id: editingWarga.id,
      nama: clean,
      mingguan: numericWeeks
    });

    if (result.success) {
      setEditingWarga(null);
    } else {
      setEditError(result.error || 'Gagal menyimpan perubahan');
    }
  };

  // Submit Quick Pay
  const handleQuickPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayWarga) return;

    const currentWeeks = [...(quickPayWarga.mingguan || Array(15).fill(0))];
    const idx = quickMinggu - 1;
    currentWeeks[idx] = parseFormattedNumber(quickNominal);

    const result = await saveWarga({
      id: quickPayWarga.id,
      nama: quickPayWarga.nama,
      mingguan: currentWeeks,
      minggu: quickMinggu,
      jumlah: currentWeeks[idx]
    });

    if (result.success) {
      setQuickPayWarga(null);
    }
  };

  // Delete confirmation
  const handleDelete = async (w: WargaRecord) => {
    if (window.confirm(`Yakin ingin menghapus seluruh data iuran warga "${w.nama}"?`)) {
      const res = await deleteWarga(w.id);
      if (res && !res.success) {
        alert(res.error || 'Gagal menghapus data warga');
      }
    }
  };

  // Determine if logged in user is a specific RT usser
  const loggedInSubtype = currentUser?.userSubtype || '';
  const defaultRtFilter = loggedInSubtype.includes('RT 08')
    ? 'RT 08'
    : loggedInSubtype.includes('RT 09')
    ? 'RT 09'
    : loggedInSubtype.includes('RT 10')
    ? 'RT 10'
    : 'all';

  const [rtFilter, setRtFilter] = useState<string>(defaultRtFilter);

  // Filtered warga list
  const filteredWarga = state.warga.filter(w => {
    const matchesSearch = w.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const totalPaid = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
    const isLunas = totalPaid >= state.targetPerOrang;

    const wargaRtClean = (w.rt || 'RT 08').trim();
    const matchesRt = rtFilter === 'all' || wargaRtClean.toLowerCase() === rtFilter.toLowerCase();

    if (!matchesSearch || !matchesRt) return false;
    if (filterStatus === 'lunas') return isLunas;
    if (filterStatus === 'belum') return !isLunas;
    return true;
  });

  const wargaInCurrentRt = state.warga.filter(w => {
    if (rtFilter === 'all') return true;
    return (w.rt || 'RT 08').trim().toLowerCase() === rtFilter.toLowerCase();
  });

  const totalWargaCount = wargaInCurrentRt.length;
  const lunasCount = wargaInCurrentRt.filter(w => {
    const total = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
    return total >= state.targetPerOrang;
  }).length;

  const totalDonasiWargaCurrentRt = wargaInCurrentRt.reduce((sum, w) => {
    return sum + (w.mingguan || []).reduce((a, b) => a + (Number(b) || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Strip (Clean White Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-bold mb-1">
            <span>Total Donasi Warga</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatRupiah(totalDonasiWarga)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalWargaCount} Warga Terdaftar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-purple-700 text-xs font-bold mb-1">
            <span>Target Iuran / Warga</span>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatRupiah(state.targetPerOrang)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Otomatis Berkurang per Minggu
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
            <span>Status Warga Lunas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {lunasCount} <span className="text-sm font-normal text-slate-500">/ {totalWargaCount}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            {totalWargaCount > 0 ? Math.round((lunasCount / totalWargaCount) * 100) : 0}% Target Tercapai
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-1">
            <span>Belum Lunas</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalWargaCount - lunasCount} Warga
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Cicilan 15 Minggu Berjalan
          </div>
        </div>
      </div>

      {/* Control Bar: RT Tabs, Search, Filters & Add Citizen */}
      <div className="space-y-3">
        {/* RT Tab Selectors (Terpisah Sesuai RT 08, RT 09, RT 10) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 shrink-0">Rekapitulasi RT Terpisah:</span>
          {[
            { id: 'RT 08', label: 'Rekapitulasi RT 08' },
            { id: 'RT 09', label: 'Rekapitulasi RT 09' },
            { id: 'RT 10', label: 'Rekapitulasi RT 10' },
            { id: 'all', label: 'Semua RT (Gabungan)' }
          ].map(rt => (
            <button
              key={rt.id}
              onClick={() => setRtFilter(rt.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                rtFilter === rt.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama warga..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter segment */}
            <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({totalWargaCount})
              </button>
              <button
                onClick={() => setFilterStatus('lunas')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'lunas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lunas ({lunasCount})
              </button>
              <button
                onClick={() => setFilterStatus('belum')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'belum' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum ({totalWargaCount - lunasCount})
              </button>
            </div>
          </div>

          {/* Action Buttons: PDF Print & Add Citizen */}
          <div className="flex items-center gap-2">
            {onOpenReportModal && (
              <button
                type="button"
                onClick={() => onOpenReportModal('admin_mingguan')}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                title="Cetak Laporan PDF Resmi"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF Resmi</span>
              </button>
            )}
            <button
              onClick={() => {
                setFormError(null);
                setFormNama('');
                setFormNominal('10.000');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Warga & Iuran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 15-Week Tabulation Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Tabel Rekapitulasi Mingguan (Minggu 1 s/d 15)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Geser tabel ke samping kanan (swipe/scroll) untuk melihat rincian Minggu 1 s/d Minggu 15 secara lengkap
            </p>
          </div>

          {/* Quick Scroll Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 mr-1">
              {filteredWarga.length} Data Warga
            </span>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('table-15-minggu-scroll');
                if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Geser ke kiri"
            >
              &larr; Kiri
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('table-15-minggu-scroll');
                if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Geser ke kanan"
            >
              Kanan &rarr;
            </button>
          </div>
        </div>

        {/* Scroll helper prompt */}
        <div className="bg-indigo-50/70 px-4 py-2 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900 font-semibold">
          <span>👉 Kolom 1 sampai 15 aktif: Geser jari atau klik tombol Kanan/Kiri untuk melihat semua minggu.</span>
          <span className="hidden sm:inline text-indigo-700 text-[10px]">Tabel 15 Minggu Penuh</span>
        </div>

        {/* Horizontal Scrollable Container with Guaranteed Table Width */}
        <div id="table-15-minggu-scroll" className="overflow-x-auto scroll-smooth">
          <table className="min-w-[1650px] w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 text-center w-12 sticky left-0 z-20 bg-slate-100 border-r border-slate-200">No</th>
                <th className="p-3 w-48 min-w-[180px] sticky left-12 z-20 bg-slate-100 border-r border-slate-300 text-slate-900 font-black">
                  Nama Warga
                </th>
                {[...Array(15)].map((_, i) => (
                  <th key={i} className="p-2.5 text-center w-20 min-w-[78px] border-r border-slate-200 font-mono text-slate-800 bg-slate-100/90">
                    <div className="font-extrabold text-[11px]">Minggu {i + 1}</div>
                  </th>
                ))}
                <th className="p-3 text-right w-28 min-w-[105px] bg-slate-100 border-r border-slate-200 font-mono text-indigo-900">Total Bayar</th>
                <th className="p-3 text-right w-28 min-w-[105px] bg-slate-100 border-r border-slate-200 font-mono text-amber-900">Sisa Target</th>
                <th className="p-3 text-center w-24 min-w-[90px] bg-slate-100 border-r border-slate-200">Status</th>
                <th className="p-3 text-center w-32 min-w-[120px] bg-slate-100">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
              {filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan={21} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-bold text-slate-700 text-sm">Belum ada data warga terdaftar</p>
                      <p className="text-xs text-slate-500">
                        Kolom nama dan iuran saat ini masih kosong. Silakan klik tombol "Tambah Warga & Iuran" di atas untuk mulai mencatat.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWarga.map((w, idx) => {
                  const totalPaid = (w.mingguan || []).reduce((acc, m) => acc + (Number(m) || 0), 0);
                  const sisa = Math.max(0, state.targetPerOrang - totalPaid);
                  const isLunas = sisa === 0;

                  return (
                    <tr key={w.id} className="hover:bg-indigo-50/40 transition-colors">
                      {/* Sticky No */}
                      <td className="p-3 text-center font-mono sticky left-0 z-10 bg-white border-r border-slate-200 font-medium text-slate-600">
                        {idx + 1}
                      </td>

                      {/* Sticky Name */}
                      <td className="p-3 font-semibold text-slate-900 sticky left-12 z-10 bg-white border-r border-slate-300 whitespace-nowrap shadow-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{w.nama}</span>
                            {w.rt && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {w.rt}
                              </span>
                            )}
                          </div>
                          {w.lastEditedBy && (
                            <span className="text-[10px] text-amber-800 font-medium">
                              di edit oleh: {w.lastEditedBy}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Weeks 1 to 15 */}
                      {[...Array(15)].map((_, mIdx) => {
                        const val = w.mingguan?.[mIdx] || 0;
                        return (
                          <td
                            key={mIdx}
                            className={`p-2.5 text-center font-mono border-r border-slate-200 text-[11px] ${
                              val > 0
                                ? 'text-emerald-800 font-bold bg-emerald-50/50'
                                : 'text-slate-400'
                            }`}
                          >
                            {val > 0 ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                                {formatRupiah(val, false)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Paid */}
                      <td className="p-3 text-right font-mono font-bold text-indigo-800 border-r border-slate-200 bg-indigo-50/20">
                        {formatRupiah(totalPaid, false)}
                      </td>

                      {/* Sisa Target (Decreases automatically) */}
                      <td className="p-3 text-right font-mono font-semibold border-r border-slate-200 bg-amber-50/20">
                        {isLunas ? (
                          <span className="text-emerald-700 font-bold">Rp 0</span>
                        ) : (
                          <span className="text-amber-800 font-bold">{formatRupiah(sisa, false)}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center border-r border-slate-200">
                        {isLunas ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            LUNAS
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Kurang {formatRupiah(sisa, false)}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenQuickPay(w)}
                            title="Tambah Iuran Cepat"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(w)}
                            title="Edit Nama / Rubah 15 Minggu"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(w)}
                            title="Hapus Warga"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Warga & Iuran Pertama */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Tambah Warga Baru</h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Warga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => {
                    setFormNama(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Contoh: Bpk. H. Supriadi"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Pencarian otomatis: jika nama sudah terdaftar, sistem akan menolak.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Minggu Pembayaran
                  </label>
                  <select
                    value={formMinggu}
                    onChange={(e) => setFormMinggu(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Minggu ke-{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Donasi (Rp)
                  </label>
                  <input
                    type="text"
                    value={formNominal}
                    onChange={(e) => setFormNominal(formatInputNumber(e.target.value))}
                    placeholder="Contoh: 10.000"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Waktu & Tanggal Pencatatan (Otomatis)
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-indigo-900 font-mono font-medium">
                  {dateTime}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Edit Warga (Edit Nama & Rubah 15 Minggu) */}
      {editingWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Edit Data Warga & Nominal 15 Minggu</h4>
                <p className="text-xs text-slate-500">
                  Perubahan akan tercatat dengan waktu real-time dan nama pengubah ({currentUser?.name})
                </p>
              </div>
              <button
                onClick={() => setEditingWarga(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Warga
                </label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Atur Nominal Tiap Minggu (Minggu 1 s/d 15):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
                  {editWeeks.map((val, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-600 font-bold mb-1">
                        Minggu ke-{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const updated = [...editWeeks];
                          updated[idx] = formatInputNumber(e.target.value);
                          setEditWeeks(updated);
                        }}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs flex items-center justify-between">
                <span className="text-slate-700 font-medium">Total Terhitung:</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  {formatRupiah(editWeeks.reduce((acc, v) => acc + parseFormattedNumber(v), 0))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWarga(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Pay */}
      {quickPayWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Tambah Iuran Cepat</h4>
              <button
                onClick={() => setQuickPayWarga(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Warga: <span className="font-bold text-slate-900">{quickPayWarga.nama}</span>
            </p>

            <form onSubmit={handleQuickPaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Minggu ke:
                </label>
                <select
                  value={quickMinggu}
                  onChange={(e) => setQuickMinggu(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {[...Array(15)].map((_, i) => {
                    const currentVal = quickPayWarga.mingguan?.[i] || 0;
                    return (
                      <option key={i + 1} value={i + 1}>
                        Minggu ke-{i + 1} {currentVal > 0 ? `(Sudah ada: ${formatRupiah(currentVal, false)})` : '(Kosong)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Pembayaran (Rp)
                </label>
                <input
                  type="text"
                  value={quickNominal}
                  onChange={(e) => setQuickNominal(formatInputNumber(e.target.value))}
                  placeholder="Contoh: 10.000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPayWarga(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
