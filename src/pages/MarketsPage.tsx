import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ASSETS, formatPercent, formatCompact, formatCurrency } from '@/config/assets';
import type { AssetSymbol } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CHART_ASSETS: AssetSymbol[] = ['BTC', 'ETH', 'EUR'];

type Timeframe = '1H' | '4H' | '24H';

export function MarketsPage() {
  const { prices, setPage } = useApp();
  const [selected, setSelected] = useState<AssetSymbol>('BTC');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');

  const data = prices[selected];
  const sliceCount = timeframe === '1H' ? 30 : timeframe === '4H' ? 80 : 120;
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.history.slice(-sliceCount).map((p) => ({
      time: new Date(p.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: p.price,
    }));
  }, [data, sliceCount]);

  if (!data) return null;

  const isUp = data.changePercent24h >= 0;
  const chartColor = isUp ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${selected}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Markets</h2>
          <p className="text-sm text-slate-500">Live price charts and market data</p>
        </div>
        <div className="flex gap-1 p-1 bg-base-800 rounded-xl border border-base-600/60">
          {(['1H', '4H', '24H'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Asset selector tabs */}
      <div className="flex gap-2 flex-wrap">
        {CHART_ASSETS.map((sym) => {
          const assetData = prices[sym];
          if (!assetData) return null;
          const active = selected === sym;
          const up = assetData.changePercent24h >= 0;
          return (
            <button
              key={sym}
              onClick={() => setSelected(sym)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                active
                  ? 'border-brand-500/40 bg-brand-500/10'
                  : 'border-base-600/60 bg-base-800/60 hover:border-base-500'
              }`}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold"
                style={{ backgroundColor: `${ASSETS[sym].color}15`, color: ASSETS[sym].color }}
              >
                {ASSETS[sym].icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{sym}/USD</p>
                <p className="text-xs font-mono text-slate-400">
                  ${assetData.currentPrice.toFixed(sym === 'EUR' ? 4 : 2)}
                </p>
              </div>
              <span className={`text-xs font-mono font-semibold ${up ? 'text-gain' : 'text-loss'}`}>
                {formatPercent(assetData.changePercent24h)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold text-white font-mono">
                ${data.currentPrice.toFixed(selected === 'EUR' ? 4 : 2)}
              </h3>
              <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-gain' : 'text-loss'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercent(data.changePercent24h)}
              </span>
            </div>
            <p className="text-xs text-slate-500">{ASSETS[selected].name} / US Dollar</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div>
              <p className="text-slate-500">24h High</p>
              <p className="text-white font-mono">${data.high24h.toFixed(selected === 'EUR' ? 4 : 2)}</p>
            </div>
            <div>
              <p className="text-slate-500">24h Low</p>
              <p className="text-white font-mono">${data.low24h.toFixed(selected === 'EUR' ? 4 : 2)}</p>
            </div>
            <div>
              <p className="text-slate-500">24h Volume</p>
              <p className="text-white font-mono">{formatCompact(data.volume24h)}</p>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2133" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#1a2133' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(v < 1 ? 4 : 0)}`}
                width={60}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111726',
                  border: '1px solid #2e3851',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#64748b' }}
                formatter={(value) => [`${Number(value).toFixed(selected === 'EUR' ? 4 : 2)}`, 'Price']}
              />
              <ReferenceLine
                y={data.previousPrice}
                stroke="#64748b"
                strokeDasharray="2 4"
                strokeOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market overview table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-base-600/60">
          <h3 className="text-sm font-semibold text-white">Market Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base-600/60">
                <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Asset</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3">Price</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden sm:table-cell">24h Change</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden md:table-cell">24h High</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden md:table-cell">24h Low</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3 hidden lg:table-cell">Volume</th>
                <th className="text-right text-xs text-slate-500 font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {CHART_ASSETS.map((sym) => {
                const d = prices[sym];
                if (!d) return null;
                const up = d.changePercent24h >= 0;
                return (
                  <tr key={sym} className="border-b border-base-600/40 hover:bg-base-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${ASSETS[sym].color}15`, color: ASSETS[sym].color }}
                        >
                          {ASSETS[sym].icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{sym}</p>
                          <p className="text-xs text-slate-500">{ASSETS[sym].name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-6 py-4 text-sm font-mono text-white">
                      ${d.currentPrice.toFixed(sym === 'EUR' ? 4 : 2)}
                    </td>
                    <td className={`text-right px-6 py-4 text-sm font-mono font-semibold hidden sm:table-cell ${up ? 'text-gain' : 'text-loss'}`}>
                      {formatPercent(d.changePercent24h)}
                    </td>
                    <td className="text-right px-6 py-4 text-sm font-mono text-slate-300 hidden md:table-cell">
                      ${d.high24h.toFixed(sym === 'EUR' ? 4 : 2)}
                    </td>
                    <td className="text-right px-6 py-4 text-sm font-mono text-slate-300 hidden md:table-cell">
                      ${d.low24h.toFixed(sym === 'EUR' ? 4 : 2)}
                    </td>
                    <td className="text-right px-6 py-4 text-sm font-mono text-slate-300 hidden lg:table-cell">
                      {formatCompact(d.volume24h)}
                    </td>
                    <td className="text-right px-6 py-4">
                      <button
                        onClick={() => setPage('trade')}
                        className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
