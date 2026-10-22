import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Gift, 
  Package, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  ArrowLeft,
  Copy,
  CheckCircle2,
  Trophy,
  ShieldAlert
} from 'lucide-react';
import { 
  parseGiftToken, 
  getLocalClaimState, 
  saveLocalClaimState, 
  GiftLinkItem,
  updateLocalGiftLink
} from '../lib/giftLinks';
import { 
  HATS_LIST, 
  HatItem, 
  RARITY_CONFIG, 
  getRandomHat, 
  HatRarity 
} from '../lib/boxHats';
import { api } from '../lib/api';

// Generate a random reel of 45 hats ending on targetHat at index 38
function generateReel(targetHat: HatItem): HatItem[] {
  const reel: HatItem[] = [];
  for (let i = 0; i < 45; i++) {
    if (i === 38) {
      reel.push(targetHat);
    } else {
      reel.push(getRandomHat());
    }
  }
  return reel;
}

// Web Audio API: tactile mechanical roulette tick
function playTickSound(audioContextRef: React.MutableRefObject<AudioContext | null>, soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(480, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(140, now + 0.022);

    bodyGain.gain.setValueAtTime(0.045, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.022);

    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1100, now);
    clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.007);

    clickGain.gain.setValueAtTime(0.02, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.007);
  } catch {}
}

// Web Audio API: Melodic win chime
function playWinSound(audioContextRef: React.MutableRefObject<AudioContext | null>, rarity: HatRarity, soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = rarity === 'legendary' 
      ? [523.25, 659.25, 783.99, 987.77, 1046.50]
      : rarity === 'rare'
      ? [587.33, 739.99, 880.00, 1174.66]
      : [523.25, 783.99];

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.09;
      const duration = rarity === 'legendary' ? 0.9 : rarity === 'rare' ? 0.7 : 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {}
}

