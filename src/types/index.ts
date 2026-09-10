export type AssetSymbol = 'BTC' | 'ETH' | 'EUR' | 'USD';

export type AssetCategory = 'crypto' | 'fiat';

export type OrderSide = 'buy' | 'sell';

export type OrderStatus = 'completed' | 'failed';

export type Page = 'dashboard' | 'trade' | 'markets' | 'history';

export interface Asset {
  symbol: AssetSymbol;
  name: string;
  category: AssetCategory;
  color: string;
  icon: string;
  initialPrice: number;
  volatility: number;
}

export interface Wallet {
  asset: AssetSymbol;
  balance: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  localCurrency: AssetSymbol;
  wallets: Wallet[];
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  pairFrom: AssetSymbol;
  pairTo: AssetSymbol;
  side: OrderSide;
  amountFrom: number;
  amountTo: number;
  price: number;
  commission: number;
  commissionRate: number;
  status: OrderStatus;
  createdAt: string;
}

export interface PricePoint {
  time: number;
  price: number;
}

export interface PriceData {
  symbol: AssetSymbol;
  currentPrice: number;
  previousPrice: number;
  change24h: number;
  changePercent24h: number;
  history: PricePoint[];
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface TradeQuote {
  fromAsset: AssetSymbol;
  toAsset: AssetSymbol;
  amountFrom: number;
  amountTo: number;
  price: number;
  commission: number;
  commissionRate: number;
  total: number;
  sufficient: boolean;
}
