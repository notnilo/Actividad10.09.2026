import { AppProvider, useApp } from '@/context/AppContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Sidebar, MobileNav } from '@/components/Sidebar';
import { TopBar, PriceTicker } from '@/components/TopBar';
import { Dashboard } from '@/pages/Dashboard';
import { TradePage } from '@/pages/TradePage';
import { MarketsPage } from '@/pages/MarketsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { Loader2 } from 'lucide-react';

function MainContent() {
  const { user, currentPage, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-900">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex bg-base-900 grid-pattern">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <PriceTicker />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'trade' && <TradePage />}
          {currentPage === 'markets' && <MarketsPage />}
          {currentPage === 'history' && <HistoryPage />}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
