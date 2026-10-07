import React, { useState } from 'react';
import { useStore, CouponItem } from '../../context/StoreContext';
import { Plus, Edit2, Trash2, PieChart, Check, X, Tag, Sparkles } from 'lucide-react';
import { CubeIcon } from '../../components/admin/CubeIcon';

export const CouponsTab: React.FC = () => {
  const { coupons, products, addCoupon, updateCoupon, deleteCoupon } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('15');
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [applicableProductIds, setApplicableProductIds] = useState<string[]>(['all']);

  const handleOpenAdd = () => {
    setEditingCouponId(null);
    setCode('');
    setDiscount('15');
    setDescription('');
    setMaxUses('');
    setApplicableProductIds(['all']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CouponItem) => {
    setEditingCouponId(c.id);
    setCode(c.code);
    setDiscount(c.discount.toString());
    setDescription(c.description);
    setMaxUses(c.maxUses ? c.maxUses.toString() : '');
    setApplicableProductIds(c.applicableProductIds);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (editingCouponId) {
      updateCoupon(editingCouponId, {
        code: code.trim(),
        discount: Number(discount) || 10,
        description: description.trim(),
        maxUses: maxUses ? Number(maxUses) : undefined,
        applicableProductIds,
      });
    } else {
      addCoupon({
        code: code.trim(),
        discount: Number(discount) || 10,
        description: description.trim() || 'Промокод',
        maxUses: maxUses ? Number(maxUses) : undefined,
        applicableProductIds,
        active: true,
      });
    }

    setIsModalOpen(false);
  };

  const toggleProductApplicable = (prodId: string) => {
    if (prodId === 'all') {
      setApplicableProductIds(['all']);
      return;
    }

    let updated = applicableProductIds.filter((id) => id !== 'all');
    if (updated.includes(prodId)) {
      updated = updated.filter((id) => id !== prodId);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated.push(prodId);
    }
    setApplicableProductIds(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar matching Screenshot 4 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>GSQ — купоны</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              Активных: {coupons.filter((c) => c.active).length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Создавайте промокоды со скидками. Купоны работают в магазине при оформлении заказа!
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Добавить купон</span>
        </button>
      </div>

      {/* Grid of coupon cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coupons.map((coupon) => {
          const isAll = coupon.applicableProductIds.includes('all');

          return (
            <div
              key={coupon.id}
              className="relative rounded-2xl bg-[#131a29] border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-200 hover:border-slate-700 min-h-[220px]"
            >
              <div>
                {/* Header: Code & Action Buttons matching Screenshot 4 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white font-mono tracking-wide">
                      {coupon.code}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {coupon.description || 'Без описания'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                      -{coupon.discount}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(coupon)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Редактировать купон"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Удалить купон «${coupon.code}»?`)) {
                          deleteCoupon(coupon.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      title="Удалить купон"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Metric: Uses count matching Screenshot 4 (`0 =`) */}
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {coupon.usesCount}
                  </span>
                  <span className="text-slate-500 text-xl font-normal">=</span>
                  <span className="text-xs text-slate-500 font-sans ml-1">использований</span>
                </div>
              </div>

              {/* Gold Accent Line matching Screenshot 4 */}
              <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400 mb-4 rounded-full" />

              {/* Applicable products pills matching Screenshot 4 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {isAll ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e1422] border border-slate-800 text-[11px] font-medium text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Все товары магазина</span>
                  </span>
                ) : (
                  coupon.applicableProductIds.map((prodId) => {
                    const prod = products.find((p) => p.id === prodId);
                    return (
                      <span
                        key={prodId}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0e1422] border border-slate-800 text-[10px] font-medium text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-magenta-400 bg-purple-400" />
                        <span className="truncate max-w-[140px]">{prod?.name || prodId}</span>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111726] border border-slate-800 p-6 shadow-2xl text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>{editingCouponId ? 'Редактировать промокод' : 'Создать новый промокод'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Промокод (КОД) *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Скидка (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Кампания / Описание
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Скидка для новых игроков"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e1422] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Лимит использований (необязательно)
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="100 (или оставьте пустым)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e1422] border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Применимость к товарам
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#0e1422] border border-slate-800">
                  <button
                    type="button"
                    onClick={() => toggleProductApplicable('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      applicableProductIds.includes('all')
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Все товары
                  </button>
                  {products.map((p) => {
                    const isSelected = applicableProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProductApplicable(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md"
                >
                  {editingCouponId ? 'Сохранить купон' : 'Создать купон'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
