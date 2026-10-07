import React, { useState, useMemo } from 'react';
import { RULES_DATA } from '../lib/constants';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { Search, ShieldAlert, ArrowUpRight, BookOpen } from 'lucide-react';

export const Rules: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const categoryIds = useMemo(() => RULES_DATA.map((cat) => `rule-${cat.id}`), []);
  const { activeId, scrollTo } = useScrollSpy(categoryIds, 140);

  // Filter rules based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return RULES_DATA;
    const query = searchQuery.toLowerCase();

    return RULES_DATA.map((cat) => ({
      ...cat,
      rules: cat.rules.filter(
        (r) =>
          r.text.toLowerCase().includes(query) ||
          r.code.toLowerCase().includes(query) ||
          cat.title.toLowerCase().includes(query) ||
          (r.note && r.note.toLowerCase().includes(query))
      ),
    })).filter((cat) => cat.rules.length > 0);
  }, [searchQuery]);

  return (
    <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Search & Header on Top */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            <BookOpen className="w-4 h-4 text-neutral-300" />
            <span>Свод правил GSQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Правила сервера
          </h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по правилам..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-white/30 text-white placeholder-neutral-500 text-sm focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Сброс
            </button>
          )}
        </div>
      </div>

      {/* Rules Notice Banner matching user prompt */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-semibold text-white">
            Соблюдение правил обязательно для всех игроков — незнание не освобождает от ответственности.
          </p>
          <p className="text-xs text-rose-400 font-medium">
            Абьюз правил — запрещён
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-neutral-200 tracking-wider uppercase flex-shrink-0">
          Сервер 12+
        </div>
      </div>

      {/* Main Grid: Left Sidebar + Center Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Sticky Sidebar (matching Screenshot 2) */}
        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-28 p-5 rounded-2xl bg-[#0d0d10] border border-white/10 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2 border-b border-white/[0.06]">
              Правила сервера
            </h3>

            <nav className="space-y-1">
              {RULES_DATA.map((category) => {
                const elementId = `rule-${category.id}`;
                const isActive = activeId === elementId;

                return (
                  <button
                    key={category.id}
                    onClick={() => scrollTo(elementId)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                      isActive
                        ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="truncate">
                      {category.number}. {category.title}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-neutral-500 px-3">
              Нажмите на раздел для быстрого перехода
            </div>
          </div>
        </aside>

        {/* Center / Right Content: All Rules */}
        <main className="lg:col-span-8 space-y-12 sm:space-y-16">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
              <ShieldAlert className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Ничего не найдено</h3>
              <p className="text-sm text-neutral-400 mt-1">
                По запросу «{searchQuery}» правила не найдены. Попробуйте изменить формулировку.
              </p>
            </div>
          ) : (
            filteredData.map((category) => (
              <section
                key={category.id}
                id={`rule-${category.id}`}
                className="scroll-mt-28 space-y-4"
              >
                {/* Category Header */}
                <div className="pb-3 border-b border-white/[0.08]">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                    <span className="text-neutral-400 font-mono text-xl sm:text-2xl">
                      {category.number}.
                    </span>
                    <span>{category.title}</span>
                  </h2>
                  <p className="mt-2 text-sm text-neutral-300 leading-relaxed font-normal">
                    {category.intro}
                  </p>
                </div>

                {/* Rules List */}
                <div className="space-y-4 pt-1">
                  {category.rules.map((rule) => (
                    <div
                      key={rule.code}
                      className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/70 border border-white/[0.06] hover:border-white/15 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="flex-shrink-0 font-mono text-xs sm:text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">
                          {rule.code}
                        </span>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm text-neutral-200 leading-relaxed">
                            {rule.text}
                          </p>
                          {rule.note && (
                            <p className="text-xs text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-block mt-1">
                              {rule.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  );
};
