import React, { useState } from 'react';
import { useStore, HatDropItem } from '../../context/StoreContext';
import { RARITY_CONFIG } from '../../lib/boxHats';
import { Search, Trash2, Package, Crown, Gem, Shield, Sparkles, Download, Filter } from 'lucide-react';

export const HatDropsTab: React.FC = () => {
  const { hatDrops, clearHatDrops } = useStore();
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredDrops = hatDrops.filter((drop) => {
    const matchesSearch =
      drop.nickname.toLowerCase().includes(search.toLowerCase()) ||
      drop.hatName.toLowerCase().includes(search.toLowerCase());

    const matchesRarity = rarityFilter === 'all' || drop.rarity === rarityFilter;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'paid' && drop.isPaid) ||
      (typeFilter === 'test' && !drop.isPaid);

    return matchesSearch && matchesRarity && matchesType;
  });

  const legendaryCount = hatDrops.filter((d) => d.rarity === 'legendary').length;
  const rareCount = hatDrops.filter((d) => d.rarity === 'rare').length;
  const commonCount = hatDrops.filter((d) => d.rarity === 'common').length;
  const paidCount = hatDrops.filter((d) => d.isPaid).length;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(hatDrops, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gsq_hat_drops_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClear = () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю выпавших шляп?')) {
      clearHatDrops();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Выбитые шляпы из кейсов</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredDrops.length} дропов
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Журнал всех головных уборов, выбитых игроками из коробки со шляпами.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hatDrops.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700/60"
                title="Экспорт в JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Экспорт</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
                title="Очистить историю дропов"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Всего открытий</span>
          </span>
          <div className="text-2xl font-black text-white font-mono">{hatDrops.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Легендарные (5%)</span>
          </span>
          <div className="text-2xl font-black text-amber-300 font-mono">{legendaryCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5 text-purple-400" />
            <span>Редкие (25%)</span>
          </span>
          <div className="text-2xl font-black text-purple-300 font-mono">{rareCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Обычные (70%)</span>
          </span>
          <div className="text-2xl font-black text-sky-300 font-mono">{commonCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Купленные кейсы</span>
          </span>
          <div className="text-2xl font-black text-emerald-300 font-mono">{paidCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по никнейму или шляпе..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-slate-700"
          >
            <option value="all">Все редкости</option>
            <option value="legendary">👑 Легендарные</option>
            <option value="rare">💎 Редкие</option>
            <option value="common">🛡️ Обычные</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-slate-700"
          >
            <option value="all">Все источники</option>
            <option value="paid">🎁 Только купленные</option>
            <option value="test">🧪 Только тест</option>
          </select>
        </div>
      </div>

      {/* Drops Table / List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        {filteredDrops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Игрок</th>
                  <th className="py-3 px-4">Выбитая шляпа</th>
                  <th className="py-3 px-4">Редкость</th>
                  <th className="py-3 px-4">Источник</th>
                  <th className="py-3 px-4 text-right">Дата и время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDrops.map((drop) => {
                  const config = RARITY_CONFIG[drop.rarity] || RARITY_CONFIG.common;
                  const date = new Date(drop.createdAt);
                  const formattedDate = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={drop.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Player */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://mc-heads.net/avatar/${encodeURIComponent(drop.nickname)}/28`}
                            alt={drop.nickname}
                            className="w-7 h-7 rounded bg-slate-800 border border-slate-700/60 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-mono font-bold text-white">{drop.nickname}</span>
                        </div>
                      </td>

                      {/* Hat */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {drop.hatImage ? (
                            <img
                              src={drop.hatImage}
                              alt={drop.hatName}
                              className="w-7 h-7 object-contain drop-shadow"
                            />
                          ) : (
                            <span className="text-xl">{drop.hatEmoji || '🎩'}</span>
                          )}
                          <span className="font-bold text-white">{drop.hatName}</span>
                        </div>
                      </td>

                      {/* Rarity */}
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: `${config.accentColor}18`,
                            color: config.accentColor,
                            border: `1px solid ${config.accentColor}35`,
                          }}
                        >
                          <span>{config.shortLabel}</span>
                          <span className="font-mono text-[10px] opacity-75">({config.percent}%)</span>
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        {drop.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <span>🎁 Купленный кейс</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-semibold">
                            <span>🧪 Тест рулетки</span>
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {hatDrops.length === 0
                ? 'История дропов пока пуста'
                : 'По выбранным фильтрам ничего не найдено'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hatDrops.length === 0
                ? 'Когда игроки будут открывать коробку со шляпой на сайте, здесь будут отображаться их выигрыши в реальном времени.'
                : 'Попробуйте изменить параметры поиска или сбросить фильтры.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
