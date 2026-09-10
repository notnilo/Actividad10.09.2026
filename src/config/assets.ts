import type { Asset, AssetSymbol } from '@/types';

export const COMMISSION_RATE = 0.005; // 0.5%

export const LOCAL_CURRENCY: AssetSymbol = 'USD';

export const ASSETS: Record<AssetSymbol, Asset> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    color: '#f7931a',
    icon: '₿',
    initialPrice: 67250,
    volatility: 0.0025,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    color: '#627eea',
    icon: 'Ξ',
    initialPrice: 3480,
    volatility: 0.003,
  },
  EUR: {
    symbol: 'EUR',
    name: 'Euro',
    category: 'fiat',
    color: '#3b82f6',
    icon: '€',
    initialPrice: 1.085,
    volatility: 0.0004,
  },
  USD: {
    symbol: 'USD',
    name: 'US Dollar',
    category: 'fiat',
    color: '#22c55e',
    icon: '$',
    initialPrice: 1,
    volatility: 0,
  },
};

export const ASSET_SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];

export const TRADEABLE_ASSETS = ASSET_SYMBOLS.filter((s) => s !== 'USD');
export const CRYPTO_ASSETS: AssetSymbol[] = ['BTC', 'ETH'];
export const FIAT_ASSETS: AssetSymbol[] = ['USD', 'EUR'];

export function formatCurrency(value: number, symbol: AssetSymbol = 'USD', decimals?: number): string {
  const asset = ASSETS[symbol];
  const dp = decimals ?? (asset.category === 'crypto' ? 6 : 2);
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
  return `${asset.icon}${formatter.format(value)}`;
}

export function formatPrice(value: number, symbol: AssetSymbol): string {
  if (symbol === 'USD') return `$${value.toFixed(2)}`;
  const asset = ASSETS[symbol];
  const dp = value < 1 ? 4 : value < 100 ? 2 : 2;
  return `${asset.icon}${value.toFixed(dp)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}
