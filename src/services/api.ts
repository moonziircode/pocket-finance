import type { 
  MetadataResponse, 
  Transaction, 
  PendingQueueItem 
} from '../types';

const STORAGE_KEYS = {
  METADATA: 'pf_metadata_cache',
  RECENT: 'pf_recent_cache',
  QUEUE: 'pf_offline_queue',
  LAST_SYNC: 'pf_last_sync'
};

// Generate UUID for idempotent requests
export function generateRequestId(): string {
  return 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// Format IDR currency
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

// Short IDR format for quick badges (e.g. 20rb, 1.5jt)
export function formatRupiahShort(amount: number): string {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    const rb = amount / 1000;
    return rb % 1 === 0 ? `${rb}rb` : `${rb.toFixed(0)}rb`;
  }
  return `${amount}`;
}

// Format relative or friendly date
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = d.toDateString() === today.toDateString();
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hari ini';
  if (isYesterday) return 'Kemarin';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// Local Storage helpers
export function getCachedMetadata(): MetadataResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedMetadata(data: MetadataResponse) {
  try {
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.error('Failed to cache metadata', e);
  }
}

export function getCachedRecent(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedRecent(data: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to cache recent', e);
  }
}

export function getOfflineQueue(): PendingQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: PendingQueueItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save queue', e);
  }
}

// Fetch Metadata
export async function fetchMetadata(force = false): Promise<MetadataResponse> {
  const cached = getCachedMetadata();
  if (cached && !force) {
    // Return cached immediately, refresh in background
    fetchMetadata(true).catch(() => {});
    return cached;
  }

  const res = await fetch('/api/metadata');
  if (!res.ok) throw new Error(`Gagal mengambil data metadata: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Respons metadata gagal');
  
  const rawData = json.data;
  
  // Normalize fields between Apps Script and Frontend
  const normalizedBudgets: BudgetSummaryItem[] = (rawData.budgetSummary || []).map((b: any) => ({
    group: b.group || '',
    category: b.category,
    budget: b.budget || 0,
    realization: b.actual !== undefined ? b.actual : (b.realization || 0),
    remaining: b.remaining || 0,
    percentage: (b.percentage || 0) <= 1 ? (b.percentage || 0) * 100 : b.percentage,
    status: b.indicator || b.status || '🟢 Aman',
    hasBudget: (b.budget || 0) > 0
  }));

  const normalizedData: MetadataResponse = {
    accounts: rawData.accounts || [],
    budgetedCategories: rawData.categories?.pengeluaran || rawData.budgetedCategories || [],
    allCategories: [
      ...(rawData.categories?.pengeluaran || []),
      ...(rawData.categories?.pemasukan || []),
      ...(rawData.categories?.transfer || [])
    ],
    quickExpenseTemplates: rawData.templates || rawData.quickExpenseTemplates || [],
    routineTransactions: rawData.routineTransactions || [],
    dashboard: {
      totalSaldo: rawData.dashboard?.totalSaldo ?? 0,
      totalPemasukan: rawData.dashboard?.pemasukanBulanIni ?? rawData.dashboard?.totalPemasukan ?? 0,
      totalPengeluaran: rawData.dashboard?.pengeluaranBulanIni ?? rawData.dashboard?.totalPengeluaran ?? 0,
      sisaBudget: rawData.dashboard?.sisaBudget ?? 0,
      estimasiSaldo: rawData.dashboard?.estimasiSaldoAkhir ?? rawData.dashboard?.estimasiSaldo ?? 0
    },
    budgets: normalizedBudgets
  };

  setCachedMetadata(normalizedData);
  return normalizedData;
}

// Fetch Recent Transactions
export async function fetchRecentTransactions(limit = 10, force = false): Promise<Transaction[]> {
  const cached = getCachedRecent();
  if (cached.length > 0 && !force) {
    fetchRecentTransactions(limit, true).catch(() => {});
    return cached;
  }

  const res = await fetch(`/api/recent?limit=${limit}`);
  if (!res.ok) throw new Error(`Gagal mengambil transaksi terbaru: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Respons riwayat gagal');

  const normalized: Transaction[] = (json.data || []).map((t: any) => ({
    id: t.id,
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description || t.note || '',
    account: t.account,
    amount: t.amount,
    month: t.month,
    year: t.year
  }));

  setCachedRecent(normalized);
  return normalized;
}

// Save Transaction
export async function saveTransaction(payload: {
  date?: string;
  type?: 'Pemasukan' | 'Pengeluaran' | 'Transfer';
  category: string;
  description: string;
  account: string;
  amount: number;
}): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  const requestId = generateRequestId();
  const txDate = payload.date || new Date().toISOString().split('T')[0];
  const txType = payload.type || 'Pengeluaran';

  const bodyData = {
    requestId,
    date: txDate,
    type: txType,
    category: payload.category,
    description: payload.description,
    account: payload.account,
    amount: payload.amount
  };

  // Optimistic update to cached recent
  const tempTx: Transaction = {
    id: 'SYNC-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    ...bodyData
  };

  const currentRecent = getCachedRecent();
  setCachedRecent([tempTx, ...currentRecent]);

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Gagal menyimpan ke server');
    }

    // Replace temp transaction with confirmed ID
    const updated = getCachedRecent().map(t => (t.id === tempTx.id ? json.data : t));
    setCachedRecent(updated);

    // Refresh metadata in background to update dashboard balance
    fetchMetadata(true).catch(() => {});

    return { success: true, data: json.data };
  } catch (err: any) {
    console.warn('Network error or server error, queued locally:', err);
    // Queue offline
    const queue = getOfflineQueue();
    const queueItem: PendingQueueItem = {
      id: tempTx.id,
      payload: bodyData,
      timestamp: Date.now(),
      status: 'pending',
      error: err.message
    };
    saveOfflineQueue([...queue, queueItem]);
    return { success: true, data: tempTx }; // Handled gracefully
  }
}

// Delete Transaction
export async function deleteTransaction(transactionId: string): Promise<boolean> {
  // Optimistic removal
  const currentRecent = getCachedRecent().filter(t => t.id !== transactionId);
  setCachedRecent(currentRecent);

  try {
    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Gagal menghapus');
    fetchMetadata(true).catch(() => {});
    return true;
  } catch (e) {
    console.error('Failed to delete transaction:', e);
    return false;
  }
}

// Process Offline Queue when back online
export async function processOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let processedCount = 0;
  const remainingQueue: PendingQueueItem[] = [];

  for (const item of queue) {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        processedCount++;
      } else {
        remainingQueue.push(item);
      }
    } catch {
      remainingQueue.push(item);
    }
  }

  saveOfflineQueue(remainingQueue);
  if (processedCount > 0) {
    fetchMetadata(true).catch(() => {});
    fetchRecentTransactions(10, true).catch(() => {});
  }
  return processedCount;
}
