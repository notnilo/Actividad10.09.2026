import type { User, Wallet, Order, TradeQuote, AssetSymbol, OrderSide } from '@/types';
import { ASSETS, COMMISSION_RATE } from '@/config/assets';

const STORAGE_KEY = 'nexustrade_user';
const TOKEN_KEY = 'nexustrade_token';

export function generateToken(userId: string): string {
  const payload = { userId, iat: Date.now(), exp: Date.now() + 86400000 };
  return btoa(JSON.stringify(payload));
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

function createDefaultWallets(): Wallet[] {
  return [
    { asset: 'USD', balance: 50000 },
    { asset: 'EUR', balance: 5000 },
    { asset: 'BTC', balance: 0.25 },
    { asset: 'ETH', balance: 4.5 },
  ];
}

export function createUser(email: string, name: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    localCurrency: 'USD',
    wallets: createDefaultWallets(),
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  return user;
}

export function loadUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loginUser(email: string, name: string): { user: User; token: string } {
  let user = loadUser();
  if (!user || user.email !== email) {
    user = createUser(email, name);
  }
  const token = generateToken(user.id);
  localStorage.setItem(TOKEN_KEY, token);
  return { user, token };
}

export function logoutUser(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return verifyToken(token) !== null;
}

export function getWalletBalance(user: User, asset: AssetSymbol): number {
  const wallet = user.wallets.find((w) => w.asset === asset);
  return wallet ? wallet.balance : 0;
}

export function getConsolidatedBalance(
  user: User,
  prices: Record<AssetSymbol, { currentPrice: number }>,
): number {
  return user.wallets.reduce((total, wallet) => {
    const priceData = prices[wallet.asset];
    const usdValue = wallet.asset === 'USD' ? 1 : priceData?.currentPrice ?? 0;
    return total + wallet.balance * usdValue;
  }, 0);
}

export function computeQuote(
  fromAsset: AssetSymbol,
  toAsset: AssetSymbol,
  amountFrom: number,
  prices: Record<AssetSymbol, { currentPrice: number }>,
): TradeQuote {
  const fromPrice = fromAsset === 'USD' ? 1 : prices[fromAsset]?.currentPrice ?? 0;
  const toPrice = toAsset === 'USD' ? 1 : prices[toAsset]?.currentPrice ?? 0;

  const usdValue = amountFrom * fromPrice;
  const commission = usdValue * COMMISSION_RATE;
  const netUsd = usdValue - commission;
  const amountTo = toPrice > 0 ? netUsd / toPrice : 0;
  const sufficient = amountFrom > 0;

  return {
    fromAsset,
    toAsset,
    amountFrom,
    amountTo,
    price: toPrice > 0 ? fromPrice / toPrice : 0,
    commission,
    commissionRate: COMMISSION_RATE,
    total: amountTo,
    sufficient,
  };
}

export function executeTrade(
  user: User,
  fromAsset: AssetSymbol,
  toAsset: AssetSymbol,
  amountFrom: number,
  prices: Record<AssetSymbol, { currentPrice: number }>,
): { user: User; order: Order } | { error: string } {
  if (amountFrom <= 0) return { error: 'Amount must be greater than zero' };

  const fromWallet = user.wallets.find((w) => w.asset === fromAsset);
  if (!fromWallet) return { error: 'Source wallet not found' };
  if (fromWallet.balance < amountFrom) return { error: 'Insufficient funds' };

  const quote = computeQuote(fromAsset, toAsset, amountFrom, prices);
  if (quote.amountTo <= 0) return { error: 'Invalid trade amount' };

  const fromPrice = fromAsset === 'USD' ? 1 : prices[fromAsset].currentPrice;
  const toPrice = toAsset === 'USD' ? 1 : prices[toAsset].currentPrice;
  const executionPrice = toPrice > 0 ? fromPrice / toPrice : 0;

  const side: OrderSide = toAsset === 'USD' || (ASSETS[toAsset].category === 'fiat' && ASSETS[fromAsset].category === 'crypto')
    ? 'sell'
    : 'buy';

  const order: Order = {
    id: crypto.randomUUID(),
    userId: user.id,
    pairFrom: fromAsset,
    pairTo: toAsset,
    side,
    amountFrom,
    amountTo: quote.amountTo,
    price: executionPrice,
    commission: quote.commission,
    commissionRate: COMMISSION_RATE,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  const updatedWallets = user.wallets.map((w) => {
    if (w.asset === fromAsset) return { ...w, balance: w.balance - amountFrom };
    if (w.asset === toAsset) return { ...w, balance: w.balance + quote.amountTo };
    return w;
  });

  const updatedUser: User = { ...user, wallets: updatedWallets };
  saveUser(updatedUser);

  return { user: updatedUser, order };
}
