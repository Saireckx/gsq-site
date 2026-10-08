import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldCheck, User, ArrowRight, Loader2, Sparkles, Check, ExternalLink, AlertCircle, CreditCard } from 'lucide-react';

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  monthlyPrice?: number;
  foreverPrice?: number;
  period?: string;
  description?: string;
  isCustomAmount?: boolean;
  isSubscription?: boolean;
}

interface CheckoutModalProps {
  item: CheckoutItem | null;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose }) => {
  const { validateCoupon, createYooKassaPayment } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'forever'>('forever');
  const [nickname, setNickname] = useState('');
  const [customPrice, setCustomPrice] = useState('100');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectInfo, setRedirectInfo] = useState<{
    orderNumber: string;
    paymentUrl: string;
    isDemo?: boolean;
    message?: string;
  } | null>(null);

  // Reset state when item changes or modal reopens
  useEffect(() => {
    if (item) {
      setLoading(false);
      setErrorMessage(null);
      setRedirectInfo(null);
      setPromoCode('');
      setPromoDiscount(0);
      setPromoMessage(null);
      if (item.period?.includes('месяц')) {
        setSelectedPeriod('month');
      } else {
        setSelectedPeriod('forever');
      }
    }
  }, [item?.id, item?.period]);

  const handleModalClose = () => {
    setLoading(false);
    setErrorMessage(null);
    setRedirectInfo(null);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoMessage(null);
    onClose();
  };

  if (!item) return null;

  const currentSubPrice = selectedPeriod === 'month' 
    ? (item.monthlyPrice || (item.id === 'sub' ? 139 : 289))
    : (item.foreverPrice || item.price);

  const basePrice = item.isCustomAmount
    ? Math.max(50, Number(customPrice) || 50)
    : (item.isSubscription ? currentSubPrice : item.price);

  const currentPeriodLabel = item.isSubscription
    ? (selectedPeriod === 'month' ? '1 месяц' : 'навсегда')
    : item.period;

  const discountAmount = Math.round(basePrice * (promoDiscount / 100));
  const finalPrice = Math.max(1, basePrice - discountAmount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoDiscount(0);
      setPromoMessage(null);
      return;
    }

    const result = validateCoupon(promoCode, item.id);
    if (result.valid) {
      setPromoDiscount(result.discount);
      setPromoMessage(result.message);
    } else {
      setPromoDiscount(0);
      setPromoMessage(result.message || 'Недействительный промокод');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setErrorMessage('Пожалуйста, введите ваш игровой никнейм');
      return;
    }

    if (cleanNick.length < 3 || cleanNick.length > 16) {
      setErrorMessage('Никнейм должен содержать от 3 до 16 символов');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const fullProductName = `${item.name}${item.isSubscription ? ` (${currentPeriodLabel})` : ''}`;
      const res = await createYooKassaPayment({
        nickname: cleanNick,
        productId: item.id,
        productName: fullProductName,
        amount: finalPrice,
        promoCode: promoDiscount > 0 ? promoCode.trim().toUpperCase() : undefined,
        period: currentPeriodLabel,
      });

      setLoading(false);

      if (res && res.paymentUrl) {
        setRedirectInfo({
          orderNumber: res.orderNumber,
          paymentUrl: res.paymentUrl,
          isDemo: res.isDemo,
          message: res.message,
        });

        // If real external YooKassa confirmation URL, redirect automatically
        if (res.paymentUrl.startsWith('http')) {
          window.location.href = res.paymentUrl;
        }
      } else {
        setErrorMessage(res?.message || 'Не удалось сформировать платёж. Попробуйте снова.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Произошла ошибка при обращении к ЮKassa');
    }
  };

  return (
    <div
      onClick={handleModalClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0f0f13] border border-white/15 p-6 sm:p-8 shadow-2xl text-white animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {!redirectInfo ? (
          <div>
            {/* Modal Title & Item Info */}
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Оплата через ЮKassa
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  Мгновенно
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{item.name}</span>
                  {currentPeriodLabel && (
                    <span className="text-xs font-normal text-neutral-300 px-2.5 py-0.5 rounded-full bg-white/10">
                      {currentPeriodLabel}
                    </span>
                  )}
                </h3>
                <div className="text-right flex-shrink-0">
                  {promoDiscount > 0 && (
                    <span className="text-xs text-neutral-500 line-through block font-mono">
                      {basePrice} ₽
                    </span>
                  )}
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {finalPrice} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription period toggle */}
            {item.isSubscription && (
              <div className="mb-5 p-1 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('month')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedPeriod === 'month'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  1 месяц ({item.monthlyPrice || (item.id === 'sub' ? 139 : 289)} ₽)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('forever')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedPeriod === 'forever'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Навсегда ({item.foreverPrice || item.price} ₽)</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Custom amount for donations */}
              {item.isCustomAmount && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Сумма пожертвования (в рублях)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="50000"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-white/30 text-sm font-mono"
                    placeholder="50"
                    required
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[50, 100, 300, 500, 1000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomPrice(preset.toString())}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          customPrice === preset.toString()
                            ? 'bg-white text-black border-white font-semibold'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {preset} ₽
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nickname input with head avatar preview */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Игровой никнейм в Minecraft <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Например: Steve"
                    pattern="[a-zA-Z0-9_]{3,16}"
                    title="Никнейм должен состоять из 3-16 латинских символов или цифр"
                    required
                    className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-sm font-mono"
                  />
                  {nickname.trim().length >= 3 && (
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(nickname.trim())}/32`}
                        alt={nickname}
                        className="w-6 h-6 rounded bg-neutral-800 border border-white/20"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Убедитесь, что ник введен точно так же, как в лаунчере
                </p>
              </div>

              {/* Promo Code Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Промокод (если есть)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Например: GSQ, TECH10, CODE20"
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-sm uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all whitespace-nowrap active:scale-95"
                  >
                    Применить
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`mt-1 text-xs ${
                      promoDiscount > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400'
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Official YooKassa Payment Gateway Info Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Платёжный шлюз ЮKassa</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    0% комиссия
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] text-neutral-300 font-medium">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>СБП</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-1.5">
                    <span>💳</span>
                    <span>МИР / Visa / MC</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center gap-1.5">
                    <span>🏦</span>
                    <span>SberPay / T-Pay</span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 leading-tight">
                  Выбор конкретного способа оплаты откроется на защищённой странице ЮKassa.
                </p>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Стоимость товара:</span>
                  <span className="font-mono text-neutral-300">{basePrice} ₽</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Скидка по промокоду ({promoDiscount}%):</span>
                    <span className="font-mono">-{discountAmount} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/5">
                  <span>Итого к оплате:</span>
                  <span className="font-mono text-base">{finalPrice} ₽</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-white hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Подготовка платежа в ЮKassa...</span>
                    </>
                  ) : (
                    <>
                      <span>Перейти к оплате {finalPrice} ₽</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Защищённое SSL соединение ЮKassa. Выдача за 1–2 мин.</span>
              </div>
            </form>
          </div>
        ) : (
          /* Redirection / Payment initiated Screen */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Заказ {redirectInfo.orderNumber}
              </span>
              <h3 className="text-2xl font-black text-white">Переход в ЮKassa</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                {redirectInfo.isDemo
                  ? 'ЮKassa готова к приёму платежей. Для теста вы можете перейти на экран подтверждения.'
                  : 'Перенаправляем вас на официальную страницу оплаты ЮKassa...'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Товар:</span>
                <span className="font-semibold text-white">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Игрок:</span>
                <span className="font-mono text-white">{nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Сумма:</span>
                <span className="font-mono text-white font-bold">{finalPrice} ₽</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={redirectInfo.paymentUrl}
                target={redirectInfo.paymentUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={() => {
                  if (!redirectInfo.paymentUrl.startsWith('http')) {
                    handleModalClose();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-sm"
              >
                <span>{redirectInfo.isDemo ? 'Перейти к тестовой проверке' : 'Оплатить на странице ЮKassa'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Закрыть окно
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
