export type UserRole = 'usser' | 'bendahara' | 'admin';

export type UserSubtype =
  | 'Usser 1 - RT 08'
  | 'Usser 2 - RT 09'
  | 'Usser 3 - RT 10'
  | 'Usser 1'
  | 'Usser 2'
  | 'Usser 3'
  | 'Bendahara'
  | 'Admin';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  userSubtype: UserSubtype;
  password: string;
  createdAt: string;
}

export interface PembayaranEntry {
  minggu: number; // 1 to 15
  jumlah: number;
  tanggal: string;
  dicatatOleh: string;
}

export interface WargaRecord {
  id: string;
  nama: string;
  rt?: string;
  mingguan: number[]; // 15 weeks: index 0 = minggu 1, ..., index 14 = minggu 15
  createdAt: string;
  createdTimestamp: number;
  createdBy: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  riwayatPembayaran: PembayaranEntry[];
}

export interface DonasiSukarelaRecord {
  id: string;
  nama: string;
  jumlah: number;
  tanggal: string;
  timestamp: number;
  keterangan?: string;
  createdBy: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
}

export interface PengeluaranRecord {
  id: string;
  keperluan: string;
  jumlah: number;
  kategori?: string;
  tanggal: string;
  timestamp: number;
  dicatatOleh: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actor: string;
  role: string;
  targetType: 'warga' | 'sukarela' | 'pengeluaran' | 'target' | 'user' | 'system';
  detail: string;
  timestamp: number;
  tanggalStr: string;
}

export interface AppState {
  targetPerOrang: number;
  warga: WargaRecord[];
  donasiSukarela: DonasiSukarelaRecord[];
  pengeluaran: PengeluaranRecord[];
  users: UserAccount[];
  auditLogs: AuditLogRecord[];
  lastUpdated: number;
}
