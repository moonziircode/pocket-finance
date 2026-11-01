import React from 'react';
import { Heart, Wallet, HandCoins, Gift } from 'lucide-react';
import type { SpecialModeType } from '../types';

interface SpecialModesBarProps {
  onSelectMode: (mode: SpecialModeType) => void;
  activeMode?: SpecialModeType;
}

export const SpecialModesBar: React.FC<SpecialModesBarProps> = ({
  onSelectMode,
  activeMode = 'normal'
}) => {
  const modes = [
    {
      id: 'titip_audy' as SpecialModeType,
      label: 'Titip ke Audy',
      icon: Heart,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30 hover:border-rose-400',
      activeBg: 'bg-rose-600 text-white border-rose-500'
    },
    {
      id: 'tarik_audy' as SpecialModeType,
      label: 'Tarik dari Audy',
      icon: Wallet,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400',
      activeBg: 'bg-indigo-600 text-white border-indigo-500'
    },
    {
      id: 'pinjamkan' as SpecialModeType,
      label: 'Pinjamkan',
      icon: HandCoins,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400',
      activeBg: 'bg-amber-600 text-white border-amber-500'
    },
    {
      id: 'traktir' as SpecialModeType,
      label: 'Traktir',
      icon: Gift,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400',
      activeBg: 'bg-purple-600 text-white border-purple-500'
    }
  ];

  return (
    <div className="space-y-1.5">
      <span className="block px-1 text-[11px] font-semibold text-slate-400">
        Mode Khusus (Titip / Pinjam / Traktir)
      </span>
      <div className="grid grid-cols-4 gap-1.5">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all active:scale-95 ${
                isActive ? m.activeBg : `${m.bgColor} text-slate-200`
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : m.color}`} />
              <span className="text-[10px] font-medium leading-tight">
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
