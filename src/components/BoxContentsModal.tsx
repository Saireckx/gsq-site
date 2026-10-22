import React, { useState } from 'react';
import { X, Package, Sparkles, Crown, Gem, Shield, ShoppingBag, Eye } from 'lucide-react';
import { HATS_LIST, HatItem, HatRarity } from '../lib/boxHats';

interface BoxContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy?: () => void;
  pricePerBox?: number;
  initialFilter?: 'all' | HatRarity;
}

export const BoxContentsModal: React.FC<BoxContentsModalProps> = ({
  isOpen,
  onClose,
  onBuy,
  pricePerBox = 49,
  initialFilter = 'all',
}) => {
  const [filter, setFilter] = useState<'all' | HatRarity>(initialFilter);

  if (!isOpen) return null;

  const filteredHats = filter === 'all' 
    ? HATS_LIST 
    : HATS_LIST.filter((h) => h.rarity === filter);

  const legendaryCount = HATS_LIST.filter((h) => h.rarity === 'legendary').length;
  const rareCount = HATS_LIST.filter((h) => h.rarity === 'rare').length;
  const commonCount = HATS_LIST.filter((h) => h.rarity === 'common').length;

  const getRarityBadge = (rarity: HatRarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'Легендарная',
          chance: '5%',
          itemChance: '1.67%',
          badgeClass: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
          icon: Crown,
        };
      case 'rare':
        return {
          label: 'Редкая',
          chance: '25%',
          itemChance: '3.57%',
          badgeClass: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
          icon: Gem,
        };
      case 'common':
      default:
        return {
          label: 'Базовая',
          chance: '70%',
          itemChance: '10.0%',
          badgeClass: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
          icon: Shield,
        };
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0c0c0e] border border-neutral-800 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold">
              <Package className="w-3.5 h-3.5 text-neutral-300" />
              <span>Содержимое коробки</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              17 аксессуаров в коробке
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Каждый предмет можно надевать на персонажа на сервере. Предметы выпадают с указанными шансами.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Chances Info */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-neutral-800/80 bg-neutral-950/40 flex-shrink-0 space-y-3">
          {/* Chances Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={() => setFilter(filter === 'common' ? 'all' : 'common')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filter === 'common'
                  ? 'bg-neutral-800 border-neutral-600 shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold">
                <span>Базовые</span>
                <span className="font-mono font-bold text-white">70%</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">{commonCount} предметов (~10% на вещь)</p>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'rare' ? 'all' : 'rare')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filter === 'rare'
                  ? 'bg-neutral-800 border-neutral-600 shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold">
                <span>Редкие</span>
                <span className="font-mono font-bold text-white">25%</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">{rareCount} предметов (~3.5% на вещь)</p>
            </button>

            <button
              type="button"
              onClick={() => setFilter(filter === 'legendary' ? 'all' : 'legendary')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                filter === 'legendary'
                  ? 'bg-neutral-800 border-neutral-600 shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-300 text-[11px] font-semibold">
                <span>Легендарные</span>
                <span className="font-mono font-bold text-white">5%</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">{legendaryCount} предмета (~1.7% на вещь)</p>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Все предметы ({HATS_LIST.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('legendary')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'legendary'
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Crown className="w-3 h-3" />
              <span>Легендарные ({legendaryCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('rare')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'rare'
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Gem className="w-3 h-3" />
              <span>Редкие ({rareCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('common')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'common'
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Базовые ({commonCount})</span>
            </button>
          </div>
        </div>

        {/* Items Grid (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredHats.map((hat) => {
              const info = getRarityBadge(hat.rarity);
              const isAnimated = Boolean(hat.subtitle?.toLowerCase().includes('анимир'));

              return (
                <div
                  key={hat.id}
                  className="group relative rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950/80 px-1.5 py-0.5 rounded border border-neutral-800">
                      ~{info.itemChance}
                    </span>

                    {isAnimated && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-neutral-200 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                        <Sparkles className="w-2.5 h-2.5 text-neutral-300" />
                        <span>Анимация</span>
                      </span>
                    )}
                  </div>

                  {/* 3D Hat Image Viewport */}
                  <div className="w-full h-28 sm:h-32 flex items-center justify-center p-2 relative my-1">
                    {hat.image ? (
                      <img
                        src={hat.image}
                        alt={hat.name}
                        className={`w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-200 ${hat.scale || ''}`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-4xl">{hat.emoji}</span>
                    )}
                  </div>

                  {/* Hat Info */}
                  <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-center">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-neutral-100 transition-colors truncate" title={hat.name}>
                      {hat.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] font-medium text-neutral-400">
                        {info.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Package className="w-4 h-4 text-white" />
            <span>Стоимость коробки:</span>
            <span className="font-mono font-bold text-white text-sm">{pricePerBox} ₽</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs border border-neutral-800 transition-colors"
            >
              Закрыть
            </button>

            {onBuy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBuy();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Купить коробку ({pricePerBox} ₽)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
