import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore, OrderItem } from '../context/StoreContext';
import { api } from '../lib/api';
import { CheckCircle2, Clock, AlertTriangle, ArrowLeft, Copy, Check, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || searchParams.get('order_id') || searchParams.get('orderId') || '';
  const isDemo = searchParams.get('demo') === 'true';

  const { orders, completeOrder, serverSettings } = useStore();
  const [currentOrder, setCurrentOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [demoConfirmed, setDemoConfirmed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrderStatus() {
      // 1. Try finding in local context first
      const foundInStore = orders.find((o) => o.orderNumber === orderNumber);
      if (foundInStore && isMounted) {
        setCurrentOrder(foundInStore);
      }

      // 2. Query backend to verify latest payment status
      if (orderNumber) {
        try {
          const res = await api.checkYooKassaOrder(orderNumber);
          if (res && res.found && res.order && isMounted) {
            setCurrentOrder(res.order);
            if (res.paid) {
              completeOrder(orderNumber);
            }
          }
        } catch (err) {
          // If offline / gh-pages, keep current local order
        }
      }

      if (isMounted) setLoading(false);
    }

    loadOrderStatus();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverSettings.ip || 'play.mygsq.fun');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDemoPayment = () => {
    if (orderNumber) {
      completeOrder(orderNumber);
      setCurrentOrder((prev) => (prev ? { ...prev, status: 'completed' } : prev));
      setDemoConfirmed(true);
    }
  };

  const isCompleted = currentOrder?.status === 'completed' || demoConfirmed;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl bg-[#0f0f13] border border-white/15 p-6 sm:p-10 shadow-2xl text-white space-y-6">
        {loading ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto" />
            <p className="text-sm text-neutral-400">Проверяем статус платежа в ЮKassa...</p>
          </div>
        ) : currentOrder ? (
          <>
            {/* Header Icon & Status */}
            <div className="text-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                  isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                ) : (
                  <Clock className="w-9 h-9 stroke-[2.5] animate-pulse" />
                )}
              </div>

              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Платёжный шлюз ЮKassa
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isCompleted ? 'Оплата успешно завершена!' : 'Ожидание подтверждения оплаты'}
              </h2>

              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                {isCompleted
                  ? 'Платеж успешно обработан. Услуга уже отправлена на сервер и будет активирована автоматически.'
                  : 'ЮKassa ожидает проведение транзакции. Если вы уже оплатили, статус обновится автоматически в течение пары минут.'}
              </p>
            </div>

            {/* Demo Mode Notice Banner */}
            {isDemo && !isCompleted && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Тестовый режим ЮKassa (На этапе подключения)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Магазин настроен и готов принимать боевые платежи после ввода Shop ID и Секретного ключа в панели управления. Вы можете подтвердить оплату прямо сейчас для проверки выдачи услуги:
                </p>
                <button
                  type="button"
                  onClick={handleConfirmDemoPayment}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Подтвердить тестовую оплату</span>
                </button>
              </div>
            )}

            {/* Order Details Card */}
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Номер заказа:</span>
                <span className="font-mono text-white font-bold">{currentOrder.orderNumber}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Игровой ник:</span>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(currentOrder.nickname)}/24`}
                    alt={currentOrder.nickname}
                    className="w-5 h-5 rounded bg-neutral-800 border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-mono text-white font-semibold">{currentOrder.nickname}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Товар:</span>
                <span className="text-white font-semibold text-right">{currentOrder.productName}</span>
              </div>

              {currentOrder.promoCode && (
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-neutral-400">Промокод:</span>
                  <span className="text-amber-400 font-mono font-bold">{currentOrder.promoCode}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Сумма:</span>
                <span className="font-mono text-white font-extrabold text-base">{currentOrder.amount} ₽</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Платёжный метод:</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>ЮKassa (СБП, Карты МИР, SberPay)</span>
                </span>
              </div>
            </div>

            {/* How to receive in game */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-semibold">
                  Подключение к серверу
                </span>
                <span className="font-mono text-sm font-bold text-white block">
                  {serverSettings.ip || 'play.mygsq.fun'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyIp}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать IP'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/store"
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all text-center flex items-center justify-center gap-2 shadow-glow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Вернуться в магазин</span>
              </Link>
              <Link
                to="/"
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>На главную</span>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Официальный шлюз ЮKassa. Безопасность гарантирована.</span>
            </div>
          </>
        ) : (
          /* Order not found */
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Заказ не найден</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Возможно, ссылка устарела или номер заказа указан неверно.
            </p>
            <div className="pt-4">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>В магазин</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
