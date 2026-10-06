import React, { useState } from 'react';
import { SUBSCRIPTION_ITEMS, ADDITIONAL_SERVICES, SubscriptionItem, ServiceItem } from '../lib/constants';
import { CheckoutModal, CheckoutItem } from '../components/CheckoutModal';
import { Crown, Check, RotateCcw, MessageSquare, Heart, Sparkles, Shield, Info } from 'lucide-react';

export const Store: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'unban':
        return <RotateCcw className="w-5 h-5 text-neutral-300" />;
      case 'unmute':
        return <MessageSquare className="w-5 h-5 text-neutral-300" />;
      case 'donate':
        return <Heart className="w-5 h-5 text-neutral-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-neutral-300" />;
    }
  };

  const handleBuySubscription = (sub: SubscriptionItem) => {
    setSelectedItem({
      id: sub.id,
      name: sub.name,
      price: sub.price,
      period: sub.period,
      description: sub.tagline,
    });
  };

  const handleBuyService = (service: ServiceItem) => {
    setSelectedItem({
      id: service.id,
      name: service.name,
      price: service.priceMin,
      description: service.description,
      isCustomAmount: service.id === 'donate',
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

      {/* Main Subscriptions: SUB & SUB+ (Top Grid matching Screenshot 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
        {SUBSCRIPTION_ITEMS.map((sub) => {
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
                    <span>{sub.badge || 'Популярный'}</span>
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

                {/* Subtitle / Tagline */}
                <p className="text-sm text-neutral-400 font-medium mb-6">
                  {sub.tagline}
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
                  <span className="text-sm text-neutral-400">/ {sub.period}</span>
                </div>

                <button
                  onClick={() => handleBuySubscription(sub)}
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

      {/* Additional Services Section (matching screenshot 3) */}
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
          {ADDITIONAL_SERVICES.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl p-6 bg-neutral-900/60 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:shadow-glow-sm group"
            >
              <div>
                {/* Icon & Title */}
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-white/10 transition-all">
                  {getServiceIcon(service.iconType)}
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
                <div className="text-base sm:text-lg font-mono font-bold text-white">
                  {service.priceText}
                </div>

                <button
                  onClick={() => handleBuyService(service)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 text-white border border-white/15 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all hover:shadow-glow-sm"
                >
                  {service.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info banner about donations & fair play */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3.5 text-xs text-neutral-400">
        <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-neutral-300 font-medium">
            Правила и условия предоставления услуг:
          </p>
          <p>
            Все средства идут на оплату выделенного сервера, защиту от DDoS-атак и развитие сообщества. Привилегии не дают неуязвимости в PvP и не отменяют действие основных правил проекта.
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
