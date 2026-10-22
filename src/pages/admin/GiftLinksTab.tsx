import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Clock, 
  User, 
  Package, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  MessageSquare,
  RefreshCw,
  Flame
} from 'lucide-react';
import { 
  GiftLinkItem, 
  createGiftToken, 
  getLocalGiftLinks, 
  saveLocalGiftLink, 
  deleteLocalGiftLink, 
  getGiftLinkUrl, 
  getDiscordMessage 
} from '../../lib/giftLinks';
import { api } from '../../lib/api';
import { RARITY_CONFIG } from '../../lib/boxHats';

export const GiftLinksTab: React.FC = () => {
  const [links, setLinks] = useState<GiftLinkItem[]>(() => getLocalGiftLinks());
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [totalBoxes, setTotalBoxes] = useState<number>(1);
  const [nickname, setNickname] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [note, setNote] = useState('');

  // Newly Created Link Notification
  const [createdLink, setCreatedLink] = useState<GiftLinkItem | null>(null);
  const [copiedType, setCopiedType] = useState<'url' | 'discord' | null>(null);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Sync with backend API on mount
  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const serverLinks = await api.getGiftLinks();
      if (Array.isArray(serverLinks) && serverLinks.length > 0) {
        // Merge with local storage
        const local = getLocalGiftLinks();
        const mergedMap = new Map<string, GiftLinkItem>();
        serverLinks.forEach((l) => mergedMap.set(l.token, l));
        local.forEach((l) => {
          if (!mergedMap.has(l.token)) mergedMap.set(l.token, l);
        });
        const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        setLinks(merged);
        localStorage.setItem('gsq_gift_links', JSON.stringify(merged));
      }
    } catch {
      // Fallback to local
      setLinks(getLocalGiftLinks());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Live timer tick every 10 seconds to update expired status badges
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Quick box presets
  const boxPresets = [1, 2, 3, 5, 10];
  const timePresets = [
    { label: '15 минут (стандарт)', value: 15 },
    { label: '30 минут', value: 30 },
    { label: '1 час', value: 60 },
    { label: '24 часа', value: 1440 },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.max(1, Math.min(100, Number(totalBoxes) || 1));
    const duration = Math.max(1, Number(durationMinutes) || 15);
    const createdAt = Date.now();
    const expiresAt = createdAt + duration * 60 * 1000;
    const linkId = `gift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const token = createGiftToken({
      id: linkId,
      nickname: nickname.trim() || undefined,
      totalBoxes: count,
      createdAt,
      expiresAt,
      durationMinutes: duration,
      note: note.trim() || undefined,
    });

    const newLink: GiftLinkItem = {
      id: linkId,
      token,
      nickname: nickname.trim() || undefined,
      totalBoxes: count,
      remainingBoxes: count,
      wonHats: [],
      createdAt,
      expiresAt,
      durationMinutes: duration,
      note: note.trim() || undefined,
    };

    // Save locally
    saveLocalGiftLink(newLink);

    // Save to server if available
    try {
      await api.createGiftLink({
        nickname: newLink.nickname,
        totalBoxes: newLink.totalBoxes,
        durationMinutes: newLink.durationMinutes,
        note: newLink.note,
      });
    } catch {}

    setLinks((prev) => [newLink, ...prev.filter((l) => l.token !== newLink.token)]);
    setCreatedLink(newLink);

    // Reset form fields
    setNote('');
  };

  const handleDelete = async (item: GiftLinkItem) => {
    if (!window.confirm(`Удалить ссылку для ${item.nickname || 'игрока'} (${item.totalBoxes} кейсов)?`)) {
      return;
    }
    deleteLocalGiftLink(item.token);
    try {
      await api.deleteGiftLink(item.id || item.token);
    } catch {}
    setLinks((prev) => prev.filter((l) => l.token !== item.token && l.id !== item.id));
    if (createdLink?.token === item.token) {
      setCreatedLink(null);
    }
  };

  const handleCopy = (text: string, type: 'url' | 'discord', rowId?: string) => {
    navigator.clipboard.writeText(text);
    if (rowId) {
      setCopiedRowId(rowId);
      setTimeout(() => setCopiedRowId(null), 2000);
    } else {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const now = Date.now();

  const getStatus = (link: GiftLinkItem) => {
    const isExpired = now > link.expiresAt;
    const isCompleted = link.remainingBoxes <= 0;
    if (isCompleted) {
      return {
        label: 'Завершена',
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    if (isExpired) {
      return {
        label: 'Истекла',
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
      };
    }
    return {
      label: 'Активна',
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400 animate-ping',
    };
  };

  const formatTimeLeft = (expiresAt: number) => {
    const diff = expiresAt - now;
    if (diff <= 0) return 'Истекла';
    const minutes = Math.floor(diff / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ч. ${minutes % 60} мин.`;
    }
    return `${minutes} мин. ${seconds} сек.`;
  };

  // Filtered links
  const filteredLinks = links.filter((link) => {
    const isExpired = now > link.expiresAt;
    const isCompleted = link.remainingBoxes <= 0;
    const isActive = !isExpired && !isCompleted;

    if (filter === 'active' && !isActive) return false;
    if (filter === 'completed' && !isCompleted) return false;
    if (filter === 'expired' && (!isExpired || isCompleted)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNick = link.nickname?.toLowerCase().includes(q);
      const matchNote = link.note?.toLowerCase().includes(q);
      const matchToken = link.token.toLowerCase().includes(q);
      if (!matchNick && !matchNote && !matchToken) return false;
    }

    return true;
  });

  // Calculate stats
  const totalCreated = links.length;
  const activeCount = links.filter((l) => now <= l.expiresAt && l.remainingBoxes > 0).length;
  const completedCount = links.filter((l) => l.remainingBoxes <= 0).length;
  const totalHatsOpened = links.reduce((sum, l) => sum + (l.wonHats?.length || (l.totalBoxes - l.remainingBoxes)), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Выдача уникальных ссылок (Discord)</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              15 минут
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Создавай одноразовые ссылки для тикетов в Discord. Игрок крутит настоящую рулетку кейсов со звуками, 
            получает шапки без повторок, а ссылка автоматически деактивируется через 15 минут.
          </p>
        </div>

        <button
          onClick={fetchLinks}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Обновить статус</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Всего выдано</p>
            <p className="text-2xl font-black text-white mt-1">{totalCreated}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">Активны сейчас</p>
            <p className="text-2xl font-black text-amber-300 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Кейсов открыто</p>
            <p className="text-2xl font-black text-sky-400 mt-1">{totalHatsOpened}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Завершено</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-white">Генератор новой ссылки</h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box Count */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Количество кейсов: <span className="text-amber-400 font-black">{totalBoxes} шт.</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {boxPresets.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTotalBoxes(count)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      totalBoxes === count
                        ? 'bg-amber-500 text-black shadow-md scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {count} шт.
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={totalBoxes}
                onChange={(e) => setTotalBoxes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white font-mono text-sm focus:border-amber-400 focus:outline-none transition-colors"
                placeholder="Своё число кейсов..."
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Никнейм игрока (Minecraft)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Например: Saireckx"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Опционально. Если указать — на странице открытия покажется его скин.
              </p>
            </div>

            {/* Expiration Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Срок действия ссылки
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
              >
                {timePresets.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                По умолчанию 15 минут, как в тикетах Discord.
              </p>
            </div>
          </div>

          {/* Note / Ticket details */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Примечание для себя / Тикет Discord
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: Тикет #142 (Оплата 150₽ через СБП)"
              className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none transition-colors placeholder-slate-600"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>Создать ссылку на {totalBoxes} кейс(ов)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Newly Created Link Highlight Card */}
      {createdLink && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-extrabold text-white">Ссылка успешно создана!</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {createdLink.totalBoxes} кейс(а) • 15 минут
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Игрок: <span className="font-bold text-white">{createdLink.nickname || 'Не указан'}</span> 
                {createdLink.note && <span className="text-slate-400"> ({createdLink.note})</span>}
              </p>
            </div>

            <button
              onClick={() => setCreatedLink(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Закрыть
            </button>
          </div>

          {/* URL Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-center justify-between gap-3 font-mono text-xs text-amber-200 overflow-hidden">
            <span className="truncate">{getGiftLinkUrl(createdLink.token)}</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopy(getGiftLinkUrl(createdLink.token), 'url')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'url' ? 'Скопировано!' : 'Скопировать ссылку'}</span>
            </button>

            <button
              onClick={() => handleCopy(getDiscordMessage(createdLink), 'discord')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {copiedType === 'discord' ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              <span>{copiedType === 'discord' ? 'Текст скопирован!' : 'Скопировать для Discord'}</span>
            </button>

            <a
              href={getGiftLinkUrl(createdLink.token)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Проверить страницу</span>
            </a>
          </div>
        </div>
      )}

      {/* Links List / Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
        {/* Controls: Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'all' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Все ({links.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'active' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Активные ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'completed' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Завершённые ({completedCount})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'expired' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Истёкшие
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по нику или тикету..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* List of Links */}
        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Gift className="w-10 h-10 mx-auto opacity-40 text-amber-400" />
            <p className="text-sm font-semibold">Ссылок по выбранному фильтру не найдено</p>
            <p className="text-xs text-slate-600">Создайте ссылку через форму выше</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((link) => {
              const status = getStatus(link);
              const isExpired = now > link.expiresAt;
              const isCompleted = link.remainingBoxes <= 0;
              const url = getGiftLinkUrl(link.token);

              return (
                <div
                  key={link.id || link.token}
                  className="p-4 rounded-xl bg-[#090d16] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Player + Boxes info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    {link.nickname ? (
                      <img
                        src={`https://minotar.net/helm/${encodeURIComponent(link.nickname)}/40.png`}
                        alt={link.nickname}
                        className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white truncate">
                          {link.nickname || 'Без никнейма'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>
                          Кейсов: <b className="text-amber-400">{link.totalBoxes - link.remainingBoxes}</b> / {link.totalBoxes} открыто
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {!isCompleted && !isExpired ? (
                            <span className="text-amber-300 font-semibold">{formatTimeLeft(link.expiresAt)}</span>
                          ) : (
                            <span>{new Date(link.createdAt).toLocaleDateString('ru-RU')}</span>
                          )}
                        </span>
                      </div>

                      {link.note && (
                        <p className="text-[11px] text-slate-500 italic truncate max-w-md">
                          {link.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Won hats preview if any */}
                  {link.wonHats && link.wonHats.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-semibold mr-1">Выбито:</span>
                      {link.wonHats.map((hat, idx) => {
                        const rConfig = RARITY_CONFIG[hat.rarity];
                        return (
                          <div
                            key={idx}
                            title={`${hat.name} (${rConfig?.label || hat.rarity})`}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold ${rConfig?.bgColor || 'bg-slate-800'} ${rConfig?.borderColor || 'border-slate-700'} ${rConfig?.textColor || 'text-white'}`}
                          >
                            <span>{hat.emoji || '👒'}</span>
                            <span className="truncate max-w-[100px]">{hat.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => handleCopy(url, 'url', link.token)}
                      title="Скопировать ссылку"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all active:scale-95"
                    >
                      {copiedRowId === link.token ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Ссылка</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy(getDiscordMessage(link), 'discord', link.token + '_dc')}
                      title="Скопировать текст для Discord тикета"
                      className="p-1.5 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2] text-[#8e99f7] hover:text-white border border-[#5865F2]/40 transition-all active:scale-95"
                    >
                      {copiedRowId === link.token + '_dc' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Открыть страницу открытия"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDelete(link)}
                      title="Удалить ссылку"
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
