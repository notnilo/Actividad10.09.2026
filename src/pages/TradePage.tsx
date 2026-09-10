import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ASSETS, ASSET_SYMBOLS, formatCurrency, formatNumber } from '@/config/assets';
import type { AssetSymbol } from '@/types';
import { ArrowDown, Check, AlertCircle, Zap } from 'lucide-react';

export function TradePage() {
  const { user, prices, trade } = useApp();
  const [fromAsset, setFromAsset] = useState<AssetSymbol>('USD');
  const [toAsset, setToAsset] = useState<AssetSymbol>('BTC');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);

  const fromWallet = user?.wallets.find((w) => w.asset === fromAsset);
  const balance = fromWallet?.balance ?? 0;

  const numericAmount = parseFloat(amount) || 0;

  const quote = useMemo(() => {
    if (!prices[fromAsset] || !prices[toAsset]) return null;
    const fromPrice = fromAsset === 'USD' ? 1 : prices[fromAsset].currentPrice;
    const toPrice = toAsset === 'USD' ? 1 : prices[toAsset].currentPrice;
    const usdValue = numericAmount * fromPrice;
    const commission = usdValue * 0.005;
    const netUsd = usdValue - commission;
    const amountTo = toPrice > 0 ? netUsd / toPrice : 0;
    return {
      amountTo,
      commission,
      rate: toPrice > 0 ? fromPrice / toPrice : 0,
      usdValue,
      insufficient: numericAmount > balance,
    };
  }, [fromAsset, toAsset, numericAmount, prices, balance]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [fromAsset, toAsset, amount]);

  const handleSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  const handleSetMax = () => {
    setAmount(balance.toString());
  };

  const handleExecute = () => {
    setError('');
    setSuccess('');
    if (numericAmount <= 0) {
      setError('Enter an amount to trade');
      return;
    }
    if (numericAmount > balance) {
      setError('Insufficient funds in your wallet');
      setFlash('red');
      setTimeout(() => setFlash(null), 600);
      return;
    }
    const result = trade(fromAsset, toAsset, numericAmount);
    if (result.success) {
      setSuccess(`Successfully traded ${formatNumber(numericAmount, fromAsset === 'BTC' ? 6 : 2)} ${fromAsset} for ${formatNumber(quote?.amountTo ?? 0, toAsset === 'BTC' ? 6 : 4)} ${toAsset}`);
      setAmount('');
      setFlash('green');
      setTimeout(() => setFlash(null), 600);
    } else {
      setError(result.error ?? 'Trade failed');
      setFlash('red');
      setTimeout(() => setFlash(null), 600);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Swap / Trade</h2>
        <p className="text-sm text-slate-500">Exchange between crypto and fiat assets instantly</p>
      </div>

      <div className={`card p-6 transition-all duration-300 ${flash === 'green' ? 'ring-2 ring-gain/40' : ''} ${flash === 'red' ? 'ring-2 ring-loss/40' : ''}`}>
        {/* From */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">You Pay</label>
            <button
              onClick={handleSetMax}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Balance: {formatNumber(balance, fromAsset === 'BTC' ? 6 : 2)} {fromAsset}
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field flex-1"
            />
            <AssetSelector value={fromAsset} onChange={setFromAsset} />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwap}
            className="w-10 h-10 rounded-xl bg-base-600 border border-base-500 flex items-center justify-center hover:bg-brand-500/20 hover:border-brand-500/50 transition-all duration-200 active:rotate-180"
          >
            <ArrowDown className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* To */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2 block">You Receive</label>
          <div className="flex gap-3">
            <div className="input-field flex-1 !text-gain-light flex items-center">
              {quote && quote.amountTo > 0
                ? formatNumber(quote.amountTo, toAsset === 'BTC' ? 6 : 4)
                : '0.00'}
            </div>
            <AssetSelector value={toAsset} onChange={setToAsset} />
          </div>
        </div>

        {/* Quote details */}
        {quote && numericAmount > 0 && (
          <div className="space-y-2 mb-4 p-4 bg-base-900/60 rounded-xl border border-base-600/40 animate-fade-in">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Exchange Rate</span>
              <span className="text-slate-300 font-mono">
                1 {fromAsset} = {formatNumber(quote.rate, toAsset === 'BTC' ? 6 : 4)} {toAsset}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Commission (0.5%)</span>
              <span className="text-slate-300 font-mono">{formatCurrency(quote.commission, 'USD', 2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total USD Value</span>
              <span className="text-slate-300 font-mono">{formatCurrency(quote.usdValue, 'USD', 2)}</span>
            </div>
            {quote.insufficient && (
              <div className="flex items-center gap-1.5 text-xs text-loss pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Insufficient {fromAsset} balance
              </div>
            )}
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-loss mb-4 p-3 bg-loss/10 rounded-xl animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-gain mb-4 p-3 bg-gain/10 rounded-xl animate-fade-in">
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Execute */}
        <button
          onClick={handleExecute}
          disabled={numericAmount <= 0 || (quote?.insufficient ?? false)}
          className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Execute Trade
        </button>
      </div>

      {/* Quick pairs */}
      <div className="mt-6">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Quick Pairs</p>
        <div className="flex flex-wrap gap-2">
          {[
            { f: 'USD', t: 'BTC' },
            { f: 'USD', t: 'ETH' },
            { f: 'BTC', t: 'USD' },
            { f: 'ETH', t: 'USD' },
            { f: 'EUR', t: 'BTC' },
            { f: 'BTC', t: 'ETH' },
          ].map((pair) => (
            <button
              key={`${pair.f}-${pair.t}`}
              onClick={() => {
                setFromAsset(pair.f as AssetSymbol);
                setToAsset(pair.t as AssetSymbol);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                fromAsset === pair.f && toAsset === pair.t
                  ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                  : 'border-base-600 text-slate-400 hover:border-base-500 hover:text-white'
              }`}
            >
              {pair.f} → {pair.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetSelector({ value, onChange }: { value: AssetSymbol; onChange: (v: AssetSymbol) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AssetSymbol)}
      className="bg-base-700 border border-base-600 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none focus:border-brand-500/60 cursor-pointer min-w-[110px]"
    >
      {ASSET_SYMBOLS.map((sym) => (
        <option key={sym} value={sym}>
          {ASSETS[sym].icon} {sym}
        </option>
      ))}
    </select>
  );
}
