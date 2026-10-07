import React, { useState } from 'react';
import { useStore, ProductItem } from '../context/StoreContext';
import { CheckoutModal, CheckoutItem } from '../components/CheckoutModal';
import { Crown, Check, RotateCcw, MessageSquare, Heart, Sparkles, Sword, Info } from 'lucide-react';
import { CubeIcon } from '../components/admin/CubeIcon';

export const Store: React.FC = () => {
  const { products } = useStore();
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);

  // Subscriptions (SUB, SUB+, etc.)
  const subscriptionProducts = products.filter(
    (p) => !p.hidden && (p.category === 'Подписки' || p.id === 'sub' || p.id === 'sub-plus') && !p.id.includes('-1m')
  );

  // Additional services & items (unban, unmute, donate, diamond-sword, etc.)
  const additionalProducts = products.filter(
    (p) => !p.hidden && !subscriptionProducts.some((sub) => sub.id === p.id)
  );

  const getServiceIcon = (type: string, id: string) => {
    if (id === 'unban') return <RotateCcw className="w-5 h-5 text-neutral-300" />;
    if (id === 'unmute') return <MessageSquare className="w-5 h-5 text-neutral-300" />;
    if (id === 'donate') return <Heart className="w-5 h-5 text-neutral-300" />;
    if (id === 'diamond-sword' || type === 'Предмет') return <Sword className="w-5 h-5 text-neutral-300" />;
    return <Sparkles className="w-5 h-5 text-neutral-300" />;
  };

  const handleBuy = (product: ProductItem) => {
    setSelectedItem({
      id: product.id,
      name: product.name,
      price: product.price,
      period: product.period,
      description: product.description,
      isCustomAmount: product.id === 'donate',
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
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {sub.price} ₽
                  </span>
                  {sub.oldPrice && sub.oldPrice > sub.price && (
                    <span className="text-base text-neutral-500 line-through font-mono">
                      {sub.oldPrice} ₽
                    </span>
                  )}
                  <span className="text-sm text-neutral-400">/ {sub.period}</span>
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

      {/* Additional Services & Items Section */}
      <div className="mb-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Дополнительные услуги и товары
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Полезные услуги и предметы для комфортной игры.
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
                  <CubeIcon color={service.iconColor} size="sm" />
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

      {/* Info banner */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3.5 text-xs text-neutral-400">
        <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-neutral-300 font-medium">
            Правила и условия предоставления услуг:
          </p>
          <p>
            Все средства идут на оплату выделенного сервера, защиту от DDoS-атак и развитие сообщества. Привилегии не нарушают ванильный игровой баланс.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
