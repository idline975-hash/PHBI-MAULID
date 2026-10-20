import { useState, useEffect } from 'react';

/**
 * Format number to Indonesian dot thousand separator (e.g. 10.000 or Rp 10.000)
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return withPrefix ? 'Rp 0' : '0';
  }
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withPrefix ? `Rp ${parts}` : parts;
}

/**
 * Format raw string input into thousands dot notation (e.g. "10000" -> "10.000")
 */
export function formatInputNumber(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  const cleanNumber = String(value).replace(/\D/g, '');
  if (!cleanNumber) return '';
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse string with dots or text into a raw number
 */
export function parseFormattedNumber(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = String(value).replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Returns formatted Indonesian date: "Hari, Tanggal Bulan Tahun"
 */
export function getRealtimeDateIndo(d: Date = new Date()): string {
  const hari = HARI[d.getDay()];
  const tgl = d.getDate();
  const bln = BULAN[d.getMonth()];
  const thn = d.getFullYear();
  return `${hari}, ${tgl} ${bln} ${thn}`;
}

/**
 * Returns formatted Indonesian date & time: "Hari, Tanggal Bulan Tahun, HH:MM:SS WIB"
 */
export function getRealtimeDateTimeIndo(d: Date = new Date()): string {
  const dateStr = getRealtimeDateIndo(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dateStr}, ${hh}:${mm}:${ss} WIB`;
}

/**
 * Hook for ticking real-time clock
 */
export function useRealtimeClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    date: now,
    dateOnly: getRealtimeDateIndo(now),
    dateTime: getRealtimeDateTimeIndo(now),
    timeOnly: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`,
  };
}
