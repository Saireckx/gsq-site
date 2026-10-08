import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardTab } from './admin/DashboardTab';
import { ProductsTab } from './admin/ProductsTab';
import { CouponsTab } from './admin/CouponsTab';
import { OrdersTab } from './admin/OrdersTab';
import { ServerSettingsTab } from './admin/ServerSettingsTab';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  ShoppingBag, 
  Ticket, 
  History, 
  Settings, 
  Lock, 
  KeyRound, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api, getAuthToken } from '../lib/api';

type AdminTab = 'dashboard' | 'products' | 'coupons' | 'orders' | 'settings';

export const Admin: React.FC = () => {
  // Simple PIN protection (default PIN: 1234)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gsq_admin_auth') === 'true' || !!getAuthToken();
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPinError(false);

    try {
      const res = await api.login(pinInput);
      if (res && res.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('gsq_admin_auth', 'true');
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend offline fallback check
      if (pinInput === '1234' || pinInput === 'admin' || pinInput === 'gsq') {
        setIsAuthenticated(true);
        sessionStorage.setItem('gsq_admin_auth', 'true');
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setPinError(true);
  };

  const handleLogout = () => {
    api.logout().catch(() => {});
    setIsAuthenticated(false);
    sessionStorage.removeItem('gsq_admin_auth');
  };

  // If not logged in, show sleek login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#111726] border border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              GSQ Admin Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Панель управления сервером, товарами, промокодами и статистикой
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Введите PIN-код (по умолчанию: 1234)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0e17] border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:border-amber-400 focus:outline-none transition-colors text-center"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 mt-2">
                  Неверный PIN-код. Попробуйте 1234
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-md active:scale-95"
            >
              Войти в админку
            </button>
          </form>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-800/60 flex items-center justify-between">
            <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться на сайт</span>
            </Link>
            <span className="font-mono text-[11px] text-slate-500">PIN: 1234</span>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Товары', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'coupons', label: 'Купоны', icon: <Ticket className="w-4 h-4" /> },
    { id: 'orders', label: 'История продаж', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Настройки', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar matching Screenshot 1 Header */}
      <header className="sticky top-0 z-40 bg-[#0e1422]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Back Arrow + GSQ Brand */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 group text-white hover:text-amber-400 transition-colors"
            title="Вернуться на сайт"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xl font-black tracking-tight font-sans text-sky-400">GSQ</span>
          </Link>

          <div className="hidden sm:block h-5 w-[1px] bg-slate-800" />

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/store"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <span>Магазин</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1"
            title="Выйти из админки"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {activeTab === 'dashboard' && <DashboardTab onNavigateToTab={setActiveTab} />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'settings' && <ServerSettingsTab />}
      </main>
    </div>
  );
};
