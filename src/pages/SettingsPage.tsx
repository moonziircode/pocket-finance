import React from 'react';
import { 
  Building2, 
  Smartphone, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import { formatRupiah } from '../services/api';
import type { MetadataResponse } from '../types';

interface SettingsPageProps {
  metadata: MetadataResponse | null;
  onRefreshAll: () => void;
  isSyncing: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  metadata,
  onRefreshAll,
  isSyncing
}) => {
  const accounts = metadata?.accounts ?? [];

  return (
    <div className="space-y-5 pb-24">
      {/* PWA iPhone 13 Instructions */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-850 to-slate-900 border border-indigo-500/30 space-y-2.5">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Pasang di iPhone 13</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Agar Pocket Finance terasa seperti aplikasi native tanpa bar browser:
        </p>
        <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside">
          <li>Buka link aplikasi ini di <strong className="text-slate-200">Safari iOS</strong>.</li>
          <li>Ketuk tombol <strong className="text-slate-200">Share</strong> (ikon kotak tanda panah ke atas) di bagian bawah.</li>
          <li>Pilih <strong className="text-slate-200">"Add to Home Screen"</strong> (Tambah ke Layar Utama).</li>
          <li>Ketuk <strong className="text-slate-200">Add</strong>. Buka langsung dari Home Screen!</li>
        </ol>
      </div>

      {/* Daftar Akun Aktif */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Daftar Akun Keuangan</span>
          </div>
          <span className="text-[10px] text-slate-500">{accounts.length} Akun</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {accounts.map((acc) => (
            <div
              key={acc.name}
              className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 truncate pr-1">
                  {acc.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300 font-medium shrink-0">
                  {acc.type}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                {acc.initialBalance > 0 ? formatRupiah(acc.initialBalance) : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheets Integration Info */}
      <div className="p-4 rounded-3xl bg-slate-800/40 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-slate-200">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold">Koneksi Google Sheets</h2>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Semua transaksi langsung tercatat secara real-time ke spreadsheet <strong className="text-slate-300">"Smart Personal Finance Tracker"</strong> pada worksheet <strong className="text-slate-300">"RIWAYAT TRANSAKSI"</strong>.
        </p>
        <a
          href="https://docs.google.com/spreadsheets/d/1CuoUON-2rPn_ypnco2pqgwxWOxk4WhRQi5tWd3oA3tg/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 w-full py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-emerald-400 border border-emerald-500/20 active:scale-98 transition-all"
        >
          <span>Buka Google Sheets Langsung</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Reset Cache & Sync Action */}
      <div className="space-y-2">
        <button
          onClick={onRefreshAll}
          disabled={isSyncing}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 flex items-center justify-center space-x-2 border border-slate-700/80 active:scale-98 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Ulang Semua Data'}</span>
        </button>

        <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Pocket Finance v1.0.0 • Enkripsi End-to-End dengan Token Apps Script</span>
        </div>
      </div>
    </div>
  );
};
