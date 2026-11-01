import React from 'react';
import { DashboardKPI } from '../components/DashboardKPI';
import { QuickExpenseGrid } from '../components/QuickExpenseGrid';
import { SpecialModesBar } from '../components/SpecialModesBar';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import { RecentTransactionsList } from '../components/RecentTransactionsList';
import type { 
  MetadataResponse, 
  Transaction, 
  SpecialModeType 
} from '../types';
import type { QuickPreset } from '../components/QuickExpenseGrid';

interface HomePageProps {
  metadata: MetadataResponse | null;
  recentTransactions: Transaction[];
  isLoading: boolean;
  onSelectPreset: (preset: QuickPreset, autoSubmit: boolean) => void;
  onSelectSpecialMode: (mode: SpecialModeType) => void;
  onRepeatTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<boolean>;
  onNavigateHistory: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  metadata,
  recentTransactions,
  isLoading,
  onSelectPreset,
  onSelectSpecialMode,
  onRepeatTransaction,
  onDeleteTransaction,
  onNavigateHistory
}) => {
  return (
    <div className="space-y-5 pb-24">
      {/* KPI Cards */}
      <DashboardKPI metrics={metadata?.dashboard ?? null} isLoading={isLoading} />

      {/* 1-Tap Quick Expense Grid */}
      <QuickExpenseGrid onSelectPreset={onSelectPreset} />

      {/* Special Modes (Audy / Pinjamkan / Traktir) */}
      <SpecialModesBar onSelectMode={onSelectSpecialMode} />

      {/* Budget Progress Bars */}
      {metadata?.budgets && <BudgetProgressBar budgets={metadata.budgets} />}

      {/* Recent Transactions List (Top 5) */}
      <div className="space-y-2">
        <RecentTransactionsList
          transactions={recentTransactions.slice(0, 5)}
          onRepeat={onRepeatTransaction}
          onDelete={onDeleteTransaction}
          isLoading={isLoading}
        />

        {recentTransactions.length > 5 && (
          <button
            onClick={onNavigateHistory}
            className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-700/60 transition-all active:scale-98"
          >
            Lihat Semua Transaksi ({recentTransactions.length}) →
          </button>
        )}
      </div>
    </div>
  );
};
