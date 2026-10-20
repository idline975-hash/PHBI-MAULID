import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(express.json());

interface PembayaranEntry {
  minggu: number;
  jumlah: number;
  tanggal: string;
  dicatatOleh: string;
}

interface WargaRecord {
  id: string;
  nama: string;
  rt?: string;
  mingguan: number[];
  createdAt: string;
  createdTimestamp: number;
  createdBy: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  riwayatPembayaran: PembayaranEntry[];
}

interface DonasiSukarelaRecord {
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

interface PengeluaranRecord {
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

interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'usser' | 'bendahara' | 'admin';
  userSubtype: 'Usser 1' | 'Usser 2' | 'Usser 3' | 'Bendahara' | 'Admin';
  password: string;
  createdAt: string;
}

interface AuditLogRecord {
  id: string;
  action: string;
  actor: string;
  role: string;
  targetType: 'warga' | 'sukarela' | 'pengeluaran' | 'target' | 'user' | 'system';
  detail: string;
  timestamp: number;
  tanggalStr: string;
}

interface AppDatabase {
  targetPerOrang: number;
  warga: WargaRecord[];
  donasiSukarela: DonasiSukarelaRecord[];
  pengeluaran: PengeluaranRecord[];
  users: UserAccount[];
  auditLogs: AuditLogRecord[];
  lastUpdated: number;
}

const DEFAULT_STATE: AppDatabase = {
  targetPerOrang: 150000,
  warga: [],
  donasiSukarela: [],
  pengeluaran: [],
  users: [
    {
      id: 'usr_admin',
      username: 'riyan',
      name: 'Riyan (Administrator)',
      role: 'admin',
      userSubtype: 'Admin',
      password: '123456',
      createdAt: '2026-10-20 00:00:00'
    },
    {
      id: 'usr_1',
      username: 'usser1',
      name: 'Usser 1 - RT 08',
      role: 'usser',
      userSubtype: 'Usser 1 - RT 08',
      password: '123',
      createdAt: '2026-10-20 00:00:00'
    },
    {
      id: 'usr_2',
      username: 'usser2',
      name: 'Usser 2 - RT 09',
      role: 'usser',
      userSubtype: 'Usser 2 - RT 09',
      password: '123',
      createdAt: '2026-10-20 00:00:00'
    },
    {
      id: 'usr_3',
      username: 'usser3',
      name: 'Usser 3 - RT 10',
      role: 'usser',
      userSubtype: 'Usser 3 - RT 10',
      password: '123',
      createdAt: '2026-10-20 00:00:00'
    },
    {
      id: 'usr_bendahara',
      username: 'bendahara',
      name: 'Bendahara PHBI',
      role: 'bendahara',
      userSubtype: 'Bendahara',
      password: '123',
      createdAt: '2026-10-20 00:00:00'
    }
  ],
  auditLogs: [
    {
      id: 'log_init',
      action: 'Sistem Diinisialisasi',
      actor: 'System',
      role: 'system',
      targetType: 'system',
      detail: 'Sistem Iuran Maulid Nabi PHBI Kp Kedung Sapi siap digunakan.',
      timestamp: Date.now(),
      tanggalStr: 'Selasa, 20 Oktober 2026, 00:00:00 WIB'
    }
  ],
  lastUpdated: Date.now()
};

// Ensure data folder and db file exist
function loadDatabase(): AppDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure admin 'riyan' is always present
      if (!parsed.users || !parsed.users.some((u: UserAccount) => u.username.toLowerCase() === 'riyan')) {
        parsed.users = [...(parsed.users || []), DEFAULT_STATE.users[0]];
      }

      // Upgrade existing usser 1, 2, 3 accounts to RT 08, RT 09, RT 10
      if (Array.isArray(parsed.users)) {
        parsed.users.forEach((u: any) => {
          if (u.username === 'usser1' || u.userSubtype === 'Usser 1') {
            u.name = 'Usser 1 - RT 08';
            u.userSubtype = 'Usser 1 - RT 08';
          } else if (u.username === 'usser2' || u.userSubtype === 'Usser 2') {
            u.name = 'Usser 2 - RT 09';
            u.userSubtype = 'Usser 2 - RT 09';
          } else if (u.username === 'usser3' || u.userSubtype === 'Usser 3') {
            u.name = 'Usser 3 - RT 10';
            u.userSubtype = 'Usser 3 - RT 10';
          }
        });
      }

