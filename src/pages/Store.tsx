import React, { useState } from 'react';
import { useStore, ProductItem } from '../context/StoreContext';
import { DiscordInstructionModal, PurchaseItem } from '../components/DiscordInstructionModal';
import { Crown, Check, RotateCcw, MessageSquare, Sparkles, Clock, Package, ShoppingBag } from 'lucide-react';
import { SERVER_INFO } from '../lib/constants';

export const Store: React.FC = () => {
  const { products } = useStore();
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState<PurchaseItem | null>(null);

  // Subscriptions (SUB and SUB+ only)
  const subscriptionProducts = products.filter(
    (p) => !p.hidden && (p.id === 'sub' || p.id === 'sub-plus')
  );

  // Additional services (strictly unban and unmute - donate removed completely)
  const additionalProducts = products.filter(
    (p) =>
      !p.hidden &&
      p.id !== 'sub' &&
      p.id !== 'sub-plus' &&
      p.id !== 'hat-box' &&
      p.id !== 'diamond-sword' &&
      p.id !== 'donate' &&
      p.category !== 'Поддержка' &&
      !p.name.toLowerCase().includes('пожертвован') &&
      !p.id.includes('-1m') &&
      !p.name.toLowerCase().includes('sub') &&
      !p.name.toLowerCase().includes('коробка') &&
      !p.name.toLowerCase().includes('меч')
  );

  const DEFAULT_HAT_BOX: ProductItem = {
    id: 'hat-box',
    numericId: 1060515,
    name: 'Коробка со шляпой',
    price: 49,
    period: '1 шт.',
    type: 'Рулетка',
    command: 'box give {user} hat_box 1',
    description: 'Кейс с аксессуарами: 17 шляп (70% Базовые, 25% Редкие, 5% Легендарные).',
    category: 'Кейсы',
    iconColor: 'gold',
    hidden: false,
    offlineAllowed: true,
    popular: true,
    features: [
      '17 уникальных шляп и аксессуаров',
      'Шанс 5% на легендарную вещь (Нимб, Сигарета, MLG очки)',
      'Шанс 25% на редкие маски, Алтын и эффекты огня',
      'Моментальное открытие и примерка',
    ],
  };

  const [boxQuantity, setBoxQuantity] = useState(1);
  const hatBoxProduct = products.find((p) => p.id === 'hat-box') || DEFAULT_HAT_BOX;
  const hatBoxPrice = hatBoxProduct?.price || 49;

  const getServiceIcon = (_type: string, id: string) => {
    if (id === 'unban') return <RotateCcw className="w-5 h-5 text-neutral-300" />;
    if (id === 'unmute') return <MessageSquare className="w-5 h-5 text-neutral-300" />;
    return <Sparkles className="w-5 h-5 text-neutral-300" />;
  };

  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, 'month' | 'forever'>>({
    sub: 'forever',
    'sub-plus': 'forever',
  });

  const togglePeriod = (productId: string, period: 'month' | 'forever') => {
    setSelectedPeriods((prev) => ({ ...prev, [productId]: period }));
  };

  const handleBuy = (product: ProductItem, initialQuantity: number = 1) => {
    const isSub = product.id === 'sub' || product.id === 'sub-plus';
    const isBox = product.id === 'hat-box';
    const period = selectedPeriods[product.id] || 'forever';
    const monthly = product.monthlyPrice || (product.id === 'sub' ? 139 : 289);
    const forever = product.price;

    const currentPrice = isSub ? (period === 'month' ? monthly : forever) : product.price;
    const currentPeriod = isSub ? (period === 'month' ? '1 месяц' : 'навсегда') : product.period;

    setSelectedPurchaseItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      monthlyPrice: monthly,
      foreverPrice: forever,
      period: currentPeriod,
      description: product.description,
      isSubscription: isSub,
      isBox: isBox,
      initialQuantity: isBox ? initialQuantity : 1,
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

      {/* Hat Box Showcase Section */}
      <div className="mb-16 sm:mb-20">
        <div className="rounded-3xl p-6 sm:p-10 bg-neutral-900/60 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Box Image */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <div
                onClick={() => handleBuy(hatBoxProduct, boxQuantity)}
                className="relative group cursor-pointer"
                title="Нажмите, чтобы заказать коробку"
              >
                <img
                  src={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/box.png`}
                  alt="Коробка со шляпой"
                  className="relative w-60 sm:w-68 h-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-200"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-medium mt-3">
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>{hatBoxPrice * boxQuantity} ₽ / {boxQuantity} шт.</span>
                </span>
              </div>
            </div>

            {/* Right: Info, Drop Rates, Action Buttons */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5 text-white" />
                  <span>Кейс с аксессуарами</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Коробка со шляпой
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                  В коробке спрятаны 17 уникальных головных уборов и аксессуаров. Включает базовые, редкие и легендарные шляпы.
                </p>
              </div>

              {/* Rarity Chances (Clean Neutral Styling) */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Шансы выпадения:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-400 block">Базовая</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">70%</span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">7 шляп</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-400 block">Редкая</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">25%</span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">7 шляп</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-300 block">Легендарная</span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">5%</span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Нимб, Сигарета, MLG</span>
                  </div>
                </div>
              </div>

              {/* Quantity selector for box */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-400">Количество:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {boxQuantity} шт. • {hatBoxPrice * boxQuantity} ₽
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setBoxQuantity((q) => Math.max(1, q - 1))}
                      disabled={boxQuantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Уменьшить"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-black text-white min-w-[32px] text-center">
                      {boxQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBoxQuantity((q) => Math.min(50, q + 1))}
                      disabled={boxQuantity >= 50}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Увеличить"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 3, 5, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setBoxQuantity(n)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          boxQuantity === n
                            ? 'bg-white text-black'
                            : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price and Buy Button */}
              <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {hatBoxPrice * boxQuantity} ₽
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">/ {boxQuantity} шт.</span>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  <button
                    onClick={() => handleBuy(hatBoxProduct, boxQuantity)}
                    className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Купить {boxQuantity > 1 ? `${boxQuantity} коробок` : 'коробку'} ({hatBoxPrice * boxQuantity} ₽)
                    </span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
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
                    {service.price} ₽
                  </div>
                  <span className="text-xs text-neutral-500 font-sans">
                    / {service.period}
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 text-white border border-white/15 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all hover:shadow-glow-sm"
                >
                  Купить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support contacts */}
      <div className="mb-14 p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center justify-between gap-3 text-xs text-neutral-400">
        <div>
          <span>Служба поддержки по заказам: </span>
          <a href="mailto:polyanskihegor@yandex.ru" className="text-white hover:underline font-mono font-medium">
            polyanskihegor@yandex.ru
          </a>
        </div>
      </div>

      {/* Discord Purchase Instruction Modal */}
      <DiscordInstructionModal
        item={selectedPurchaseItem}
        onClose={() => setSelectedPurchaseItem(null)}
      />
    </div>
  );
};
