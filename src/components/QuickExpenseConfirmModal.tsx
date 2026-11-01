import React, { useState } from 'react';
import { X, Check, Calendar, CreditCard, FileText } from 'lucide-react';
import { formatRupiah } from '../services/api';
import type { QuickPreset } from './QuickExpenseGrid';
import type { Account } from '../types';

interface QuickExpenseConfirmModalProps {
  preset: QuickPreset | null;
  accounts: Account[];
  onConfirm: (data: {
    amount: number;
    account: string;
    description: string;
    date: string;
    category: string;
    type: 'Pengeluaran';
  }) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const QuickExpenseConfirmModal: React.FC<QuickExpenseConfirmModalProps> = ({
  preset,
  accounts,
  onConfirm,
  onClose,
  isSubmitting = false
}) => {
  if (!preset) return null;

  const [amountStr, setAmountStr] = useState<string>(String(preset.amount));
  const [account, setAccount] = useState<string>(preset.account || 'Seabank');
  const [description, setDescription] = useState<string>(preset.defaultDesc || preset.name);
  const [dateOption, setDateOption] = useState<'today' | 'yesterday'>('today');

  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  const addAmount = (plus: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setAmountStr(String(numericAmount + plus));
  };

  const clearAmount = () => {
    setAmountStr('0');
  };

  const activeAccounts = accounts.filter(a => a.status === 'Aktif' || !a.status);
  const accountList = activeAccounts.length > 0 ? activeAccounts.map(a => a.name) : [
    'Seabank', 'BCA', 'Mandiri', 'BRI', 'Cash', 'GoPay', 'OVO', 'ShopeePay'
  ];

  const handleConfirm = async () => {
    if (numericAmount <= 0 || isSubmitting) return;

    const txDate = dateOption === 'today'
      ? new Date().toISOString().split('T')[0]
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d.toISOString().split('T')[0];
        })();

    await onConfirm({
      amount: numericAmount,
      account,
      description: description.trim() || preset.name,
      date: txDate,
      category: preset.category,
      type: 'Pengeluaran'
    });
  };

  const Icon = preset.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-750 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl bg-slate-800 ${preset.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Konfirmasi {preset.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {preset.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Periksa atau sesuaikan sebelum disimpan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 active:scale-90"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nominal Section */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
          <span className="block text-[11px] font-medium text-slate-400">Nominal Transaksi (Bisa Diubah)</span>
          
          <div className="flex items-center justify-center">
            <span className="text-2xl font-black text-white mr-1">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setAmountStr(val || '0');
              }}
              placeholder="0"
              className="text-2xl font-black text-emerald-400 bg-transparent text-center focus:outline-none w-44 border-b border-emerald-500/40 pb-0.5"
            />
          </div>

          {/* Quick amount buttons */}
          <div className="flex items-center justify-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => addAmount(2000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold active:scale-95"
            >
              +2rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(5000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold active:scale-95"
            >
              +5rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(10000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold active:scale-95"
            >
              +10rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(20000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold active:scale-95"
            >
              +20rb
            </button>
            <button
              type="button"
              onClick={clearAmount}
              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold active:scale-95"
            >
              C
            </button>
          </div>
        </div>

        {/* Akun Sumber */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Rekening / Akun Pembayar</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto">
            {accountList.map((acc) => {
              const isSelected = account === acc;
              return (
                <button
                  type="button"
                  key={acc}
                  onClick={() => setAccount(acc)}
                  className={`p-2 rounded-xl border text-xs font-medium truncate transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold ring-1 ring-emerald-500/30'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {acc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keterangan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Keterangan (Opsional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Kopi pagi / Bensin Shell"
            className="w-full p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tanggal */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDateOption('today')}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                dateOption === 'today'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={() => setDateOption('yesterday')}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                dateOption === 'yesterday'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}
            >
              Kemarin
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-300 active:scale-95 transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={numericAmount <= 0 || isSubmitting}
            className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Konfirmasi ({formatRupiah(numericAmount)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