export const GiftBoxClaim: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // Parsed Token Info
  const [tokenData, setTokenData] = useState<Partial<GiftLinkItem> | null>(() => parseGiftToken(token));
  const [isValidToken, setIsValidToken] = useState<boolean>(() => !!parseGiftToken(token));

  // Claim State
  const [totalBoxes, setTotalBoxes] = useState<number>(() => {
    const parsed = parseGiftToken(token);
    return parsed?.totalBoxes || 1;
  });
  const [remainingBoxes, setRemainingBoxes] = useState<number>(() => {
    const saved = getLocalClaimState(token);
    if (saved) return saved.remainingBoxes;
    const parsed = parseGiftToken(token);
    return parsed?.totalBoxes || 1;
  });
  const [wonHats, setWonHats] = useState<HatItem[]>(() => {
    const saved = getLocalClaimState(token);
    return saved?.wonHats || [];
  });

  // Time remaining
  const [expiresAt, setExpiresAt] = useState<number>(() => {
    const parsed = parseGiftToken(token);
    return parsed?.expiresAt || (Date.now() + 15 * 60 * 1000);
  });
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => Math.max(0, expiresAt - Date.now()));

  // Roulette States
  const [isOpening, setIsOpening] = useState(false);
  const [isSpinningTransition, setIsSpinningTransition] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reel, setReel] = useState<HatItem[]>([]);
  const [translateX, setTranslateX] = useState(0);
  const [lastWonHat, setLastWonHat] = useState<HatItem | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const ITEM_WIDTH = 140;
  const TARGET_INDEX = 38;

  // Initialize and sync with server
  useEffect(() => {
    const parsed = parseGiftToken(token);
    if (!parsed) {
      setIsValidToken(false);
      return;
    }

    setIsValidToken(true);
    setTokenData(parsed);
    setExpiresAt(parsed.expiresAt || (Date.now() + 15 * 60 * 1000));
    setTotalBoxes(parsed.totalBoxes || 1);

    // Check server status if online
    api.getGiftLink(token)
      .then((res) => {
        if (res && res.link) {
          const l = res.link;
          setRemainingBoxes(l.remainingBoxes);
          setWonHats(l.wonHats || []);
          if (l.expiresAt) setExpiresAt(l.expiresAt);
          saveLocalClaimState(token, {
            wonHats: l.wonHats || [],
            remainingBoxes: l.remainingBoxes,
            totalBoxes: l.totalBoxes,
          });
        }
      })
      .catch(() => {
        // Fallback to local claim state
        const saved = getLocalClaimState(token);
        if (saved) {
          setRemainingBoxes(saved.remainingBoxes);
          setWonHats(saved.wonHats);
        }
      });
  }, [token]);

  // Live Countdown Timer (15 min)
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeftMs(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Clean audio/timers on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach(clearTimeout);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const isExpired = timeLeftMs <= 0;
  const isCompleted = remainingBoxes <= 0 && !isOpening;

  // Format time remaining MM:SS
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Roulette Open Trigger
  const handleStartOpening = () => {
    if (isOpening || isExpired || remainingBoxes <= 0) return;

    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    setIsOpening(true);
    setIsSpinningTransition(false);
    setLastWonHat(null);

    // ANTI-DUPLICATE MECHANICS:
    // Exclude hats already won in this session so the player won't get duplicate drops!
    const wonIds = wonHats.map((h) => h.id);
    const target = getRandomHat(wonIds);
    const newReel = generateReel(target);
    setReel(newReel);
    setTranslateX(0);

    const randomOffset = Math.floor(Math.random() * 36) - 18;

    const tickIntervals = [
      65, 65, 65, 70, 70, 75, 80, 85, 95, 105,
      120, 135, 155, 180, 210, 250, 300, 360, 430, 520, 630, 760
    ];

    const t1 = setTimeout(() => {
      if (reelContainerRef.current) {
        void reelContainerRef.current.offsetHeight;
      }

      const containerWidth = reelContainerRef.current?.offsetWidth || (window.innerWidth < 640 ? Math.max(window.innerWidth - 64, 280) : 560);
      const cardCenter = TARGET_INDEX * ITEM_WIDTH + (ITEM_WIDTH - 12) / 2;
      const finalDistance = Math.round(cardCenter - containerWidth / 2 + randomOffset);

      setIsSpinningTransition(true);
      setTranslateX(finalDistance);

      let tickIdx = 0;
      const playNextTick = () => {
        if (tickIdx >= tickIntervals.length) return;
        playTickSound(audioContextRef, soundEnabled);
        const delay = tickIntervals[tickIdx];
        tickIdx++;
        const nextTimer = setTimeout(playNextTick, delay);
        timerRef.current.push(nextTimer);
      };

      playNextTick();
    }, 50);

    const t2 = setTimeout(() => {
      setLastWonHat(target);
      setIsOpening(false);
      setIsSpinningTransition(false);
      playWinSound(audioContextRef, target.rarity, soundEnabled);

      const nextRemaining = Math.max(0, remainingBoxes - 1);
      const nextWonHats = [...wonHats, target];

      setRemainingBoxes(nextRemaining);
      setWonHats(nextWonHats);

      // Save locally
      saveLocalClaimState(token, {
        wonHats: nextWonHats,
        remainingBoxes: nextRemaining,
        totalBoxes,
      });

      // Update admin list if on same host
      updateLocalGiftLink(token, {
        wonHats: nextWonHats,
        remainingBoxes: nextRemaining,
      });

      // Call server API if online
      api.openGiftLinkBox(token, wonIds).catch(() => {});
    }, 4900);

    timerRef.current.push(t1, t2);
  };

  // Copy report for Discord ticket
  const handleCopyDiscordReport = () => {
    const nick = tokenData?.nickname ? `👤 Игрок: **${tokenData.nickname}**\n` : '';
    const hatsListText = wonHats
      .map((h) => `• ${h.emoji || '👒'} **${h.name}** (${RARITY_CONFIG[h.rarity]?.label || h.rarity})`)
      .join('\n');

    const report = `🎁 **Отчёт об открытии коробок GSQ**
${nick}📦 Открыто коробок: **${wonHats.length} шт.**
✨ **Выбитые шляпы:**
${hatsListText || '• Нет выбитых шляп'}

Сервер: **play.mygsq.fun** (команда: **/hat**)`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // ---------------------------------------------------------------------------
  // View: Invalid Token
  // ---------------------------------------------------------------------------
  if (!isValidToken || !token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0e1320] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Недействительная ссылка</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Эта ссылка для открытия коробок не найдена, повреждена или была отозвана.
            Пожалуйста, проверьте правильность ссылки или обратитесь в поддержку тикетов Discord.
          </p>
          <div className="pt-2">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Перейти в магазин</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const boxImg = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/box.png';

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Minecraft Player Info + Live Countdown Timer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121829] via-[#101524] to-[#0d121e] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Player Avatar + Details */}
          <div className="flex items-center gap-3.5">
            {tokenData?.nickname ? (
              <img
                src={`https://minotar.net/helm/${encodeURIComponent(tokenData.nickname)}/64.png`}
                alt={tokenData.nickname}
                className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-500/40 shadow-md flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-2 border-amber-500/40 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-md">
                <Gift className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  Подарочный набор GSQ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Discord Ticket
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {tokenData?.nickname ? `Игрок: ${tokenData.nickname}` : 'Коробка со шляпами'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Осталось открыть: <b className="text-amber-400 text-sm font-black">{remainingBoxes}</b> из {totalBoxes} кейс(ов)
              </p>
            </div>
          </div>

          {/* Right: Live Countdown Clock */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
              isExpired
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : timeLeftMs < 120000
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-black/40 border-white/15 text-white'
            }`}>
              <Clock className={`w-5 h-5 ${isExpired ? 'text-rose-400' : 'text-amber-400'}`} />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {isExpired ? 'Время истекло' : 'Действует ещё'}
                </p>
                <p className="text-lg font-mono font-black tracking-tight">
                  {formatCountdown(timeLeftMs)}
                </p>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-2xl bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {!isCompleted && !isExpired ? (
        /* ================= ACTIVE STATE: ROULETTE REEL ================= */
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d121e] border border-white/10 shadow-2xl relative space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Механическая рулетка шляп</span>
            </h2>
            <p className="text-xs text-slate-400">
              Каждое открытие гарантированно даёт уникальную вещь без повторок!
            </p>
          </div>

          {/* Roulette Carousel / Reel Container */}
          <div className="relative rounded-2xl bg-[#070a12] border-2 border-white/15 p-2 overflow-hidden shadow-inner">
            {/* Center Pointer Indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400 z-30 shadow-[0_0_12px_rgba(251,191,36,0.8)] pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400" />
            </div>

            {/* Side Fade Gradients */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#070a12] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#070a12] to-transparent z-20 pointer-events-none" />

            {/* Reel Items */}
            <div
              ref={reelContainerRef}
              className="relative w-full h-36 overflow-hidden flex items-center"
            >
              <div
                className="flex items-center transition-transform"
                style={{
                  transform: `translateX(-${translateX}px)`,
                  transitionDuration: isSpinningTransition ? '4.8s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.2, 1)',
                  willChange: 'transform',
                }}
              >
                {reel.length > 0 ? (
                  reel.map((hat, idx) => {
                    const rarity = RARITY_CONFIG[hat.rarity];
                    return (
                      <div
                        key={idx}
                        style={{ width: `${ITEM_WIDTH}px` }}
                        className="flex-shrink-0 px-1.5 flex flex-col items-center"
                      >
                        <div
                          className={`w-[128px] h-32 rounded-xl p-2 flex flex-col items-center justify-between border relative overflow-hidden transition-all ${rarity.bgColor} ${rarity.borderColor}`}
                        >
                          <span className="text-xl self-start">{hat.emoji}</span>
                          <div className="w-14 h-14 flex items-center justify-center my-auto">
                            {hat.image ? (
                              <img
                                src={hat.image}
                                alt={hat.name}
                                className={`w-full h-full object-contain ${hat.scale || 'scale-100'} drop-shadow-md`}
                              />
                            ) : (
                              <span className="text-3xl">{hat.emoji}</span>
                            )}
                          </div>
                          <p className={`text-[11px] font-bold text-center truncate w-full ${rarity.textColor}`}>
                            {hat.name}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Initial Placeholder Box State */
                  <div className="w-full flex items-center justify-center py-4 space-x-3">
                    <img src={boxImg} alt="Box" className="w-20 h-20 animate-bounce" />
                    <div>
                      <p className="text-sm font-extrabold text-white">Коробка готова к открытию</p>
                      <p className="text-xs text-slate-400">Нажмите кнопку ниже, чтобы запустить вращение</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Won Hat Callout */}
          {lastWonHat && !isOpening && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 animate-in zoom-in-95 duration-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                  {lastWonHat.image ? (
                    <img src={lastWonHat.image} alt={lastWonHat.name} className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-2xl">{lastWonHat.emoji}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold text-amber-400">Вы только что выбили:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RARITY_CONFIG[lastWonHat.rarity].bgColor} ${RARITY_CONFIG[lastWonHat.rarity].textColor}`}>
                      {RARITY_CONFIG[lastWonHat.rarity].label}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-white">{lastWonHat.name}</p>
                </div>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
          )}

          {/* Big Action Button */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              onClick={handleStartOpening}
              disabled={isOpening || remainingBoxes <= 0}
              className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isOpening ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Крутим рулетку...</span>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  <span>Открыть коробку ({remainingBoxes} ост.)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 font-medium">
              Ссылка заблокируется после открытия всех {totalBoxes} коробок или по истечении 15 минут
            </p>
          </div>
        </div>
      ) : isCompleted ? (
        /* ================= COMPLETED STATE ================= */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-[#0d121e] to-[#0d121e] border-2 border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              Поздравляем!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Все коробки успешно открыты!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Вы открыли все <b className="text-white">{totalBoxes}</b> коробок по этой ссылке. 
              Все выбитые предметы сохранены за вашим аккаунтом.
            </p>
          </div>

          {/* Minecraft Server In-Game Hint */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto text-left flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Как надеть шляпы в игре:</p>
              <p className="text-slate-400 leading-relaxed">
                Зайдите на сервер <span className="font-mono text-amber-300 font-bold">play.mygsq.fun</span> и напишите команду <span className="font-mono text-emerald-400 font-bold">/hat</span> в чат, чтобы примерить любой аксессуар.
              </p>
            </div>
          </div>

          {/* Copy Report for Discord */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyDiscordReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
            >
              {copiedReport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReport ? 'Отчёт скопирован!' : 'Скопировать отчёт для Discord'}</span>
            </button>

            <Link
              to="/store"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Вернуться на сайт</span>
            </Link>
          </div>
        </div>
      ) : (
        /* ================= EXPIRED STATE ================= */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-rose-500/10 via-[#0d121e] to-[#0d121e] border-2 border-rose-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Срок действия ссылки истёк
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Ссылка действовала ровно 15 минут с момента создания в Discord тикете. 
              {wonHats.length > 0 
                ? ' Все предметы, которые вы успели открыть до истечения времени, отображены ниже.'
                : ' Если вы не успели открыть коробки, обратитесь обратно в тикет Discord.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/store"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>В магазин</span>
            </Link>
          </div>
        </div>
      )}

      {/* Won Hats Showcase (Live during and after opening) */}
      {wonHats.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0d121e] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white">
                Выбитые шляпы ({wonHats.length} из {totalBoxes})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Без повторок
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {wonHats.map((hat, index) => {
              const rarity = RARITY_CONFIG[hat.rarity];
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden transition-all hover:scale-105 shadow-md ${rarity.bgColor} ${rarity.borderColor}`}
                >
                  {/* Top Rarity Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${rarity.bgColor} ${rarity.textColor} border ${rarity.borderColor}`}>
                    {rarity.shortLabel}
                  </span>

                  {/* Hat Render / Icon */}
                  <div className="w-16 h-16 flex items-center justify-center my-2">
                    {hat.image ? (
                      <img
                        src={hat.image}
                        alt={hat.name}
                        className={`w-full h-full object-contain ${hat.scale || 'scale-100'} drop-shadow-md`}
                      />
                    ) : (
                      <span className="text-4xl">{hat.emoji}</span>
                    )}
                  </div>

                  {/* Hat Name */}
                  <p className="text-xs font-extrabold text-white mt-1 leading-snug">
                    {hat.name}
                  </p>

                  {hat.subtitle && (
                    <span className="text-[9px] text-amber-300 font-bold mt-0.5">
                      {hat.subtitle}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
