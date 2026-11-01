import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  pendingCount?: number;
  onSyncQueue?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isSyncing,
  onRefresh,
  pendingCount = 0,
  onSyncQueue
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 pt-3 pb-3 safe-top">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xs tracking-wider">PF</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-100 leading-tight">Pocket Finance</h1>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              {isOnline ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-medium text-emerald-400">Google Sheets Terhubung</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[11px] font-medium text-amber-400">Mode Offline</span>
                </>
              )}
              {pendingCount > 0 && (
                <button
                  onClick={onSyncQueue || onRefresh}
                  className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-medium transition-all active:scale-95 flex items-center space-x-1"
                  title="Klik untuk menyinkronkan antrean sekarang"
                >
                  <span>{pendingCount} antrean</span>
                  <span className="underline text-[9px]">sinkron</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 active:bg-slate-700/80 transition-all active:scale-95 disabled:opacity-50"
          title="Sinkronisasi Data"
          aria-label="Sinkronisasi Data"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
