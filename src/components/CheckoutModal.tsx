import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, ShieldCheck, User, ArrowRight, Loader2 } from 'lucide-react';

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  period?: string;
  description?: string;
  isCustomAmount?: boolean;
}

interface CheckoutModalProps {
  item: CheckoutItem | null;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, onClose }) => {
  const { validateCoupon, createOrder } = useStore();

  const [nickname, setNickname] = useState('');
  const [customPrice, setCustomPrice] = useState('100');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'СБП' | 'Банковская карта' | 'Т-Банк / СберPay' | 'Криптовалюта'>('СБП');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!item) return null;

  const basePrice = item.isCustomAmount ? Math.max(50, Number(customPrice) || 50) : item.price;
  const finalPrice = Math.max(1, Math.round(basePrice * (1 - promoDiscount / 100)));

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Register order in store context (accessible in Admin Panel)
      const created = createOrder({
        nickname: nickname.trim(),
        productId: item.id,
        productName: item.name,
        amount: finalPrice,
        paymentMethod,
        promoCode: promoDiscount > 0 ? promoCode.trim().toUpperCase() : undefined,
      });

      setOrderId(created.orderNumber);
      setOrderComplete(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0f0f13] border border-white/15 p-6 sm:p-8 shadow-2xl text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderComplete ? (
          <div>
            {/* Modal Title & Item Info */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Оформление заказа
              </span>
              <div className="flex items-center justify-between mt-1">
                <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.period && (
                    <span className="text-xs font-normal text-neutral-400 px-2 py-0.5 rounded-full bg-white/10">
                      {item.period}
                    </span>
                  )}
                </h3>
                <span className="text-2xl font-extrabold text-white font-mono">
                  {finalPrice} ₽
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Custom amount for donations */}
              {item.isCustomAmount && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Сумма пожертвования (в рублях)
                  </label>
                  <div className="flex gap-2">
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
                  </div>
                  <div className="flex gap-2 mt-2">
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

              {/* Nickname input */}
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
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Например: Steve"
                    pattern="[a-zA-Z0-9_]{3,16}"
                    title="Никнейм должен состоять из 3-16 латинских символов или цифр"
                    required
                    className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-sm font-mono"
                  />
                  {nickname.length >= 3 && (
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(nickname)}/32`}
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

              {/* Promo Code Input (Validated by StoreContext) */}
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
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all whitespace-nowrap"
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

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Способ оплаты
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'СБП', label: 'СБП (0% комиссия)', icon: '⚡' },
                    { id: 'Банковская карта', label: 'Банковская карта', icon: '💳' },
                    { id: 'Т-Банк / СберPay', label: 'Т-Банк / СберPay', icon: '🏦' },
                    { id: 'Криптовалюта', label: 'Криптовалюта (USDT)', icon: '💎' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        paymentMethod === method.id
                          ? 'bg-white/15 border-white text-white font-medium shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-base">{method.icon}</span>
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-white hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Обработка платежа...</span>
                    </>
                  ) : (
                    <>
                      <span>Оплатить {finalPrice} ₽</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Безопасная оплата. Привилегия выдаётся автоматически за 1–2 мин.</span>
              </div>
            </form>
          </div>
        ) : (
          /* Order confirmation screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-glow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h3 className="text-2xl font-black text-white">Заказ успешно оплачен!</h3>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Услуга <span className="text-white font-semibold">{item.name}</span> отправлена на ник <span className="text-white font-mono font-semibold">{nickname}</span>.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Номер заказа:</span>
                <span className="font-mono text-white font-bold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Игрок:</span>
                <span className="font-mono text-white">{nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Сумма:</span>
                <span className="font-mono text-white font-bold">{finalPrice} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Статус:</span>
                <span className="text-emerald-400 font-semibold">Оплачено (добавлено в журнал)</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all shadow-glow-sm"
              >
                Вернуться на сайт
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
