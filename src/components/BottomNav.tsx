import React from 'react';
import { Home, PlusCircle, History, Settings } from 'lucide-react';

export type TabType = 'home' | 'input' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Beranda', icon: Home },
    { id: 'input' as TabType, label: 'Catat', icon: PlusCircle, highlight: true },
    { id: 'history' as TabType, label: 'Riwayat', icon: History },
    { id: 'settings' as TabType, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="relative -top-3 flex flex-col items-center group active:scale-95 transition-transform"
                aria-label={tab.label}
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 ring-4 ring-emerald-500/20' 
                    : 'bg-emerald-600 text-white shadow-emerald-600/30'
                }`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                isActive ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
