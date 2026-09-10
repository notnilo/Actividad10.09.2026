import { useApp } from '@/context/AppContext';
import { ASSETS, formatCurrency, formatPercent, formatCompact } from '@/config/assets';
import type { AssetSymbol, Wallet } from '@/types';
import { TrendingUp, TrendingDown, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Dashboard() {
  const { user, prices, setPage } = useApp();
  if (!user) return null;

  const consolidated = user.wallets.reduce((total, w: Wallet) => {
    const price = w.asset === 'USD' ? 1 : prices[w.asset]?.currentPrice ?? 0;
    return total + w.balance * price;
  }, 0);

  const cryptoWallets = user.wallets.filter((w) => ASSETS[w.asset].category === 'crypto');
  const fiatWallets = user.wallets.filter((w) => ASSETS[w.asset].category === 'fiat');

  const totalChange = user.wallets.reduce((sum, w) => {
    const data = prices[w.asset];
    if (!data || w.asset === 'USD') return sum;
    return sum + (data.changePercent24h / 100) * w.balance * (prices[w.asset]?.currentPrice ?? 0);
  }, 0);
  const totalChangePercent = consolidated > 0 ? (totalChange / consolidated) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-white font-mono">{formatCurrency(consolidated, 'USD', 2)}</h2>
              <span className={`flex items-center gap-1 text-sm font-semibold ${totalChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercent(totalChangePercent)}
              </span>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-gain" />
                24h Change: <span className={totalChange >= 0 ? 'text-gain font-mono' : 'text-loss font-mono'}>
                  {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange, 'USD', 2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setPage('trade')}
              className="btn-primary mt-6 !py-2.5 !text-sm"
            >
              Start Trading
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Wallet Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Total Wallets</span>
              <span className="text-sm font-mono text-white">{user.wallets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Crypto Assets</span>
              <span className="text-sm font-mono text-white">{cryptoWallets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Fiat Assets</span>
              <span className="text-sm font-mono text-white">{fiatWallets.length}</span>
            </div>
            <div className="h-px bg-base-600/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Commission Rate</span>
              <span className="text-sm font-mono text-brand-300">0.50%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Crypto Wallets</h3>
          <button onClick={() => setPage('trade')} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Trade →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cryptoWallets.map((wallet) => (
            <WalletCard key={wallet.asset} wallet={wallet} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Fiat Wallets</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiatWallets.map((wallet) => (
            <WalletCard key={wallet.asset} wallet={wallet} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  const { prices } = useApp();
  const asset = ASSETS[wallet.asset];
  const priceData = prices[wallet.asset];
  const usdPrice = wallet.asset === 'USD' ? 1 : priceData?.currentPrice ?? 0;
  const usdValue = wallet.balance * usdPrice;
  const changePercent = priceData?.changePercent24h ?? 0;
  const isUp = changePercent >= 0;

  return (
    <div className="card card-hover p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: `${asset.color}15`, color: asset.color }}
          >
            {asset.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{asset.name}</p>
            <p className="text-xs text-slate-500">{wallet.asset}</p>
          </div>
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${isUp ? 'text-gain' : 'text-loss'}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatPercent(changePercent)}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-slate-500">Balance</p>
        <p className="text-xl font-bold text-white font-mono">
          {wallet.balance.toFixed(wallet.asset === 'BTC' ? 6 : wallet.asset === 'ETH' ? 4 : 2)}{' '}
          <span className="text-sm text-slate-500 font-sans">{wallet.asset}</span>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-base-600/60 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500">USD Value</p>
          <p className="text-sm font-mono text-white">{formatCurrency(usdValue, 'USD', 2)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Price</p>
          <p className="text-sm font-mono text-slate-300">
            {wallet.asset === 'USD' ? '—' : `$${usdPrice.toFixed(usdPrice < 1 ? 4 : 2)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
