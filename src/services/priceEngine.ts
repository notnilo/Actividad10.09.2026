import type { AssetSymbol, PriceData, PricePoint } from '@/types';
import { ASSETS } from '@/config/assets';

const HISTORY_LENGTH = 120;
const TICK_INTERVAL_MS = 2000;

function generateInitialHistory(symbol: AssetSymbol): PricePoint[] {
  const asset = ASSETS[symbol];
  const now = Date.now();
  const points: PricePoint[] = [];
  let price = asset.initialPrice;

  for (let i = HISTORY_LENGTH; i > 0; i--) {
    const drift = (Math.random() - 0.5) * 2 * asset.volatility * price;
    const trend = Math.sin(i / 18) * asset.volatility * price * 0.5;
    price = Math.max(price + drift + trend, asset.initialPrice * 0.5);
    points.push({
      time: now - i * TICK_INTERVAL_MS,
      price: roundPrice(price, symbol),
    });
  }
  return points;
}

function roundPrice(price: number, symbol: AssetSymbol): number {
  if (symbol === 'USD') return 1;
  if (price < 1) return Math.round(price * 10000) / 10000;
  if (price < 100) return Math.round(price * 100) / 100;
  return Math.round(price * 100) / 100;
}

function tickPrice(symbol: AssetSymbol, lastPrice: number): number {
  if (symbol === 'USD') return 1;
  const asset = ASSETS[symbol];
  const drift = (Math.random() - 0.5) * 2 * asset.volatility * lastPrice;
  const meanReversion = (asset.initialPrice - lastPrice) * 0.002;
  const newPrice = lastPrice + drift + meanReversion;
  return roundPrice(newPrice, symbol);
}

export interface PriceEngine {
  getAllPrices: () => Record<AssetSymbol, PriceData>;
  getPrice: (symbol: AssetSymbol) => PriceData;
  subscribe: (cb: (prices: Record<AssetSymbol, PriceData>) => void) => () => void;
  start: () => void;
  stop: () => void;
}

export function createPriceEngine(): PriceEngine {
  const prices: Record<AssetSymbol, PriceData> = {} as Record<AssetSymbol, PriceData>;
  const subscribers = new Set<(p: Record<AssetSymbol, PriceData>) => void>();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  for (const symbol of Object.keys(ASSETS) as AssetSymbol[]) {
    const history = generateInitialHistory(symbol);
    const currentPrice = history[history.length - 1].price;
    const firstPrice = history[0].price;
    const change24h = currentPrice - firstPrice;
    const changePercent24h = (change24h / firstPrice) * 100;
    const high24h = Math.max(...history.map((h) => h.price));
    const low24h = Math.min(...history.map((h) => h.price));

    prices[symbol] = {
      symbol,
      currentPrice,
      previousPrice: currentPrice,
      change24h,
      changePercent24h,
      history,
      high24h,
      low24h,
      volume24h: Math.random() * 50000000 + 10000000,
    };
  }

  function tick() {
    for (const symbol of Object.keys(ASSETS) as AssetSymbol[]) {
      if (symbol === 'USD') continue;
      const data = prices[symbol];
      const newPrice = tickPrice(symbol, data.currentPrice);
      const newHistory = [...data.history.slice(1), { time: Date.now(), price: newPrice }];
      const firstPrice = newHistory[0].price;
      const change24h = newPrice - firstPrice;
      const changePercent24h = (change24h / firstPrice) * 100;

      prices[symbol] = {
        ...data,
        previousPrice: data.currentPrice,
        currentPrice: newPrice,
        history: newHistory,
        change24h,
        changePercent24h,
        high24h: Math.max(...newHistory.map((h) => h.price)),
        low24h: Math.min(...newHistory.map((h) => h.price)),
      };
    }
    subscribers.forEach((cb) => cb({ ...prices }));
  }

  return {
    getAllPrices: () => prices,
    getPrice: (symbol) => prices[symbol],
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    start: () => {
      if (intervalId) return;
      intervalId = setInterval(tick, TICK_INTERVAL_MS);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
