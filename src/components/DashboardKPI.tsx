import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, PiggyBank, Scale } from 'lucide-react';
import { formatRupiah } from '../services/api';
import type { DashboardMetrics } from '../types';

interface DashboardKPIProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

export const DashboardKPI: React.FC<DashboardKPIProps> = ({ metrics, isLoading }) => {
  const [showBalance, setShowBalance] = useState<boolean>(() => {
    return localStorage.getItem('pf_show_balance') !== 'false';
  });

  const toggleShowBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem('pf_show_balance', String(next));
  };

  const totalSaldo = metrics?.totalSaldo ?? 0;
  const totalPemasukan = metrics?.totalPemasukan ?? 0;
  const totalPengeluaran = metrics?.totalPengeluaran ?? 0;
  const sisaBudget = metrics?.sisaBudget ?? 0;
  const estimasiSaldo = metrics?.estimasiSaldo ?? 0;

  return (
    <div className="space-y-2.5">
      {/* Main Total Saldo Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 border border-slate-700/60 p-4 shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium tracking-wide">Total Saldo Aktif</span>
            <button
              onClick={toggleShowBalance}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 active:scale-90 transition-transform"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
              aria-label="Toggle Saldo"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-2xl font-black tracking-tight text-white mb-3">
            {isLoading && !metrics ? (
              <div className="h-8 w-44 bg-slate-700/60 animate-pulse rounded-lg"></div>
            ) : showBalance ? (
              formatRupiah(totalSaldo)
            ) : (
              '••••••••••'
            )}
          </div>

          {/* Mini 2-col stats: Pemasukan & Pengeluaran */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Pemasukan</span>
                <span className="text-xs font-bold text-emerald-400">
                  {showBalance ? formatRupiah(totalPemasukan) : '••••••'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Pengeluaran</span>
                <span className="text-xs font-bold text-rose-400">
                  {showBalance ? formatRupiah(totalPengeluaran) : '••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sisa Budget & Estimasi Saldo Row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-2.5 flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[10px] text-slate-400 truncate">Sisa Budget Bulan Ini</span>
            <span className="text-xs font-bold text-amber-300 truncate block">
              {showBalance ? formatRupiah(sisaBudget) : '••••••'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-2.5 flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[10px] text-slate-400 truncate">Estimasi Akhir Bulan</span>
            <span className="text-xs font-bold text-cyan-300 truncate block">
              {showBalance ? formatRupiah(estimasiSaldo) : '••••••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
