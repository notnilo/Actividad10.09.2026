import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User, Order, PriceData, AssetSymbol, Page } from '@/types';
import { createPriceEngine, type PriceEngine } from '@/services/priceEngine';
import {
  loginUser,
  logoutUser,
  loadUser,
  saveUser,
  executeTrade,
  getConsolidatedBalance,
} from '@/services/trading';

interface AppState {
  user: User | null;
  orders: Order[];
  prices: Record<AssetSymbol, PriceData>;
  currentPage: Page;
  isAuthLoading: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  setPage: (page: Page) => void;
  trade: (from: AssetSymbol, to: AssetSymbol, amount: number) => { success: boolean; error?: string };
  getConsolidated: () => number;
}

const AppContext = createContext<AppState | null>(null);

const ORDERS_KEY = 'nexustrade_orders';

function loadOrders(): Order[] {
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prices, setPrices] = useState<Record<AssetSymbol, PriceData>>({} as Record<AssetSymbol, PriceData>);
  const [currentPage, setPage] = useState<Page>('dashboard');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const engineRef = useRef<PriceEngine | null>(null);

  useEffect(() => {
    const existingUser = loadUser();
    if (existingUser) setUser(existingUser);
    setOrders(loadOrders());
    setIsAuthLoading(false);

    const engine = createPriceEngine();
    engineRef.current = engine;
    setPrices(engine.getAllPrices());
    engine.start();
    const unsubscribe = engine.subscribe((p) => setPrices(p));

    return () => {
      unsubscribe();
      engine.stop();
    };
  }, []);

  const login = useCallback((email: string, name: string) => {
    const { user: u } = loginUser(email, name);
    setUser(u);
    setPage('dashboard');
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setPage('dashboard');
  }, []);

  const trade = useCallback((from: AssetSymbol, to: AssetSymbol, amount: number): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const result = executeTrade(user, from, to, amount, prices);
    if ('error' in result) return { success: false, error: result.error };
    setUser(result.user);
    saveUser(result.user);
    const newOrders = [result.order, ...orders];
    setOrders(newOrders);
    saveOrders(newOrders);
    return { success: true };
  }, [user, prices, orders]);

  const getConsolidated = useCallback(() => {
    if (!user) return 0;
    return getConsolidatedBalance(user, prices);
  }, [user, prices]);

  return (
    <AppContext.Provider
      value={{
        user,
        orders,
        prices,
        currentPage,
        isAuthLoading,
        login,
        logout,
        setPage,
        trade,
        getConsolidated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
