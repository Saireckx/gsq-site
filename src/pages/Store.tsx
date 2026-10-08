import React, { useState } from 'react';
import { useStore, ProductItem } from '../context/StoreContext';
import { CheckoutModal, CheckoutItem } from '../components/CheckoutModal';
import { HatBoxModal } from '../components/HatBoxModal';
import { Crown, Check, RotateCcw, MessageSquare, Heart, Sparkles, Clock, Package, ShoppingBag } from 'lucide-react';

export const Store: React.FC = () => {
  const { products, orders } = useStore();
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(6);

  // Subscriptions (SUB and SUB+ only)
  const subscriptionProducts = products.filter(
    (p) => !p.hidden && (p.id === 'sub' || p.id === 'sub-plus')
  );

  // Additional services (strictly unban, unmute, donate - no duplicates, no sword, no crate)
  const additionalProducts = products.filter(
    (p) =>
      !p.hidden &&
      p.id !== 'sub' &&
      p.id !== 'sub-plus' &&
      p.id !== 'hat-box' &&
      p.id !== 'diamond-sword' &&
      !p.id.includes('-1m') &&
      !p.name.toLowerCase().includes('sub') &&
      !p.name.toLowerCase().includes('коробка') &&
      !p.name.toLowerCase().includes('меч')
  );

  const [isHatBoxModalOpen, setIsHatBoxModalOpen] = useState(false);
  const hatBoxProduct = products.find((p) => p.id === 'hat-box');
  const hatBoxPrice = hatBoxProduct?.price || 49;

  const getServiceIcon = (_type: string, id: string) => {
    if (id === 'unban') return <RotateCcw className="w-5 h-5 text-neutral-300" />;
    if (id === 'unmute') return <MessageSquare className="w-5 h-5 text-neutral-300" />;
    if (id === 'donate') return <Heart className="w-5 h-5 text-neutral-300" />;
    return <Sparkles className="w-5 h-5 text-neutral-300" />;
  };

  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, 'month' | 'forever'>>({
    sub: 'forever',
    'sub-plus': 'forever',
  });

  const togglePeriod = (productId: string, period: 'month' | 'forever') => {
    setSelectedPeriods((prev) => ({ ...prev, [productId]: period }));
  };

  const handleBuy = (product: ProductItem) => {
    const isSub = product.id === 'sub' || product.id === 'sub-plus';
    const period = selectedPeriods[product.id] || 'forever';
    const monthly = product.monthlyPrice || (product.id === 'sub' ? 139 : 289);
    const forever = product.price;

    const currentPrice = isSub ? (period === 'month' ? monthly : forever) : product.price;
    const currentPeriod = isSub ? (period === 'month' ? '1 месяц' : 'навсегда') : product.period;

    setSelectedItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      monthlyPrice: monthly,
      foreverPrice: forever,
      period: currentPeriod,
      description: product.description,
      isCustomAmount: product.id === 'donate',
      isSubscription: isSub,
    });
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Наши подписки
        </h1>
        <p className="mt-2 text-base text-neutral-400 max-w-2xl">
          Выбери подходящий для себя вариант и получи доступ к эксклюзивным возможностям.
        </p>
      </div>

      {/* Main Subscriptions: SUB & SUB+ (Top Grid matching reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
        {subscriptionProducts.map((sub) => {
          const isPopular = sub.popular;
          const period = selectedPeriods[sub.id] || 'forever';
          const monthlyPrice = sub.monthlyPrice || (sub.id === 'sub' ? 139 : 289);
          const foreverPrice = sub.price;
          const currentPrice = period === 'month' ? monthlyPrice : foreverPrice;
          const currentPeriodText = period === 'month' ? '1 месяц' : 'навсегда';

          return (
            <div
              key={sub.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'bg-neutral-900/90 border border-white/20 shadow-glow-lg hover:border-white/30'
                  : 'bg-neutral-900/60 border border-white/10 hover:border-white/20 hover:shadow-glow-sm'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 right-6">
                  <span className="px-3.5 py-1 rounded-full bg-neutral-800 border border-white/20 text-neutral-200 text-xs font-semibold tracking-wide shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>Популярный</span>
                  </span>
                </div>
              )}

              <div>
                {/* Title & Crown */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {sub.name}
                  </h2>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPopular
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-white/5 text-neutral-400 border border-white/10'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                  </div>
                </div>

                {/* Subtitle / Description */}
                <p className="text-sm text-neutral-400 font-medium mb-6">
                  {sub.description}
                </p>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  {sub.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                {/* Period Selector (1 месяц / Навсегда) */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.05] border border-white/10">
                  <button
                    type="button"
                    onClick={() => togglePeriod(sub.id, 'month')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      period === 'month'
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    1 месяц ({monthlyPrice} ₽)
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePeriod(sub.id, 'forever')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      period === 'forever'
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Навсегда ({foreverPrice} ₽)</span>
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {currentPrice} ₽
                  </span>
                  {sub.oldPrice && sub.oldPrice > currentPrice && period === 'forever' && (
                    <span className="text-base text-neutral-500 line-through font-mono">
                      {sub.oldPrice} ₽
                    </span>
                  )}
                  <span className="text-sm text-neutral-400">/ {currentPeriodText}</span>
                </div>

                <button
                  onClick={() => handleBuy(sub)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-white hover:bg-neutral-200 text-black shadow-glow-white hover:scale-[1.01]'
                      : 'bg-neutral-950/80 hover:bg-neutral-800 text-white border border-white/15 hover:border-white/30 hover:shadow-glow-sm'
                  }`}
                >
                  <span>Купить</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hat Box / Crate Showcase Section */}
      <div className="mb-16 sm:mb-20">
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#181512] via-[#11131a] to-[#0c0d12] border border-amber-500/20 relative overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Box Image with Interactive Hover */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <div
                onClick={() => setIsHatBoxModalOpen(true)}
                className="relative group cursor-pointer"
                title="Нажмите, чтобы открыть кейс!"
              >
                <div className="absolute -inset-6 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/35 transition-all opacity-70 group-hover:scale-110" />
                <img
                  src={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/box.png`}
                  alt="Коробка со шляпой"
                  className="relative w-64 sm:w-72 h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300"
                />
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/70 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-sm shadow-md mt-2 group-hover:border-amber-400 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Открыть рулетку</span>
                </span>
              </div>
            </div>

            {/* Right: Info, Drop Rates, Action Buttons */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5" />
                  <span>Кейс с аксессуарами</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Коробка со шляпой
                </h2>
                <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
                  В коробке спрятаны 17 уникальных головных уборов и аксессуаров. Испытай удачу и получи крутую шляпу с красивой анимацией открытия!
                </p>
              </div>

              {/* Rarity Chances Progress & Badges */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Шансы выпадения:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-sky-400 block">Базовая</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">70%</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">7 шляп</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-purple-400 block">Редкая</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">25%</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">7 шляп</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-amber-400 block">Легендарная</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">5%</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Нимб, Сигарета, MLG</span>
                  </div>
                </div>
              </div>

              {/* Price and Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {hatBoxPrice} ₽
                  </span>
                  <span className="text-sm text-neutral-400">/ 1 открытие</span>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <button
                    onClick={() => setIsHatBoxModalOpen(true)}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all shadow-glow-white hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Открыть коробку</span>
                  </button>

                  <button
                    onClick={() => {
                      if (hatBoxProduct) {
                        handleBuy(hatBoxProduct);
                      }
                    }}
                    className="py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Купить</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services Section matching screenshot 3 */}
      <div className="mb-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Дополнительные услуги
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Полезные услуги для комфортной игры.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {additionalProducts.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl p-6 bg-neutral-900/60 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:shadow-glow-sm group"
            >
              <div>
                {/* Icon & Title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:bg-white/10 transition-all">
                    {getServiceIcon(service.type, service.id)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {service.name}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Price & Button */}
              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-base sm:text-lg font-mono font-bold text-white">
                    {service.id === 'donate' ? 'от 50 ₽' : `${service.price} ₽`}
                  </div>
                  <span className="text-xs text-neutral-500 font-sans">{service.period}</span>
                </div>

                <button
                  onClick={() => handleBuy(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 text-white border border-white/15 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all hover:shadow-glow-sm"
                >
                  {service.id === 'donate' ? 'Поддержать' : 'Купить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchases Block */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-neutral-300" />
              <span>Лента активности</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Последние покупки
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Игроки, которые недавно поддержали сервер и получили свои привилегии.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-neutral-300 self-start sm:self-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Обновляется онлайн</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.slice(0, visibleOrdersCount).map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-850/80 border border-white/[0.08] hover:border-white/20 transition-all duration-200 shadow-sm flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Player Avatar */}
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(order.nickname)}/40`}
                    alt={order.nickname}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0';
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-white bg-white/10">
                    {order.nickname.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate group-hover:text-neutral-100">
                    {order.nickname}
                  </div>
                  <div className="text-xs text-neutral-400 truncate flex items-center gap-1.5">
                    <span>{order.productName}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-[11px] text-neutral-500">{order.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-mono font-bold text-emerald-400">
                  +{Math.round(order.amount)} ₽
                </div>
                <div className="text-[10px] text-neutral-500 font-medium">
                  {order.paymentMethod}
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length > visibleOrdersCount && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisibleOrdersCount((prev) => prev + 6)}
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
            >
              Показать ещё покупки ({orders.length - visibleOrdersCount})
            </button>
          </div>
        )}
      </div>

      {/* Hat Box Crate Opening Modal */}
      <HatBoxModal
        isOpen={isHatBoxModalOpen}
        onClose={() => setIsHatBoxModalOpen(false)}
        price={hatBoxPrice}
        onBuy={() => {
          if (hatBoxProduct) {
            handleBuy(hatBoxProduct);
          }
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
