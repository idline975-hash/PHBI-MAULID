import React from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, getRealtimeDateIndo } from '../utils/format';
import { Printer, X, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export type ReportType =
  | 'usser_total'
  | 'bendahara_kas'
  | 'admin_warga'
  | 'admin_sukarela'
  | 'admin_pengeluaran'
  | 'admin_mingguan'
  | 'admin_keseluruhan';

interface OfficialReportModalProps {
  reportType: ReportType;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  reportType,
  onClose
}) => {
  const {
    state,
    currentUser,
    totalDonasiWarga,
    totalDonasiSukarela,
    totalUangMasuk,
    totalPengeluaran,
    uangTersedia
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  // Determine Title, Document Number & Signatories
  let reportTitle = 'LAPORAN KEUANGAN RESMI PANITIA MAULID NABI';
  let reportSub = 'PERINGATAN HARI BESAR ISLAM (PHBI)';
  let docNo = 'PHBI-MN/01/X/2026';
  let leftSignRole = 'Petugas Pencatat';
  let leftSignName = currentUser ? `${currentUser.userSubtype || currentUser.name}` : 'Petugas Usser';
  let rightSignRole = 'Ketua Panitia PHBI';
  let rightSignName = 'Ust. Ahmad Suhaemi';

  if (reportType === 'usser_total') {
    reportTitle = 'LAPORAN REKAPITULASI TOTAL DONASI WARGA & SUKA RELA';
    docNo = 'PHBI-MN/USR-TOT/X/2026';
    leftSignRole = currentUser?.userSubtype || 'Petugas Usser';
    leftSignName = currentUser?.name || 'Petugas Usser';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'bendahara_kas') {
    reportTitle = 'LAPORAN RESMI KAS, PENGELUARAN & SISA SALDO BENDAHARA';
    docNo = 'PHBI-MN/KAS-BND/X/2026';
    leftSignRole = 'Bendahara PHBI';
    leftSignName = currentUser?.role === 'bendahara' ? currentUser.name : 'Bendahara PHBI';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'admin_warga') {
    reportTitle = 'LAMPIRAN RESMI DATA UANG MASUK DONASI WARGA (15 MINGGU)';
    docNo = 'PHBI-MN/ADM-DW/X/2026';
    leftSignRole = 'Administrator Sistem';
    leftSignName = currentUser?.name || 'Riyan';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'admin_sukarela') {
    reportTitle = 'LAMPIRAN RESMI DATA UANG MASUK DONASI SUKA RELA';
    docNo = 'PHBI-MN/ADM-DSR/X/2026';
    leftSignRole = 'Administrator Sistem';
    leftSignName = currentUser?.name || 'Riyan';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'admin_pengeluaran') {
    reportTitle = 'LAMPIRAN RESMI DATA UANG KELUAR (PENGELUARAN BENDAHARA)';
    docNo = 'PHBI-MN/ADM-PGL/X/2026';
    leftSignRole = 'Administrator Sistem';
    leftSignName = currentUser?.name || 'Riyan';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'admin_mingguan') {
    reportTitle = 'LAPORAN RESMI TABULASI MINGGUAN (MINGGU 1 S/D 15) & REKAP KAS';
    docNo = 'PHBI-MN/ADM-TAB15/X/2026';
    leftSignRole = 'Administrator Sistem';
    leftSignName = currentUser?.name || 'Riyan';
    rightSignRole = 'Ketua Panitia PHBI';
  } else if (reportType === 'admin_keseluruhan') {
    reportTitle = 'LAPORAN PERTANGGUNGJAWABAN KEUANGAN KESELURUHAN (LPJ KAS)';
    docNo = 'PHBI-MN/ADM-LPJ/X/2026';
    leftSignRole = 'Administrator Sistem';
    leftSignName = currentUser?.name || 'Riyan';
    rightSignRole = 'Ketua Panitia PHBI';
  }

  const currentDateIndo = getRealtimeDateIndo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="font-bold text-sm sm:text-base leading-tight">
                Pratinjau Laporan Resmi Ber-Kop & Tanda Tangan
              </h4>
              <p className="text-xs text-slate-400">Siap Cetak / Unduh sebagai PDF Resmi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Download Helper Banner (Hidden on Print) */}
        <div className="no-print bg-indigo-50 border-b border-indigo-100 px-6 py-2.5 text-xs text-indigo-900 flex items-center justify-between gap-2">
          <span>💡 <strong>Tips Unduh PDF:</strong> Klik tombol <strong>Cetak / Unduh PDF</strong>, lalu ubah <em>Destination / Printer</em> menjadi <strong>Save as PDF</strong> di dialog cetak browser Anda.</span>
          <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">{docNo}</span>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto print:overflow-visible print:p-0 flex-1 bg-white font-sans text-slate-900">
          {/* KOP SURAT RESMI PHBI */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 shrink-0">
                <img
                  src="/assets/aistudio/file_000000009fc8821184f6fbe7af68d760_b9edd21b.png"
                  alt="Logo PHBI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center flex-1">
                <h3 className="text-base sm:text-lg font-bold tracking-wider text-slate-800 uppercase">
                  PANITIA PERINGATAN HARI BESAR ISLAM (PHBI)
                </h3>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-indigo-950 uppercase">
                  PERINGATAN MAULID NABI MUHAMMAD SAW
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Sekretariat: Kp Kedung Sapi Desa Kp Baru Kecamatan Pamarayan Serang – Banten
                </p>
                <p className="text-[11px] text-slate-600 italic">
                  E-Mail: panitiamaulid.kedungsapi@gmail.com • Sistem Informasi Keuangan Digital Terpusat
                </p>
              </div>
              <div className="w-20 h-20 shrink-0 hidden sm:block">
                <img
                  src="/assets/aistudio/file_000000009fc8821184f6fbe7af68d760_b9edd21b.png"
                  alt="Logo PHBI"
                  className="w-full h-full object-contain opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Document Heading */}
          <div className="text-center my-4">
            <h3 className="text-base sm:text-lg font-extrabold underline uppercase tracking-wide text-slate-900">
              {reportTitle}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Nomor: {docNo} • Tanggal Cetak: {currentDateIndo}
            </p>
          </div>

          {/* Summary Box */}
          <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-300">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Ringkasan Kas Keuangan Saat Ini:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Total Donasi Warga</div>
                <div className="text-sm sm:text-base font-bold text-indigo-900 font-mono">
                  {formatRupiah(totalDonasiWarga)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Total Donasi Suka Rela</div>
                <div className="text-sm sm:text-base font-bold text-purple-900 font-mono">
                  {formatRupiah(totalDonasiSukarela)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Total Pengeluaran</div>
                <div className="text-sm sm:text-base font-bold text-rose-700 font-mono">
                  {formatRupiah(totalPengeluaran)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300">
                <div className="text-[11px] text-emerald-800 font-bold uppercase">Sisa Uang Tersedia</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-950 font-mono">
                  {formatRupiah(uangTersedia)}
                </div>
              </div>
            </div>
          </div>

          {/* Table Content Depending on Report Type */}
          {(reportType === 'usser_total' || reportType === 'admin_keseluruhan' || reportType === 'bendahara_kas') && (
            <div className="space-y-6">
              {/* Donasi Warga Summary */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700" />
                  A. Rekapitulasi Donasi Warga ({state.warga.length} Warga Terdaftar)
                </h5>
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-center w-10">No</th>
                        <th className="p-2">Nama Warga</th>
                        <th className="p-2 text-center">Jml Minggu Bayar</th>
                        <th className="p-2 text-right">Total Terbayar</th>
                        <th className="p-2 text-right">Sisa Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.warga.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                            Belum ada data warga yang diinput.
                          </td>
                        </tr>
                      ) : (
                        state.warga.map((w, idx) => {
                          const total = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
                          const paidWeeks = (w.mingguan || []).filter(m => m > 0).length;
                          const sisa = Math.max(0, state.targetPerOrang - total);
                          return (
                            <tr key={w.id} className="hover:bg-slate-50">
                              <td className="p-2 text-center font-medium">{idx + 1}</td>
                              <td className="p-2 font-semibold text-slate-900">
                                {w.nama} {w.rt ? <span className="text-xs text-slate-500 font-normal">({w.rt})</span> : ''}
                              </td>
                              <td className="p-2 text-center">{paidWeeks} / 15 Minggu</td>
                              <td className="p-2 text-right font-mono font-medium">{formatRupiah(total)}</td>
                              <td className="p-2 text-right font-mono text-slate-600">
                                {sisa === 0 ? <span className="font-bold text-emerald-700">LUNAS</span> : formatRupiah(sisa)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={3} className="p-2 text-right">Subtotal Donasi Warga:</td>
                        <td className="p-2 text-right font-mono text-indigo-950">{formatRupiah(totalDonasiWarga)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Donasi Suka Rela */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                  B. Daftar Donasi Suka Rela ({state.donasiSukarela.length} Donatur)
                </h5>
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-center w-10">No</th>
                        <th className="p-2">Nama Donatur</th>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Keterangan</th>
                        <th className="p-2 text-right">Jumlah Donasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.donasiSukarela.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                            Belum ada donasi suka rela yang masuk.
                          </td>
                        </tr>
                      ) : (
                        state.donasiSukarela.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-medium">{idx + 1}</td>
                            <td className="p-2 font-semibold text-slate-900">{s.nama}</td>
                            <td className="p-2 text-slate-600">{s.tanggal}</td>
                            <td className="p-2 text-slate-600">{s.keterangan || '-'}</td>
                            <td className="p-2 text-right font-mono font-medium text-slate-900">{formatRupiah(s.jumlah)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2 text-right">Subtotal Donasi Suka Rela:</td>
                        <td className="p-2 text-right font-mono text-purple-950">{formatRupiah(totalDonasiSukarela)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Pengeluaran Section */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-700" />
                  C. Rincian Pengeluaran Kas ({state.pengeluaran.length} Transaksi)
                </h5>
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <tr>
                        <th className="p-2 text-center w-10">No</th>
                        <th className="p-2">Keperluan / Keterangan</th>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Kategori</th>
                        <th className="p-2 text-right">Jumlah Uang Keluar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {state.pengeluaran.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                            Belum ada catatan pengeluaran kas.
                          </td>
                        </tr>
                      ) : (
                        state.pengeluaran.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-medium">{idx + 1}</td>
                            <td className="p-2 font-semibold text-slate-900">{p.keperluan}</td>
                            <td className="p-2 text-slate-600">{p.tanggal}</td>
                            <td className="p-2 text-slate-600">{p.kategori || 'Operasional'}</td>
                            <td className="p-2 text-right font-mono font-medium text-rose-700">{formatRupiah(p.jumlah)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="p-2 text-right">Total Pengeluaran:</td>
                        <td className="p-2 text-right font-mono text-rose-800">{formatRupiah(totalPengeluaran)}</td>
                      </tr>
                      <tr className="bg-emerald-50 text-emerald-950 font-extrabold border-t-2 border-emerald-400">
                        <td colSpan={4} className="p-2 text-right">SISA SALDO KAS TERSEDIA:</td>
                        <td className="p-2 text-right font-mono text-sm">{formatRupiah(uangTersedia)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Specific Tabulation Mingguan View */}
          {reportType === 'admin_mingguan' && (
            <div>
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 text-center">No</th>
                      <th className="p-1.5">Nama Warga</th>
                      {[...Array(15)].map((_, i) => (
                        <th key={i} className="p-1 text-center whitespace-nowrap">M{i + 1}</th>
                      ))}
                      <th className="p-1.5 text-right">Total</th>
                      <th className="p-1.5 text-right">Sisa Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {state.warga.length === 0 ? (
                      <tr>
                        <td colSpan={19} className="p-3 text-center text-slate-500 italic">
                          Belum ada data warga.
                        </td>
                      </tr>
                    ) : (
                      state.warga.map((w, idx) => {
                        const total = (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
                        const sisa = Math.max(0, state.targetPerOrang - total);
                        return (
                          <tr key={w.id} className="hover:bg-slate-50">
                            <td className="p-1 text-center">{idx + 1}</td>
                            <td className="p-1 font-semibold text-slate-900 whitespace-nowrap">{w.nama}</td>
                            {[...Array(15)].map((_, mIdx) => {
                              const val = w.mingguan?.[mIdx] || 0;
                              return (
                                <td key={mIdx} className="p-1 text-center font-mono">
                                  {val > 0 ? (val / 1000) + 'k' : '-'}
                                </td>
                              );
                            })}
                            <td className="p-1 text-right font-mono font-bold">{formatRupiah(total, false)}</td>
                            <td className="p-1 text-right font-mono text-slate-600">
                              {sisa === 0 ? 'LUNAS' : formatRupiah(sisa, false)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Signature Section */}
          <div className="mt-12 pt-6 border-t border-slate-300">
            <div className="text-right text-xs text-slate-700 mb-6 font-medium">
              Ditetapkan di: Serang (Kp Kedung Sapi)<br />
              Pada tanggal: {currentDateIndo}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              {/* Left Signatory */}
              <div>
                <div className="font-semibold text-slate-700 mb-1">Mengetahui & Menyerahkan:</div>
                <div className="font-bold text-slate-900 uppercase">{leftSignRole}</div>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan Resmi ]</span>
                </div>
                <div className="font-bold text-slate-900 underline text-sm tracking-wide">
                  ( {leftSignName} )
                </div>
                <div className="text-[11px] text-slate-600">Panitia Maulid Nabi PHBI</div>
              </div>

              {/* Right Signatory */}
              <div>
                <div className="font-semibold text-slate-700 mb-1">Mengesahkan:</div>
                <div className="font-bold text-slate-900 uppercase">{rightSignRole}</div>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan & Stempel PHBI ]</span>
                </div>
                <div className="font-bold text-slate-900 underline text-sm tracking-wide">
                  ( {rightSignName} )
                </div>
                <div className="text-[11px] text-slate-600">Ketua Panitia Maulid Nabi SAW</div>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-500 italic border-t border-dashed border-slate-300 pt-3">
              Catatan: Dokumen ini dicetak otomatis melalui Aplikasi Resmi Iuran Maulid Nabi PHBI Kp Kedung Sapi Desa Kp Baru Pamarayan. Sah dan berkekuatan hukum internal kepanitiaan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
