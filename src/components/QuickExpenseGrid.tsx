import React, { useState } from 'react';
import { Coffee, Utensils, Fuel, CircleParking, Wifi, Users, Check, Zap } from 'lucide-react';
import { formatRupiahShort } from '../services/api';

export interface QuickPreset {
  id: string;
  name: string;
  category: string;
  account: string;
  amount: number;
  icon: any;
  color: string;
  bgGradient: string;
  defaultDesc: string;
}

export const DEFAULT_PRESETS: QuickPreset[] = [
  {
    id: 'kopi',
    name: 'Kopi',
    category: 'Makan dan minum',
    account: 'Seabank',
    amount: 13000,
    icon: Coffee,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/10 to-amber-900/10 border-amber-500/30 hover:border-amber-400/50',
    defaultDesc: 'Kopi harian'
  },
  {
    id: 'makan',
    name: 'Makan',
    category: 'Makan dan minum',
    account: 'Seabank',
    amount: 20000,
    icon: Utensils,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/10 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/50',
    defaultDesc: 'Makan siang/malam'
  },
  {
    id: 'bensin',
    name: 'Bensin',
    category: 'Bensin',
    account: 'Seabank',
    amount: 20000,
    icon: Fuel,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/10 to-blue-900/10 border-blue-500/30 hover:border-blue-400/50',
    defaultDesc: 'Bensin motor/mobil'
  },
  {
    id: 'parkir',
    name: 'Parkir',
    category: 'Parkir dan tol',
    account: 'Seabank',
    amount: 2000,
    icon: CircleParking,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/10 to-yellow-900/10 border-yellow-500/30 hover:border-yellow-400/50',
    defaultDesc: 'Parkir motor'
  },
  {
    id: 'internet',
    name: 'Internet',
    category: 'Pulsa dan paket data',
    account: 'Seabank',
    amount: 85000,
    icon: Wifi,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/10 to-cyan-900/10 border-cyan-500/30 hover:border-cyan-400/50',
    defaultDesc: 'Paket data internet'
  },
  {
    id: 'nongkrong',
    name: 'Nongkrong',
    category: 'Nongkrong',
    account: 'Seabank',
    amount: 50000,
    icon: Users,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-purple-900/10 border-purple-500/30 hover:border-purple-400/50',
    defaultDesc: 'Nongkrong santai'
  }
];

interface QuickExpenseGridProps {
  onSelectPreset: (preset: QuickPreset, autoSubmit: boolean) => void;
  disabled?: boolean;
}

export const QuickExpenseGrid: React.FC<QuickExpenseGridProps> = ({
  onSelectPreset,
  disabled = false
}) => {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = (preset: QuickPreset) => {
    if (disabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setClickedId(preset.id);
    setTimeout(() => setClickedId(null), 1200);
    onSelectPreset(preset, true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Transaksi Cepat (1-Tap)</span>
        </div>
        <span className="text-[10px] text-slate-500">Klik langsung tersimpan</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DEFAULT_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isJustClicked = clickedId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => handleClick(preset)}
              disabled={disabled}
              className={`relative overflow-hidden flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 active:scale-95 text-left bg-gradient-to-b ${
                isJustClicked 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/40' 
                  : preset.bgGradient
              }`}
            >
              <div className="w-full flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded-xl bg-slate-800/80 ${preset.color}`}>
                  {isJustClicked ? (
                    <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  {preset.account}
                </span>
              </div>

              <div className="w-full">
                <span className="block text-xs font-bold text-slate-200 truncate">
                  {preset.name}
                </span>
                <span className="block text-[11px] font-extrabold text-emerald-400">
                  Rp {formatRupiahShort(preset.amount)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
