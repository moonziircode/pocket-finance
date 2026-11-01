import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, type TabType } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { InputPage } from './pages/InputPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuickExpenseConfirmModal } from './components/QuickExpenseConfirmModal';
import { 
  fetchMetadata, 
  fetchRecentTransactions, 
  saveTransaction, 
  deleteTransaction, 
  processOfflineQueue, 
  getOfflineQueue,
  clearOfflineQueue,
  formatRupiahShort
} from './services/api';
import type { 
  MetadataResponse, 
  Transaction, 
  SpecialModeType, 
  TransactionType 
} from './types';
import type { QuickPreset } from './components/QuickExpenseGrid';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  
  // Selected preset for confirmation modal (Revisi: Konfirmasi ulang sebelum simpan)
  const [selectedPresetForConfirm, setSelectedPresetForConfirm] = useState<QuickPreset | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState<boolean>(false);

  // Active special mode or preset being configured for full input page
  const [specialMode, setSpecialMode] = useState<SpecialModeType>('normal');
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet kembali aktif', 'info');
      syncData(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Mode offline aktif — data disimpan lokal', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load initial data & sync offline queue
  const syncData = useCallback(async (force = false) => {
    setIsSyncing(true);
    try {
      if (navigator.onLine) {
        const processed = await processOfflineQueue();
        if (processed > 0) {
          showToast(`${processed} transaksi berhasil disinkronkan ke Sheets!`, 'success');
        }
      }

      setPendingCount(getOfflineQueue().length);

      const [metaData, recentData] = await Promise.all([
        fetchMetadata(force),
        fetchRecentTransactions(15, force)
      ]);

      setMetadata(metaData);
      setRecentTransactions(recentData);
      setPendingCount(getOfflineQueue().length);
    } catch (err: any) {
      console.warn('Sync warning:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    syncData(false);
  }, [syncData]);

  // Handle manual queue sync or clear
  const handleSyncOrClearQueue = async () => {
    setIsSyncing(true);
    showToast('Menyinkronkan antrean transaksi...', 'info');
    const processed = await processOfflineQueue();
    if (processed > 0) {
      showToast(`${processed} transaksi berhasil masuk Sheets!`, 'success');
    } else {
      // If queue items failed due to old format, clear them
      clearOfflineQueue();
      showToast('Antrean berhasil dibersihkan', 'info');
    }
    setPendingCount(getOfflineQueue().length);
    syncData(true);
  };

  // Open confirmation modal on Quick Preset Click
  const handleSelectPreset = (preset: QuickPreset) => {
    setSelectedPresetForConfirm(preset);
  };

  // Confirm and save from the confirmation modal
  const handleConfirmQuickExpense = async (data: {
    amount: number;
    account: string;
    description: string;
    date: string;
    category: string;
    type: 'Pengeluaran';
  }) => {
    setIsConfirmSubmitting(true);
    showToast(`⚡ Menyimpan ${data.description} (Rp ${formatRupiahShort(data.amount)})...`, 'info');

    const result = await saveTransaction({
      date: data.date,
      type: 'Pengeluaran',
      category: data.category,
      account: data.account,
      amount: data.amount,
      description: data.description
    });

    setIsConfirmSubmitting(false);

    if (result.success) {
      showToast(`✅ ${data.description} Rp ${formatRupiahShort(data.amount)} tercatat di Sheets!`, 'success');
      setSelectedPresetForConfirm(null);
      setPendingCount(getOfflineQueue().length);
      // Immediate background refresh
      fetchRecentTransactions(15, true).then(setRecentTransactions).catch(() => {});
      fetchMetadata(true).then(setMetadata).catch(() => {});
    } else {
      showToast(`❌ Gagal menyimpan: ${result.error || 'Coba lagi'}`, 'error');
    }
  };

  // Handle Special Mode Selection
  const handleSelectSpecialMode = (mode: SpecialModeType) => {
    setActivePreset(null);
    setSpecialMode(mode);
    setActiveTab('input');
  };

  // Handle Repeat Transaction
  const handleRepeatTransaction = async (tx: Transaction) => {
    showToast(`⚡ Mengulangi ${tx.category || tx.type}...`, 'info');

    const result = await saveTransaction({
      date: new Date().toISOString().split('T')[0],
      type: tx.type,
      category: tx.category,
      account: tx.account,
      amount: tx.amount,
      description: tx.description
    });

    if (result.success) {
      showToast(`✅ ${tx.category || tx.type} Rp ${formatRupiahShort(tx.amount)} diulangi!`, 'success');
      fetchRecentTransactions(15, true).then(setRecentTransactions).catch(() => {});
      fetchMetadata(true).then(setMetadata).catch(() => {});
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    const success = await deleteTransaction(id);
    if (success) {
      showToast('Transaksi berhasil dihapus dari Sheets', 'info');
      setRecentTransactions(prev => prev.filter(t => t.id !== id));
      fetchMetadata(true).then(setMetadata).catch(() => {});
      return true;
    } else {
      showToast('Gagal menghapus transaksi', 'error');
      return false;
    }
  };

  // Handle Submit from Input Page
  const handleFormSubmit = async (txData: {
    date: string;
    type: TransactionType;
    category: string;
    description: string;
    account: string;
    amount: number;
  }): Promise<boolean> => {
    const result = await saveTransaction(txData);
    if (result.success) {
      showToast(`✅ ${txData.category} Rp ${formatRupiahShort(txData.amount)} tercatat di Sheets!`, 'success');
      setPendingCount(getOfflineQueue().length);
      fetchRecentTransactions(15, true).then(setRecentTransactions).catch(() => {});
      fetchMetadata(true).then(setMetadata).catch(() => {});
      // Return to home tab
      setTimeout(() => {
        setActiveTab('home');
        setSpecialMode('normal');
        setActivePreset(null);
      }, 500);
      return true;
    } else {
      showToast('Gagal menyimpan transaksi', 'error');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Fixed Header */}
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        onRefresh={() => syncData(true)}
        pendingCount={pendingCount}
        onSyncQueue={handleSyncOrClearQueue}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm transition-all duration-300">
          <div className={`p-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-semibold flex items-center justify-center space-x-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-900/30'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-900/30'
              : 'bg-slate-800/90 border-slate-700 text-slate-200'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3">
        {activeTab === 'home' && (
          <HomePage
            metadata={metadata}
            recentTransactions={recentTransactions}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
            onSelectSpecialMode={handleSelectSpecialMode}
            onRepeatTransaction={handleRepeatTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'input' && (
          <InputPage
            metadata={metadata}
            mode={specialMode}
            preset={activePreset}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setActiveTab('home');
              setSpecialMode('normal');
              setActivePreset(null);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            transactions={recentTransactions}
            isLoading={isLoading}
            onRepeatTransaction={handleRepeatTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            metadata={metadata}
            onRefreshAll={() => syncData(true)}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Quick Expense Confirmation Modal / Bottom Sheet */}
      {selectedPresetForConfirm && (
        <QuickExpenseConfirmModal
          preset={selectedPresetForConfirm}
          accounts={metadata?.accounts ?? []}
          onConfirm={handleConfirmQuickExpense}
          onClose={() => setSelectedPresetForConfirm(null)}
          isSubmitting={isConfirmSubmitting}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'input' && activeTab !== 'input') {
            setSpecialMode('normal');
            setActivePreset(null);
          }
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default App;
