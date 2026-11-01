import React, { useState } from 'react';
import { RecentTransactionsList } from '../components/RecentTransactionsList';
import { Search } from 'lucide-react';
import type { Transaction } from '../types';

interface HistoryPageProps {
  transactions: Transaction[];
  isLoading: boolean;
  onRepeatTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<boolean>;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  transactions,
  isLoading,
  onRepeatTransaction,
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.category?.toLowerCase().includes(q) ||
      tx.description?.toLowerCase().includes(q) ||
      tx.account?.toLowerCase().includes(q) ||
      tx.amount?.toString().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi (kategori, nama, akun)..."
          className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Transaction List */}
      <RecentTransactionsList
        transactions={filtered}
        onRepeat={onRepeatTransaction}
        onDelete={onDeleteTransaction}
        isLoading={isLoading}
      />
    </div>
  );
};
