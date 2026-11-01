import React from 'react';
import { Target } from 'lucide-react';
import { formatRupiah } from '../services/api';
import type { BudgetSummaryItem } from '../types';

interface BudgetProgressBarProps {
  budgets: BudgetSummaryItem[];
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ budgets }) => {
  // Only display categories that actually have a budget assigned (> 0)
  const activeBudgets = budgets.filter(b => b.hasBudget && b.budget > 0);

  if (activeBudgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Monitor Anggaran (Budget Aktif)</span>
        </div>
        <span className="text-[10px] text-slate-500">{activeBudgets.length} Kategori</span>
      </div>

      <div className="space-y-2">
        {activeBudgets.map((item) => {
          const pct = Math.min(Math.round(item.percentage), 100);
          
          let barColor = 'bg-emerald-500';
          let textColor = 'text-emerald-400';
          let statusLabel = '🟢 Aman';

          if (item.percentage >= 100) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-400';
            statusLabel = '🔴 Melebihi';
          } else if (item.percentage >= 80) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-400';
            statusLabel = '🟡 Waspada';
          }

          return (
            <div
              key={item.category}
              className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate pr-2">
                  {item.category}
                </span>
                <span className={`text-[10px] font-bold ${textColor}`}>
                  {statusLabel} ({item.percentage.toFixed(0)}%)
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Terpakai: {formatRupiah(item.realization)}</span>
                <span className="text-slate-300 font-medium">Budget: {formatRupiah(item.budget)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
