import { useApp } from '@/context/AppContext';
import { ASSETS, formatCurrency, formatNumber } from '@/config/assets';
import type { Order } from '@/types';
import { CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { useState } from 'react';
import type { AssetSymbol } from '@/types';

export function HistoryPage() {
  const { orders } = useApp();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.side === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Order History</h2>
          <p className="text-sm text-slate-500">Your complete trading record</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-1 p-1 bg-base-800 rounded-xl border border-base-600/60">
            {(['all', 'buy', 'sell'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white font-mono">{orders.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 mb-1">Total Commission Paid</p>
          <p className="text-2xl font-bold text-white font-mono">
            {formatCurrency(orders.reduce((s, o) => s + o.commission, 0), 'USD', 2)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-white font-mono">
            {formatCurrency(orders.reduce((s, o) => s + o.amountFrom * (o.pairFrom === 'USD' ? 1 : o.price), 0), 'USD', 2)}
          </p>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-base-700 mb-4">
            <CheckCircle2 className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No orders yet</p>
          <p className="text-sm text-slate-600 mt-1">Your executed trades will appear here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base-600/60">
                  <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Pair</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-6 py-3 hidden sm:table-cell">Side</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-6 py-3">Amount</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden md:table-cell">Price</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden md:table-cell">Commission</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden lg:table-cell">Time</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: Order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const fromAsset = ASSETS[order.pairFrom as AssetSymbol];
  const toAsset = ASSETS[order.pairTo as AssetSymbol];
  const isBuy = order.side === 'buy';
  const time = new Date(order.createdAt);
  const timeStr = time.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <tr className="border-b border-base-600/40 hover:bg-base-700/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${fromAsset.color}15`, color: fromAsset.color }}
          >
            {fromAsset.icon}
          </div>
          <span className="text-sm font-semibold text-white">{order.pairFrom}</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${toAsset.color}15`, color: toAsset.color }}
          >
            {toAsset.icon}
          </div>
          <span className="text-sm font-semibold text-white">{order.pairTo}</span>
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
          isBuy ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
        }`}>
          {isBuy ? 'Buy' : 'Sell'}
        </span>
      </td>
      <td className="text-right px-6 py-4">
        <p className="text-sm font-mono text-white">
          {formatNumber(order.amountFrom, order.pairFrom === 'BTC' ? 6 : 2)} {order.pairFrom}
        </p>
        <p className="text-xs font-mono text-slate-500">
          {formatNumber(order.amountTo, order.pairTo === 'BTC' ? 6 : 4)} {order.pairTo}
        </p>
      </td>
      <td className="text-right px-6 py-4 text-sm font-mono text-slate-300 hidden md:table-cell">
        ${order.price.toFixed(order.pairTo === 'EUR' ? 4 : 2)}
      </td>
      <td className="text-right px-6 py-4 text-sm font-mono text-slate-400 hidden md:table-cell">
        {formatCurrency(order.commission, 'USD', 2)}
      </td>
      <td className="text-right px-6 py-4 text-xs text-slate-500 hidden lg:table-cell font-mono">
        {timeStr}
      </td>
      <td className="text-right px-6 py-4">
        <span className="inline-flex items-center gap-1 text-xs text-gain font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      </td>
    </tr>
  );
}