      return { ...DEFAULT_STATE, ...parsed };
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
      return DEFAULT_STATE;
    }
  } catch (err) {
    console.error('Error loading database:', err);
    return DEFAULT_STATE;
  }
}

function saveDatabase(data: AppDatabase) {
  try {
    data.lastUpdated = Date.now();
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    notifyClients();
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// SSE Clients for real-time live synchronization
const sseClients: express.Response[] = [];

function notifyClients() {
  const payload = `data: ${JSON.stringify({ lastUpdated: db.lastUpdated })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Server Sent Events route
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', lastUpdated: db.lastUpdated })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// REST Endpoints
app.get('/api/state', (_req, res) => {
  res.json(db);
});

// Calculate total available funds
function calculateTotalTersedia(customDb: AppDatabase = db): number {
  const totalWarga = customDb.warga.reduce((sum, w) => {
    return sum + (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
  }, 0);
  const totalSukarela = customDb.donasiSukarela.reduce((sum, s) => sum + (s.jumlah || 0), 0);
  const totalPengeluaran = customDb.pengeluaran.reduce((sum, p) => sum + (p.jumlah || 0), 0);
  return totalWarga + totalSukarela - totalPengeluaran;
}

// 1. Warga (Donasi Warga / Rekapitulasi 15 Minggu)
app.post('/api/warga', (req, res) => {
  const { id, nama, rt, mingguan, actor, actionType, minggu, jumlah, tanggal } = req.body;
  if (!nama || !nama.trim()) {
    return res.status(400).json({ error: 'Nama warga wajib diisi!' });
  }

  const cleanName = nama.trim();
  const existingWargaIndex = db.warga.findIndex(
    w => w.nama.trim().toLowerCase() === cleanName.toLowerCase()
  );

  // If adding new or editing to an existing name of another record
  if (id) {
    // Editing existing record
    const targetIdx = db.warga.findIndex(w => w.id === id);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'Data warga tidak ditemukan!' });
    }
    // Check if new name is already used by another warga
    if (existingWargaIndex !== -1 && existingWargaIndex !== targetIdx) {
      return res.status(400).json({
        error: `Akses ditolak! Nama "${cleanName}" sudah terdaftar dalam sistem.`
      });
    }

    const current = db.warga[targetIdx];
    const oldName = current.nama;
    current.nama = cleanName;
    if (rt !== undefined) {
      current.rt = rt;
    }
    if (Array.isArray(mingguan)) {
      current.mingguan = mingguan;
    } else if (minggu && jumlah !== undefined) {
      const idx = minggu - 1;
      if (idx >= 0 && idx < 15) {
        current.mingguan[idx] = jumlah;
      }
    }

    const editTime: string = tanggal || new Date().toLocaleString('id-ID');
    const editActor: string = actor || 'User';
    current.lastEditedAt = editTime;
    current.lastEditedBy = editActor;

    if (minggu && jumlah !== undefined) {
      current.riwayatPembayaran.push({
        minggu,
        jumlah,
        tanggal: editTime,
        dicatatOleh: editActor
      });
    }

    // Add audit log
    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Edit Data Donasi Warga',
      actor: editActor,
      role: 'editor',
      targetType: 'warga',
      detail: `Merubah data warga "${oldName}" ${oldName !== cleanName ? `menjadi "${cleanName}"` : ''} - Mingguan updated.`,
      timestamp: Date.now(),
      tanggalStr: editTime
    });

    saveDatabase(db);
    return res.json({ success: true, data: current, state: db });
  } else {
    // Adding brand new warga
    if (existingWargaIndex !== -1) {
      return res.status(400).json({
        error: `Akses ditolak! Nama "${cleanName}" sudah terdaftar dalam data donasi warga!`
      });
    }

    const weeks = Array(15).fill(0);
    const riwayat: PembayaranEntry[] = [];
    const nowStr = tanggal || new Date().toLocaleString('id-ID');
    const createdBy = actor || 'User';

    if (minggu && jumlah) {
      const idx = minggu - 1;
      if (idx >= 0 && idx < 15) {
        weeks[idx] = jumlah;
        riwayat.push({
          minggu,
          jumlah,
          tanggal: nowStr,
          dicatatOleh: createdBy
        });
      }
    }

    const newWarga: WargaRecord = {
      id: 'warga_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      nama: cleanName,
      rt: rt ? String(rt).trim() : '',
      mingguan: weeks,
      createdAt: nowStr,
      createdTimestamp: Date.now(),
      createdBy,
      riwayatPembayaran: riwayat
    };

    db.warga.push(newWarga);

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Input Donasi Warga Baru',
      actor: createdBy,
      role: 'creator',
      targetType: 'warga',
      detail: `Mendaftarkan warga baru: "${cleanName}" ${minggu ? `Minggu ke-${minggu} Rp ${jumlah.toLocaleString('id-ID')}` : ''}`,
      timestamp: Date.now(),
      tanggalStr: nowStr
    });

    saveDatabase(db);
    return res.json({ success: true, data: newWarga, state: db });
  }
});

// Delete warga
app.post('/api/warga/delete', (req, res) => {
  const { id, actor } = req.body;
  const idx = db.warga.findIndex(w => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Data tidak ditemukan' });
  }
  const deleted = db.warga.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Hapus Data Warga',
    actor: actor || 'Admin',
    role: 'admin',
    targetType: 'warga',
    detail: `Menghapus warga: "${deleted.nama}" dari daftar iuran.`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, state: db });
});

// 2. Donasi Suka Rela
app.post('/api/donasi-sukarela', (req, res) => {
  const { id, nama, jumlah, keterangan, actor, tanggal } = req.body;
  if (!nama || !nama.trim()) {
    return res.status(400).json({ error: 'Nama donatur suka rela wajib diisi!' });
  }
  const cleanName = nama.trim();
  const existingIdx = db.donasiSukarela.findIndex(
    s => s.nama.trim().toLowerCase() === cleanName.toLowerCase()
  );

  const nowStr = tanggal || new Date().toLocaleString('id-ID');
  const userActor = actor || 'User';

  if (id) {
    // Edit
    const targetIdx = db.donasiSukarela.findIndex(s => s.id === id);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'Data donasi suka rela tidak ditemukan!' });
    }
    if (existingIdx !== -1 && existingIdx !== targetIdx) {
      return res.status(400).json({
        error: `Akses ditolak! Nama "${cleanName}" sudah terdaftar dalam donasi suka rela.`
      });
    }

    const current = db.donasiSukarela[targetIdx];
    const oldName = current.nama;
    current.nama = cleanName;
    current.jumlah = Number(jumlah) || 0;
    if (keterangan !== undefined) current.keterangan = keterangan;
    current.lastEditedAt = nowStr;
    current.lastEditedBy = userActor;

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Edit Donasi Suka Rela',
      actor: userActor,
      role: 'editor',
      targetType: 'sukarela',
      detail: `Merubah donasi suka rela "${oldName}": Rp ${current.jumlah.toLocaleString('id-ID')}`,
      timestamp: Date.now(),
      tanggalStr: nowStr
    });

    saveDatabase(db);
    return res.json({ success: true, data: current, state: db });
  } else {
    // New
    if (existingIdx !== -1) {
      return res.status(400).json({
        error: `Akses ditolak! Nama "${cleanName}" sudah terdaftar dalam donasi suka rela!`
      });
    }

    const newRecord: DonasiSukarelaRecord = {
      id: 'ds_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      nama: cleanName,
      jumlah: Number(jumlah) || 0,
      keterangan: keterangan || '',
      tanggal: nowStr,
      timestamp: Date.now(),
      createdBy: userActor
    };

    db.donasiSukarela.push(newRecord);

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Input Donasi Suka Rela',
      actor: userActor,
      role: 'creator',
      targetType: 'sukarela',
      detail: `Menerima donasi suka rela dari "${cleanName}" sejumlah Rp ${newRecord.jumlah.toLocaleString('id-ID')}`,
      timestamp: Date.now(),
      tanggalStr: nowStr
    });

    saveDatabase(db);
    return res.json({ success: true, data: newRecord, state: db });
  }
});

// Delete donasi sukarela
app.post('/api/donasi-sukarela/delete', (req, res) => {
  const { id, actor } = req.body;
  const idx = db.donasiSukarela.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Data tidak ditemukan' });
  }
  const deleted = db.donasiSukarela.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Hapus Donasi Suka Rela',
    actor: actor || 'Admin',
    role: 'admin',
    targetType: 'sukarela',
    detail: `Menghapus donasi suka rela: "${deleted.nama}" Rp ${deleted.jumlah.toLocaleString('id-ID')}`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, state: db });
});

// 3. Pengeluaran Bendahara
app.post('/api/pengeluaran', (req, res) => {
  const { id, keperluan, jumlah, kategori, actor, tanggal } = req.body;
  if (!keperluan || !keperluan.trim()) {
    return res.status(400).json({ error: 'Keperluan / Keterangan pengeluaran wajib diisi!' });
  }
  const nominal = Number(jumlah);
  if (isNaN(nominal) || nominal <= 0) {
    return res.status(400).json({ error: 'Jumlah pengeluaran harus lebih besar dari 0!' });
  }

  // Calculate gross income available
  const totalWarga = db.warga.reduce((sum, w) => {
    return sum + (w.mingguan || []).reduce((acc, m) => acc + (m || 0), 0);
  }, 0);
  const totalSukarela = db.donasiSukarela.reduce((sum, s) => sum + (s.jumlah || 0), 0);
  const totalPemasukan = totalWarga + totalSukarela;

  // Existing pengeluaran without this record
  const currentOtherPengeluaran = db.pengeluaran
    .filter(p => !id || p.id !== id)
    .reduce((sum, p) => sum + p.jumlah, 0);

  const uangTersediaSekarang = totalPemasukan - currentOtherPengeluaran;

  // Strict rule: "Jika pengeluaran melebihi uang tersedia maka Akses di tolak."
  if (nominal > uangTersediaSekarang) {
    return res.status(400).json({
      error: `Akses ditolak! Jumlah pengeluaran (Rp ${nominal.toLocaleString('id-ID')}) melebihi Uang Tersedia saat ini (Rp ${uangTersediaSekarang.toLocaleString('id-ID')}). Saldo kas tidak mencukupi!`
    });
  }

  const nowStr = tanggal || new Date().toLocaleString('id-ID');
  const userActor = actor || 'Bendahara';

  if (id) {
    // Edit pengeluaran
    const idx = db.pengeluaran.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Data pengeluaran tidak ditemukan!' });
    }
    const current = db.pengeluaran[idx];
    const oldKeperluan = current.keperluan;
    current.keperluan = keperluan.trim();
    current.jumlah = nominal;
    if (kategori) current.kategori = kategori;
    current.lastEditedAt = nowStr;
    current.lastEditedBy = userActor;

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Edit Pengeluaran Bendahara',
      actor: userActor,
      role: 'editor',
      targetType: 'pengeluaran',
      detail: `Merubah pengeluaran "${oldKeperluan}" menjadi Rp ${nominal.toLocaleString('id-ID')}`,
      timestamp: Date.now(),
      tanggalStr: nowStr
    });

    saveDatabase(db);
    return res.json({ success: true, data: current, state: db });
  } else {
    // New pengeluaran
    const newPengeluaran: PengeluaranRecord = {
      id: 'out_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      keperluan: keperluan.trim(),
      jumlah: nominal,
      kategori: kategori || 'Operasional Maulid',
      tanggal: nowStr,
      timestamp: Date.now(),
      dicatatOleh: userActor
    };

    db.pengeluaran.push(newPengeluaran);

    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'Input Pengeluaran Baru',
      actor: userActor,
      role: 'bendahara',
      targetType: 'pengeluaran',
      detail: `Mengeluarkan kas untuk: "${newPengeluaran.keperluan}" sebesar Rp ${nominal.toLocaleString('id-ID')}`,
      timestamp: Date.now(),
      tanggalStr: nowStr
    });

    saveDatabase(db);
    return res.json({ success: true, data: newPengeluaran, state: db });
  }
});

// Delete pengeluaran
app.post('/api/pengeluaran/delete', (req, res) => {
  const { id, actor } = req.body;
  const idx = db.pengeluaran.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Data tidak ditemukan' });
  }
  const deleted = db.pengeluaran.splice(idx, 1)[0];

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Hapus Pengeluaran',
    actor: actor || 'Admin',
    role: 'admin',
    targetType: 'pengeluaran',
    detail: `Menghapus pengeluaran: "${deleted.keperluan}" Rp ${deleted.jumlah.toLocaleString('id-ID')}`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, state: db });
});

// 4. Admin Target Setting
app.post('/api/target', (req, res) => {
  const { target, actor } = req.body;
  const targetNum = Number(target);
  if (isNaN(targetNum) || targetNum < 0) {
    return res.status(400).json({ error: 'Nilai target tidak valid!' });
  }
  const oldTarget = db.targetPerOrang;
  db.targetPerOrang = targetNum;

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Set Target Iuran Per Orang',
    actor: actor || 'Admin (riyan)',
    role: 'admin',
    targetType: 'target',
    detail: `Merubah target iuran per orang dari Rp ${oldTarget.toLocaleString('id-ID')} menjadi Rp ${targetNum.toLocaleString('id-ID')}`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, targetPerOrang: db.targetPerOrang, state: db });
});

// 5. User Account Management (Admin Buat Akun)
app.post('/api/users', (req, res) => {
  const { username, name, password, userSubtype, actor } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Nama, Username, dan Password wajib diisi!' });
  }
  const cleanUsername = username.trim().toLowerCase();
  if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: `Username "${cleanUsername}" sudah digunakan!` });
  }

  let role: 'usser' | 'bendahara' | 'admin' = 'usser';
  if (userSubtype === 'Bendahara') role = 'bendahara';
  else if (userSubtype === 'Admin') role = 'admin';

  const newUser: UserAccount = {
    id: 'usr_' + Date.now(),
    username: cleanUsername,
    name: name.trim(),
    role,
    userSubtype: userSubtype || 'Usser 1',
    password: password.trim(),
    createdAt: new Date().toLocaleString('id-ID')
  };

  db.users.push(newUser);

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Pembuatan Akun Baru',
    actor: actor || 'Admin (riyan)',
    role: 'admin',
    targetType: 'user',
    detail: `Membuat akun baru: "${newUser.name}" (${newUser.userSubtype}) username: ${newUser.username}`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, user: newUser, state: db });
});

app.post('/api/users/delete', (req, res) => {
  const { id, actor } = req.body;
  const target = db.users.find(u => u.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Akun tidak ditemukan' });
  }
  if (target.username.toLowerCase() === 'riyan') {
    return res.status(400).json({ error: 'Akun Administrator utama (riyan) tidak dapat dihapus!' });
  }

  db.users = db.users.filter(u => u.id !== id);

  db.auditLogs.unshift({
    id: 'log_' + Date.now(),
    action: 'Hapus Akun Pengguna',
    actor: actor || 'Admin (riyan)',
    role: 'admin',
    targetType: 'user',
    detail: `Menghapus akun: "${target.name}" (${target.username})`,
    timestamp: Date.now(),
    tanggalStr: new Date().toLocaleString('id-ID')
  });

  saveDatabase(db);
  res.json({ success: true, state: db });
});

// Vite Integration Setup
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Iuran Maulid Nabi PHBI running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
