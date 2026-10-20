import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PengeluaranRecord } from '../types';
import {
  formatRupiah,
  formatInputNumber,
  parseFormattedNumber,
  useRealtimeClock
} from '../utils/format';
import {
  Wallet,
  ArrowDownCircle,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Calendar,
  AlertOctagon,
  CheckCircle,
  X
} from 'lucide-react';

interface DashboardBendaharaProps {
  onOpenReportModal: (type: 'bendahara_kas') => void;
}

export const DashboardBendahara: React.FC<DashboardBendaharaProps> = ({ onOpenReportModal }) => {
  const {
    state,
    savePengeluaran,
    deletePengeluaran,
    totalDonasiWarga,
    totalDonasiSukarela,
    totalUangMasuk,
    totalPengeluaran,
    uangTersedia
  } = useApp();

  const { dateTime } = useRealtimeClock();

  // New Pengeluaran Form State
  const [keperluan, setKeperluan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [kategori, setKategori] = useState('Perlengkapan & Tenda');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Pengeluaran Modal State
  const [editingPengeluaran, setEditingPengeluaran] = useState<PengeluaranRecord | null>(null);
  const [editKeperluan, setEditKeperluan] = useState('');
  const [editJumlah, setEditJumlah] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Real-time calculation check
  const currentNominal = parseFormattedNumber(jumlah);
  const isExceeding = currentNominal > uangTersedia;

  // Submit New Pengeluaran with strict available funds validation:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanKeperluan = keperluan.trim();
    if (!cleanKeperluan) {
      setFormError('Keperluan pengeluaran wajib diisi!');
      return;
    }

    const nominal = parseFormattedNumber(jumlah);
    if (nominal <= 0) {
      setFormError('Jumlah pengeluaran harus lebih besar dari Rp 0!');
      return;
    }

    if (nominal > uangTersedia) {
      setFormError(
        `Akses Ditolak! Pengeluaran (${formatRupiah(nominal)}) melebihi Uang Tersedia (${formatRupiah(uangTersedia)}). Saldo kas tidak mencukupi!`
      );
      return;
    }

    const res = await savePengeluaran({
      keperluan: cleanKeperluan,
      jumlah: nominal,
      kategori
    });

    if (res.success) {
      setKeperluan('');
      setJumlah('');
      setKategori('Perlengkapan & Tenda');
    } else {
      setFormError(res.error || 'Gagal menyimpan pengeluaran');
    }
  };

  const handleOpenEdit = (p: PengeluaranRecord) => {
    setEditingPengeluaran(p);
    setEditKeperluan(p.keperluan);
    setEditJumlah(formatInputNumber(p.jumlah));
    setEditKategori(p.kategori || 'Perlengkapan & Tenda');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengeluaran) return;
    setEditError(null);

    const cleanKeperluan = editKeperluan.trim();
    if (!cleanKeperluan) {
      setEditError('Keperluan tidak boleh kosong');
      return;
    }

    const nominal = parseFormattedNumber(editJumlah);
    if (nominal <= 0) {
      setEditError('Jumlah harus lebih besar dari 0');
      return;
    }

    // Check with adjusted available balance
    const availableWithoutCurrent = uangTersedia + editingPengeluaran.jumlah;
    if (nominal > availableWithoutCurrent) {
      setEditError(`Akses ditolak! Jumlah melebihi saldo tersedia (${formatRupiah(availableWithoutCurrent)}).`);
      return;
    }

    const res = await savePengeluaran({
      id: editingPengeluaran.id,
      keperluan: cleanKeperluan,
      jumlah: nominal,
      kategori: editKategori
    });

    if (res.success) {
      setEditingPengeluaran(null);
    } else {
      setEditError(res.error || 'Gagal mengubah pengeluaran');
    }
  };

  const handleDelete = async (p: PengeluaranRecord) => {
    if (window.confirm(`Hapus catatan pengeluaran "${p.keperluan}" sebesar ${formatRupiah(p.jumlah)}?`)) {
      await deletePengeluaran(p.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & UANG TERSEDIA Showcase (White Theme with Emerald Accents) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Dashboard Bendahara PHBI
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Peringatan Maulid Nabi SAW
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Buku Kas & Pengeluaran PHBI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Uang Tersedia bersumber otomatis dari gabungan Donasi Warga dan Donasi Suka Rela dikurangi seluruh Pengeluaran.
            </p>
          </div>

          {/* Download Official Report Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => onOpenReportModal('bendahara_kas')}
              className="py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download Laporan Kas (PDF Resmi)</span>
            </button>
          </div>
        </div>

        {/* Big Financial Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* UANG TERSEDIA (HERO) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block mb-1">
              ⭐ UANG TERSEDIA (SISA KAS) ⭐
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
              {formatRupiah(uangTersedia)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              Batas Maksimum Pengeluaran
            </div>
          </div>

          {/* TOTAL PEMASUKAN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-sm">
            <span className="text-xs font-bold text-indigo-900 block mb-1">
              Total Uang Masuk
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
              {formatRupiah(totalUangMasuk)}
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1 flex justify-between">
              <span>Warga: {formatRupiah(totalDonasiWarga, false)}</span>
              <span>Suka: {formatRupiah(totalDonasiSukarela, false)}</span>
            </div>
          </div>

          {/* TOTAL PENGELUARAN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-100 shadow-sm">
            <span className="text-xs font-bold text-rose-900 block mb-1">
              Total Pengeluaran Kas
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-950 font-mono">
              {formatRupiah(totalPengeluaran)}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              {state.pengeluaran.length} Transaksi Tercatat
            </div>
          </div>

          {/* PERSENTASE KAS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 border border-purple-100 shadow-sm">
            <span className="text-xs font-bold text-purple-900 block mb-1">
              Rasio Tersedia vs Masuk
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-950 font-mono">
              {totalUangMasuk > 0 ? Math.round((uangTersedia / totalUangMasuk) * 100) : 0}%
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              Kesehatan Finansial Panitia
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Input Pengeluaran */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Catat Pengeluaran Baru</h3>
              <p className="text-xs text-slate-500">
                Uang tersedia akan berkurang otomatis
              </p>
            </div>
            <ArrowDownCircle className="w-5 h-5 text-rose-600" />
          </div>

          {/* Form Error or Exceeding Banner */}
          {formError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {isExceeding && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 animate-pulse">
              <AlertOctagon className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Peringatan: Nominal (<strong>{formatRupiah(currentNominal)}</strong>) melebihi Uang Tersedia saat ini!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keperluan / Keterangan Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={keperluan}
                onChange={(e) => {
                  setKeperluan(e.target.value);
                  setFormError(null);
                }}
                placeholder="Contoh: Sewa Tenda & Sound System Maulid"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Pos Anggaran
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="Perlengkapan & Tenda">Perlengkapan, Tenda & Panggung</option>
                <option value="Konsumsi & Prasmanan">Konsumsi Warga & Tamu Undangan</option>
                <option value="Honor Mubaligh & Qori">Bisyarah Mubaligh & Qori</option>
                <option value="Hadiah & Santunan">Santunan Anak Yatim & Perlombaan</option>
                <option value="Dekorasi & Kebersihan">Dekorasi, Dokumentasi & Kebersihan</option>
                <option value="Operasional Maulid">Operasional Panitia & Logistik</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Jumlah Pengeluaran (Rp)</span>
                <span className="text-[11px] text-slate-500 font-mono font-bold">
                  Sisa Saldo Kas: {formatRupiah(uangTersedia)}
                </span>
              </label>
              <input
                type="text"
                required
                value={jumlah}
                onChange={(e) => {
                  setJumlah(formatInputNumber(e.target.value));
                  setFormError(null);
                }}
                placeholder="Contoh: 100.000"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 shadow-sm ${
                  isExceeding
                    ? 'border-rose-500 focus:ring-rose-500 text-rose-700 bg-rose-50/50'
                    : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setJumlah(formatInputNumber(amt))}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    +{formatRupiah(amt, false)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Waktu Transaksi (Otomatis Real-Time)
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-800 font-mono font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{dateTime}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isExceeding}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                isExceeding
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan Pengeluaran Kas</span>
            </button>
          </form>
        </div>

        {/* Daftar Riwayat Pengeluaran */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daftar Transaksi Pengeluaran</h3>
              <p className="text-xs text-slate-500">
                Total: <strong className="font-mono text-rose-700">{formatRupiah(totalPengeluaran)}</strong> ({state.pengeluaran.length} Catatan)
              </p>
            </div>

            <button
              onClick={() => onOpenReportModal('bendahara_kas')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF Laporan</span>
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {state.pengeluaran.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Belum ada pengeluaran kas yang dicatat. Silakan gunakan form di sebelah kiri untuk mencatat.
              </div>
            ) : (
              state.pengeluaran.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{p.keperluan}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {p.kategori || 'Operasional'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{p.tanggal}</span>
                      <span>•</span>
                      <span>Oleh: {p.dicatatOleh}</span>
                    </div>
                    {p.lastEditedBy && (
                      <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                        di edit oleh: {p.lastEditedBy} ({p.lastEditedAt})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base font-extrabold font-mono text-rose-700">
                      -{formatRupiah(p.jumlah)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                        title="Edit Pengeluaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Edit Pengeluaran */}
      {editingPengeluaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Edit Catatan Pengeluaran Kas</h4>
              <button
                onClick={() => setEditingPengeluaran(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keperluan Pengeluaran
                </label>
                <input
                  type="text"
                  required
                  value={editKeperluan}
                  onChange={(e) => setEditKeperluan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={editKategori}
                  onChange={(e) => setEditKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Perlengkapan & Tenda">Perlengkapan, Tenda & Panggung</option>
                  <option value="Konsumsi & Prasmanan">Konsumsi Warga & Tamu Undangan</option>
                  <option value="Honor Mubaligh & Qori">Bisyarah Mubaligh & Qori</option>
                  <option value="Hadiah & Santunan">Santunan Anak Yatim & Perlombaan</option>
                  <option value="Dekorasi & Kebersihan">Dekorasi, Dokumentasi & Kebersihan</option>
                  <option value="Operasional Maulid">Operasional Panitia & Logistik</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Pengeluaran (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={editJumlah}
                  onChange={(e) => setEditJumlah(formatInputNumber(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPengeluaran(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
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
