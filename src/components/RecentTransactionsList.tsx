import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { formatRupiah, formatFriendlyDate } from '../services/api';
import type { Transaction } from '../types';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onRepeat: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  onRepeat,
  onDelete,
  isLoading
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [repeatedId, setRepeatedId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type.toLowerCase() === filterType.toLowerCase();
  });

  const handleRepeatClick = (tx: Transaction) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setRepeatedId(tx.id);
    setTimeout(() => setRepeatedId(null), 1000);
    onRepeat(tx);
  };

  const handleDeleteClick = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-3">
      {/* Header and Filter chips */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-slate-300">Riwayat Terkini</h2>
        
        {/* Filter buttons */}
        <div className="flex items-center space-x-1">
          {['all', 'Pengeluaran', 'Pemasukan', 'Transfer'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                filterType === f
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && transactions.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-slate-800/40 animate-pulse"></div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-800/20 border border-slate-800/60">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-500" />
          <p className="text-xs text-slate-400">Belum ada transaksi pada kategori ini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx, idx) => {
            const isExpense = tx.type === 'Pengeluaran';
            const isIncome = tx.type === 'Pemasukan';

            const isRepeating = repeatedId === tx.id;
            const isConfirming = confirmDeleteId === tx.id;
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={`${tx.id}-${idx}`}
                className="relative p-3 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon and Details */}
                  <div className="flex items-center space-x-3 overflow-hidden pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isExpense
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : isExpense ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {tx.category || tx.type}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-700/60 text-slate-300 font-medium shrink-0">
                          {tx.account}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.description || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Nominal & Date */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black tracking-tight block ${
                        isIncome
                          ? 'text-emerald-400'
                          : isExpense
                          ? 'text-rose-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''} {formatRupiah(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formatFriendlyDate(tx.date)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Bar: Ulangi (Repeat) & Hapus (Delete) */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-700/40 text-[10px]">
                  <span className="text-slate-400 font-mono text-[9px]">{tx.id}</span>

                  <div className="flex items-center space-x-2">
                    {/* Ulangi button */}
                    <button
                      onClick={() => handleRepeatClick(tx)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
                        isRepeating
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-750 hover:bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Ulangi transaksi ini hari ini"
                    >
                      {isRepeating ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tercatat!</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Ulangi</span>
                        </>
                      )}
                    </button>

                    {/* Hapus button with confirmation */}
                    {isConfirming ? (
                      <div className="flex items-center space-x-1 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-lg">
                        <span className="text-rose-300 font-medium">Hapus?</span>
                        <button
                          onClick={() => handleDeleteClick(tx.id)}
                          disabled={isDeleting}
                          className="px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-500"
                        >
                          {isDeleting ? '...' : 'Ya'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1 py-0.5 text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg active:scale-95"
                        title="Hapus transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
