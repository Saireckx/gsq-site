import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductIcon } from '../../components/admin/ProductIcon';
import { Search, PlusCircle, Trash2, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const OrdersTab: React.FC = () => {
  const { orders, generateMockSale, clearOrders } = useStore();
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.nickname.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.productName.toLowerCase().includes(search.toLowerCase());

    const matchesProduct = filterProduct === 'all' || order.productId === filterProduct;

    return matchesSearch && matchesProduct;
  });

  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gsq_orders_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>GSQ — история продаж</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredOrders.length} транзакций
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Полный журнал всех покупок с сайта с фильтрацией и экспортом.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateMockSale}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
            title="Создать тестовую покупку для проверки"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Тестовая покупка</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141b2a] hover:bg-[#1a2337] text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
            title="Экспорт в JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#131a29] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по нику, номеру заказа или товару..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0e1422] border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">Сумма в выборке:</span>
          <span className="text-emerald-400 font-bold text-sm">
            {totalFilteredRevenue.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#131a29] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1422] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Заказ</th>
                <th className="py-3 px-4">Игрок</th>
                <th className="py-3 px-4">Товар</th>
                <th className="py-3 px-4">Сумма</th>
                <th className="py-3 px-4">Оплата</th>
                <th className="py-3 px-4">Дата</th>
                <th className="py-3 px-4 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Покупок не найдено. Нажмите «+ Тестовая покупка», чтобы протестировать журнал продаж.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#161f32] transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {order.orderNumber}
                    </td>

                    {/* Nickname with Minecraft head preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(order.nickname)}/24`}
                          alt={order.nickname}
                          className="w-5 h-5 rounded bg-slate-800 border border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-mono font-bold text-white">
                          {order.nickname}
                        </span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <ProductIcon productId={order.productId} name={order.productName} size="sm" />
                        <span className="text-slate-200 font-medium">
                          {order.productName}
                        </span>
                      </div>
                    </td>

                    {/* Amount & Promo */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      <span>+{order.amount.toLocaleString('ru-RU')} ₽</span>
                      {order.promoCode && (
                        <span className="block text-[10px] text-amber-400 font-normal">
                          Промокод: {order.promoCode}
                        </span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {order.paymentMethod}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {order.createdAt}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      {(order.status === 'completed' || !order.status) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Оплачен</span>
                        </span>
                      )}
                      {order.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Ожидает</span>
                        </span>
                      )}
                      {order.status === 'canceled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Отменён</span>
                        </span>
                      )}
                      {order.status === 'refunded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <span>Возврат</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
