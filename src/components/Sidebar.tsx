import { useApp } from '@/context/AppContext';
import type { Page } from '@/types';
import { LayoutDashboard, ArrowLeftRight, CandlestickChart, History, LogOut } from 'lucide-react';

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trade', label: 'Trade', icon: ArrowLeftRight },
  { id: 'markets', label: 'Markets', icon: CandlestickChart },
  { id: 'history', label: 'History', icon: History },
];

export function Sidebar() {
  const { currentPage, setPage, logout, user } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-base-800/80 border-r border-base-600/60 h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-base-600/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-base-900" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 7v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">NexusTrade</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Exchange Pro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-base-600/40'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <div className="card p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-loss hover:bg-loss/5 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { currentPage, setPage } = useApp();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-base-600/60">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                active ? 'text-brand-300' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
