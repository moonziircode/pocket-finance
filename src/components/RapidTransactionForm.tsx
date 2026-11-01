import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Check, 
  Calendar, 
  FileText, 
  CreditCard, 
  Layers, 
  X, 
  Heart, 
  Gift, 
  HandCoins, 
  Wallet 
} from 'lucide-react';
import { formatRupiah } from '../services/api';
import type { 
  TransactionType, 
  Account, 
  SpecialModeType 
} from '../types';

interface RapidTransactionFormProps {
  accounts: Account[];
  budgetedCategories: string[];
  allCategories: string[];
  initialMode?: SpecialModeType;
  initialPreset?: any;
  onSubmit: (tx: {
    date: string;
    type: TransactionType;
    category: string;
    description: string;
    account: string;
    amount: number;
  }) => Promise<boolean>;
  onCancel?: () => void;
}

export const RapidTransactionForm: React.FC<RapidTransactionFormProps> = ({
  accounts,
  budgetedCategories,
  allCategories,
  initialMode = 'normal',
  initialPreset = null,
  onSubmit,
  onCancel
}) => {
  const [type, setType] = useState<TransactionType>('Pengeluaran');
  const [amountStr, setAmountStr] = useState<string>('20000');
  const [category, setCategory] = useState<string>('Makan dan minum');
  const [account, setAccount] = useState<string>('Seabank');
  const [description, setDescription] = useState<string>('Makan siang/malam');
  const [dateOption, setDateOption] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Active accounts only
  const activeAccounts = accounts.filter(a => a.status === 'Aktif' || !a.status);
  const accountList = activeAccounts.length > 0 ? activeAccounts.map(a => a.name) : [
    'Seabank', 'BCA', 'Mandiri', 'BRI', 'Cash', 'GoPay', 'OVO', 'ShopeePay', 'Audy Salsabilla'
  ];

  // Set initial state from mode or preset
  useEffect(() => {
    if (initialPreset) {
      setType('Pengeluaran');
      setAmountStr(String(initialPreset.amount || 20000));
      setCategory(initialPreset.category || 'Makan dan minum');
      setAccount(initialPreset.account || 'Seabank');
      setDescription(initialPreset.defaultDesc || initialPreset.name || '');
      return;
    }

    if (initialMode === 'titip_audy') {
      setType('Transfer');
      setCategory('Titip uang ke Audy');
      setAccount('Seabank');
      setDescription('Titip uang ke Audy Salsabilla');
      setAmountStr('100000');
    } else if (initialMode === 'tarik_audy') {
      setType('Transfer');
      setCategory('Tarik uang dari Audy');
      setAccount('Audy Salsabilla');
      setDescription('Tarik uang titipan dari Audy');
      setAmountStr('50000');
    } else if (initialMode === 'pinjamkan') {
      setType('Transfer');
      setCategory('Transfer lainnya');
      setAccount('Seabank');
      setDescription('Pinjamkan ke: ');
      setAmountStr('50000');
    } else if (initialMode === 'traktir') {
      setType('Pengeluaran');
      setCategory('Nongkrong');
      setAccount('Seabank');
      setDescription('Traktir: ');
      setAmountStr('50000');
    }
  }, [initialMode, initialPreset]);

  // Derived category choices depending on Transaction Type
  let categoryChoices: string[] = [];
  if (type === 'Pemasukan') {
    categoryChoices = ['Gaji dan Pemasukan', 'Bonus/Tunjangan', 'Pemasukan Lainnya', 'Hasil Investasi'];
  } else if (type === 'Transfer') {
    categoryChoices = ['Titip uang ke Audy', 'Tarik uang dari Audy', 'Pindah Saldo', 'Transfer lainnya'];
  } else {
    // Pengeluaran: Prioritize Budgeted categories (Request #6)
    if (!showAllCategories && budgetedCategories.length > 0) {
      categoryChoices = budgetedCategories;
    } else {
      categoryChoices = allCategories.length > 0 ? allCategories : [
        'Makan dan minum', 'Bensin', 'Parkir dan tol', 'Pulsa dan paket data', 
        'Nongkrong', 'Tabungan', 'Dana darurat', 'Belanja bahan makanan', 
        'Kebutuhan rumah', 'Streaming', 'Pakaian', 'Kesehatan'
      ];
    }
  }

  // Ensure current category is in category choices
  useEffect(() => {
    if (!categoryChoices.includes(category) && categoryChoices.length > 0) {
      setCategory(categoryChoices[0]);
    }
  }, [type, showAllCategories]);

  // Numeric amount
  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  // Amount modifiers
  const addAmount = (plus: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setAmountStr(String(numericAmount + plus));
  };

  const clearAmount = () => {
    setAmountStr('0');
  };

  // Date value
  const getDateValue = (): string => {
    if (dateOption === 'today') {
      return new Date().toISOString().split('T')[0];
    }
    if (dateOption === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    }
    return customDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || isSubmitting) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    setIsSubmitting(true);
    const finalDate = getDateValue();

    const ok = await onSubmit({
      date: finalDate,
      type,
      category,
      account,
      amount: numericAmount,
      description: description.trim() || category
    });

    setIsSubmitting(false);
    if (ok) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        // Reset or close
        if (onCancel) onCancel();
      }, 900);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-4 shadow-2xl">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          {initialMode === 'titip_audy' && <Heart className="w-4 h-4 text-rose-400" />}
          {initialMode === 'tarik_audy' && <Wallet className="w-4 h-4 text-indigo-400" />}
          {initialMode === 'pinjamkan' && <HandCoins className="w-4 h-4 text-amber-400" />}
          {initialMode === 'traktir' && <Gift className="w-4 h-4 text-purple-400" />}
          <span className="text-sm font-bold text-slate-100">
            {initialMode === 'titip_audy' ? 'Titip Uang ke Audy' :
             initialMode === 'tarik_audy' ? 'Tarik Uang dari Audy' :
             initialMode === 'pinjamkan' ? 'Pinjamkan Uang' :
             initialMode === 'traktir' ? 'Traktir Teman/Saudara' :
             'Catat Transaksi Cepat'}
          </span>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white active:scale-90"
            title="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Segmented Control */}
        <div className="grid grid-cols-3 gap-1 bg-slate-850 p-1 rounded-2xl border border-slate-800">
          {(['Pengeluaran', 'Pemasukan', 'Transfer'] as TransactionType[]).map((t) => {
            const isActive = type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 ${
                  isActive
                    ? t === 'Pengeluaran'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                      : t === 'Pemasukan'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'Pengeluaran' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {t === 'Pemasukan' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                {t === 'Transfer' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                <span>{t}</span>
              </button>
            );
          })}
        </div>

        {/* Large Amount Display & Keypad Chips */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 text-center space-y-2">
          <span className="block text-[11px] font-medium text-slate-500">Nominal Transaksi</span>
          <div className="text-3xl font-black text-white tracking-tight">
            {formatRupiah(numericAmount)}
          </div>

          {/* Quick amount adder buttons */}
          <div className="flex items-center justify-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => addAmount(2000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold active:scale-95"
            >
              +2rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(10000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold active:scale-95"
            >
              +10rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(20000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold active:scale-95"
            >
              +20rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(50000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold active:scale-95"
            >
              +50rb
            </button>
            <button
              type="button"
              onClick={() => addAmount(100000)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold active:scale-95"
            >
              +100rb
            </button>
            <button
              type="button"
              onClick={clearAmount}
              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 rounded-lg text-[11px] font-bold active:scale-95"
            >
              C
            </button>
          </div>
        </div>

        {/* Category Selector with Budget Filter (Request #6) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-slate-300 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Kategori</span>
            </span>

            {type === 'Pengeluaran' && (
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                {showAllCategories ? 'Tampilkan Budget Saja' : 'Semua Kategori'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryChoices.map((c) => {
              const isSelected = category === c;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-left p-2 rounded-xl border text-xs font-medium transition-all truncate active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 px-1 flex items-center space-x-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Akun Sumber / Pembayar</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {accountList.map((acc) => {
              const isSelected = account === acc;
              return (
                <button
                  type="button"
                  key={acc}
                  onClick={() => setAccount(acc)}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all truncate active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 ring-1 ring-indigo-500/30 font-bold'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {acc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 px-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDateOption('today')}
              className={`p-2 rounded-xl border text-xs font-medium ${
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
              className={`p-2 rounded-xl border text-xs font-medium ${
                dateOption === 'yesterday'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => setDateOption('custom')}
              className={`p-2 rounded-xl border text-xs font-medium ${
                dateOption === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-850 border-slate-800 text-slate-400'
              }`}
            >
              Lainnya
            </button>
          </div>

          {dateOption === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full mt-1.5 p-2 rounded-xl bg-slate-850 border border-slate-800 text-white text-xs"
            />
          )}
        </div>

        {/* Description / Keterangan */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 px-1 flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Keterangan (Catatan)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Kopi harian / Makan siang / Ud Djaya"
            className="w-full p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={numericAmount <= 0 || isSubmitting}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-98 ${
            submitSuccess
              ? 'bg-emerald-500 text-slate-950'
              : numericAmount <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:opacity-95 shadow-emerald-500/25'
          }`}
        >
          {submitSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Tersimpan ke Sheets!</span>
            </>
          ) : isSubmitting ? (
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              <span>Menyimpan Transaksi...</span>
            </div>
          ) : (
            <>
              <span>Simpan Transaksi ({formatRupiah(numericAmount)})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
