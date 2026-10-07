import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CubeIcon } from '../../components/admin/CubeIcon';
import { Copy, RefreshCw, ArrowRight, PlusCircle, Check, HelpCircle } from 'lucide-react';

interface DashboardTabProps {
  onNavigateToTab: (tab: 'dashboard' | 'products' | 'coupons' | 'orders' | 'settings') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigateToTab }) => {
  const { orders, isTestMode, setIsTestMode, generateMockSale, getAnalytics } = useStore();
  const analytics = getAnalytics();
  const [copiedKey, setCopiedKey] = React.useState(false);

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Subheader Toolbar matching Screenshot 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        {/* Test Mode Switcher */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isTestMode}
              onChange={(e) => setIsTestMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-3 text-sm font-medium text-slate-200 flex items-center gap-1.5">
              <span>Тестовый режим</span>
              <span className="cursor-help text-slate-500 hover:text-slate-300" title="В тестовом режиме можно генерировать покупки и тестировать платежи без списания реальных денег">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </span>
          </label>

          {isTestMode && (
            <button
              onClick={generateMockSale}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Сгенерировать покупку</span>
            </button>
          )}
        </div>

        {/* Right side key indicator & refresh button matching Screenshot 1 */}
        <div className="flex items-center gap-3 text-xs">
          <div
            onClick={handleCopyKey}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141b2a] border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Кликните, чтобы скопировать токен API"
          >
            <span className="text-slate-500">🔑</span>
            <span className="tracking-widest font-mono text-[10px]">●●●●●●●●●●●●●●●</span>
            {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg bg-[#141b2a] hover:bg-[#1a2337] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Обновить данные"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards with gold accent line matching Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Продажи */}
        <div className="relative rounded-2xl bg-[#131a29] border border-slate-800/80 p-5 overflow-hidden flex flex-col justify-between min-h-[140px] shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200 text-sm">Продажи</span>
              <span className="font-mono text-slate-400">{analytics.salesWeek}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
              <span>за сегодня</span>
              <span>за неделю</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span>{analytics.salesToday}</span>
              <span className="text-slate-500 text-xl font-normal">=</span>
            </div>
          </div>
          {/* Gold bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
        </div>

        {/* Metric 2: Доход */}
        <div className="relative rounded-2xl bg-[#131a29] border border-slate-800/80 p-5 overflow-hidden flex flex-col justify-between min-h-[140px] shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200 text-sm">Доход</span>
              <span className="font-mono text-slate-400">{analytics.revenueWeek} ₽</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
              <span>за сегодня</span>
              <span>за неделю</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span>{analytics.revenueToday} ₽</span>
              <span className="text-slate-500 text-xl font-normal">=</span>
            </div>
          </div>
          {/* Gold bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
        </div>

        {/* Metric 3: Средний чек */}
        <div className="relative rounded-2xl bg-[#131a29] border border-slate-800/80 p-5 overflow-hidden flex flex-col justify-between min-h-[140px] shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-200 text-sm">Средний чек</span>
              <span className="font-mono text-slate-400">{analytics.avgCheckWeek} ₽</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
              <span>за сегодня</span>
              <span>за неделю</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span>{analytics.avgCheckToday} ₽</span>
              <span className="text-slate-500 text-xl font-normal">=</span>
            </div>
          </div>
          {/* Gold bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
        </div>
      </div>

      {/* Bottom Row: Посещаемость + Последние покупки matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Посещаемость */}
        <div className="lg:col-span-4 rounded-2xl bg-[#131a29] border border-slate-800/80 p-5 flex flex-col justify-between overflow-hidden shadow-lg relative min-h-[220px]">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200 text-sm">Посещаемость</span>
              <span className="font-mono text-slate-300 font-semibold">{analytics.visitsWeek}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
              <span>за сегодня</span>
              <span>за неделю</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-white font-mono">{analytics.visitsToday}</span>
              <span className="text-xs font-semibold text-rose-500">-2</span>
            </div>
          </div>

          {/* Smooth wavy red/coral SVG chart matching Screenshot 1 */}
          <div className="w-full h-24 -mb-2 overflow-hidden">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Filled area below curve */}
              <path
                d="M 0,85 C 40,80 50,45 80,60 C 110,75 130,95 160,50 C 190,15 210,65 240,40 C 270,25 285,55 300,75 L 300,100 L 0,100 Z"
                fill="url(#waveGradient)"
              />
              {/* Curve line */}
              <path
                d="M 0,85 C 40,80 50,45 80,60 C 110,75 130,95 160,50 C 190,15 210,65 240,40 C 270,25 285,55 300,75"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Right: Последние покупки matching Screenshot 1 */}
        <div className="lg:col-span-8 rounded-2xl bg-[#131a29] border border-slate-800/80 p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-200 text-sm">Последние покупки</span>
                <span className="text-xs text-slate-500">Всего: {orders.length}</span>
              </div>
              <button
                onClick={() => onNavigateToTab('orders')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 uppercase tracking-wider"
              >
                <span>БОЛЬШЕ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of recent purchases (2 columns grid matching Screenshot 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0e1422] border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <CubeIcon color={order.iconColor} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-200 truncate font-mono">
                        {order.nickname}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono flex-shrink-0">
                        +{order.amount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="truncate">{order.productName}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/40 mt-4">
            <span>Данные обновляются в реальном времени при каждой покупке на сайте</span>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-slate-400 hover:text-white underline transition-colors"
            >
              Вся история заказов ({orders.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
