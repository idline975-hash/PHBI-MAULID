import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  UserAccount,
  UserSubtype,
  WargaRecord,
  DonasiSukarelaRecord,
  PengeluaranRecord,
  AuditLogRecord
} from '../types';
import { getRealtimeDateTimeIndo } from '../utils/format';

interface AppContextType {
  state: AppState;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  setError: (err: string | null) => void;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
  
  // Computed values
  totalDonasiWarga: number;
  totalDonasiSukarela: number;
  totalUangMasuk: number;
  totalPengeluaran: number;
  uangTersedia: number; // Kas Saldo Sisa
  
  // Actions
  refreshState: () => Promise<void>;
  saveWarga: (params: {
    id?: string;
    nama: string;
    rt?: string;
    mingguan?: number[];
    minggu?: number;
    jumlah?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteWarga: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveDonasiSukarela: (params: {
    id?: string;
    nama: string;
    jumlah: number;
    keterangan?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteDonasiSukarela: (id: string) => Promise<{ success: boolean; error?: string }>;
  savePengeluaran: (params: {
    id?: string;
    keperluan: string;
    jumlah: number;
    kategori?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deletePengeluaran: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateTarget: (target: number) => Promise<{ success: boolean; error?: string }>;
  createUser: (userData: {
    username: string;
    name: string;
    password: string;
    userSubtype: UserSubtype;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const defaultState: AppState = {
  targetPerOrang: 150000,
  warga: [],
  donasiSukarela: [],
  pengeluaran: [],
  users: [],
  auditLogs: [],
  lastUpdated: Date.now()
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('iuran_phbi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto clear notifications
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  // Persist user session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('iuran_phbi_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('iuran_phbi_user');
    }
  }, [currentUser]);

  // Fetch full state from server
  const refreshState = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/state');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setState(data);
          setLastSyncTime(new Date());
        } catch {
          // ignore non-json responses
        }
      }
    } catch (err) {
      console.warn('Sync state connection error:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []);

  // Initialize and connect SSE for real-time live synchronization
  useEffect(() => {
    refreshState();

    // SSE connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.lastUpdated) {
            refreshState();
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };
      eventSource.onerror = () => {
        // Fallback polling will handle it
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
    }

    // Secondary polling every 3 seconds to guarantee 100% sync reliability
    const interval = setInterval(() => {
      refreshState();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [refreshState]);

  // Calculations
  const totalDonasiWarga = useMemo(() => {
    return state.warga.reduce((sum, w) => {
      const rowSum = (w.mingguan || []).reduce((acc, m) => acc + (Number(m) || 0), 0);
      return sum + rowSum;
    }, 0);
  }, [state.warga]);

  const totalDonasiSukarela = useMemo(() => {
    return state.donasiSukarela.reduce((sum, s) => sum + (Number(s.jumlah) || 0), 0);
  }, [state.donasiSukarela]);

  const totalUangMasuk = totalDonasiWarga + totalDonasiSukarela;

  const totalPengeluaran = useMemo(() => {
    return state.pengeluaran.reduce((sum, p) => sum + (Number(p.jumlah) || 0), 0);
  }, [state.pengeluaran]);

  const uangTersedia = totalUangMasuk - totalPengeluaran;

  const getActorName = () => {
    if (!currentUser) return 'Usser';
    return `${currentUser.userSubtype || currentUser.name} (${currentUser.name})`;
  };

  // Helper to safely parse JSON responses and avoid Unexpected token HTML errors
  const safeParseJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text && text.trim().startsWith('<') ? 'Kesalahan Server (HTML 404/500). Silakan muat ulang halaman.' : (text || 'Gagal memproses respons server.') };
    }
  };

  // Actions
  const saveWarga = async (params: {
    id?: string;
    nama: string;
    rt?: string;
    mingguan?: number[];
    minggu?: number;
    jumlah?: number;
  }) => {
    try {
      setError(null);
      const res = await fetch('/api/warga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          actor: getActorName(),
          tanggal: getRealtimeDateTimeIndo()
        })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan data donasi warga');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage(params.id ? 'Perubahan data warga berhasil disimpan!' : 'Data donasi warga berhasil ditambahkan!');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan jaringan saat menyimpan warga';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deleteWarga = async (id: string) => {
    try {
      setError(null);
      const res = await fetch('/api/warga/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menghapus data warga');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage('Data warga berhasil dihapus.');
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus');
      return { success: false, error: err.message };
    }
  };

  const saveDonasiSukarela = async (params: {
    id?: string;
    nama: string;
    jumlah: number;
    keterangan?: string;
  }) => {
    try {
      setError(null);
      const res = await fetch('/api/donasi-sukarela', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          actor: getActorName(),
          tanggal: getRealtimeDateTimeIndo()
        })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan donasi suka rela');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage(params.id ? 'Perubahan donasi suka rela berhasil disimpan!' : 'Donasi suka rela berhasil dicatat!');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Gagal menghubungi server';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deleteDonasiSukarela = async (id: string) => {
    try {
      setError(null);
      const res = await fetch('/api/donasi-sukarela/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menghapus');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage('Data donasi suka rela berhasil dihapus.');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const savePengeluaran = async (params: {
    id?: string;
    keperluan: string;
    jumlah: number;
    kategori?: string;
  }) => {
    try {
      setError(null);
      const res = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          actor: getActorName(),
          tanggal: getRealtimeDateTimeIndo()
        })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan pengeluaran');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage(params.id ? 'Perubahan pengeluaran berhasil disimpan!' : 'Pengeluaran kas bendahara berhasil dicatat!');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Gagal menghubungi server';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deletePengeluaran = async (id: string) => {
    try {
      setError(null);
      const res = await fetch('/api/pengeluaran/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menghapus');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage('Pengeluaran berhasil dihapus.');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateTarget = async (target: number) => {
    try {
      setError(null);
      const res = await fetch('/api/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal mengubah target iuran');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage(`Target iuran berhasil diperbarui: Rp ${target.toLocaleString('id-ID')}`);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const createUser = async (userData: {
    username: string;
    name: string;
    password: string;
    userSubtype: UserSubtype;
  }) => {
    try {
      setError(null);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal membuat akun');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage(`Akun baru (${userData.userSubtype} - ${userData.name}) berhasil dibuat!`);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actor: getActorName() })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error || 'Gagal menghapus akun');
        return { success: false, error: data.error };
      }
      setState(data.state);
      setSuccessMessage('Akun pengguna berhasil dihapus.');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        setCurrentUser,
        isLoading,
        isSyncing,
        lastSyncTime,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        totalDonasiWarga,
        totalDonasiSukarela,
        totalUangMasuk,
        totalPengeluaran,
        uangTersedia,
        refreshState,
        saveWarga,
        deleteWarga,
        saveDonasiSukarela,
        deleteDonasiSukarela,
        savePengeluaran,
        deletePengeluaran,
        updateTarget,
        createUser,
        deleteUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
