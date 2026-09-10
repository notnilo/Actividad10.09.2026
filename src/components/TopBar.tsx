import { useApp } from '@/context/AppContext';
import { formatCurrency, formatPercent } from '@/config/assets';
import type { AssetSymbol } from '@/types';
import { Bell, Search } from 'lucide-react';

export function TopBar() {
  const { user, getConsolidated } = useApp();
  const consolidated = getConsolidated();

  return (
    <header className="sticky top-0 z-40 glass border-b border-base-600/60 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-base-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 7v6h-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-slate-500">Total Portfolio Value</p>
            <p className="text-xl font-bold text-white font-mono">
              {formatCurrency(consolidated, 'USD', 2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-base-700/60 border border-base-600 text-slate-400 text-sm hover:border-base-500 transition-all">
            <Search className="w-4 h-4" />
            <span>Search assets...</span>
          </button>
          <button className="relative p-2.5 rounded-xl bg-base-700/60 border border-base-600 text-slate-400 hover:text-white transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-400" />
          </button>
          <div className="md:hidden text-right">
            <p className="text-[10px] text-slate-500">Portfolio</p>
            <p className="text-sm font-bold text-white font-mono">{formatCurrency(consolidated, 'USD', 0)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PriceTicker() {
  const { prices } = useApp();
  const symbols: AssetSymbol[] = ['BTC', 'ETH', 'EUR'];

  return (
    <div className="flex items-center gap-6 px-4 lg:px-8 py-3 border-b border-base-600/40 overflow-x-auto">
      {symbols.map((sym) => {
        const data = prices[sym];
        if (!data) return null;
        const isUp = data.changePercent24h >= 0;
        return (
          <div key={sym} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-semibold text-slate-400">{sym}/USD</span>
            <span className="text-sm font-mono font-semibold text-white">
              ${data.currentPrice.toFixed(sym === 'EUR' ? 4 : 2)}
            </span>
            <span className={`text-xs font-mono ${isUp ? 'text-gain' : 'text-loss'}`}>
              {formatPercent(data.changePercent24h)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
