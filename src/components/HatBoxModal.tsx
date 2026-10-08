import React, { useState, useEffect, useRef } from 'react';
import { HATS_LIST, HatItem, RARITY_CONFIG, getRandomHat, HatRarity } from '../lib/boxHats';
import { X, Sparkles, Volume2, VolumeX, RotateCcw, Package, HelpCircle, Check, ShoppingBag } from 'lucide-react';

interface HatBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  price?: number;
  onBuy?: () => void;
}

// Generate a random reel of 45 hats ending on targetHat at index 40
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

// Web Audio API tick generator
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
}

// Win celebration sound
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
    const chords = rarity === 'legendary' 
      ? [523.25, 659.25, 783.99, 1046.50] // C Major fanfare
      : rarity === 'rare'
      ? [440.00, 554.37, 659.25] // A Major
      : [392.00, 493.88]; // G

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = rarity === 'legendary' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
    });
  } catch {}
}

const boxImg = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/box.png';

export const HatBoxModal: React.FC<HatBoxModalProps> = ({
  isOpen,
  onClose,
  price = 49,
  onBuy,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'collection'>('open');
  const [isOpening, setIsOpening] = useState(false);
  const [wonHat, setWonHat] = useState<HatItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reel, setReel] = useState<HatItem[]>([]);
  const [translateX, setTranslateX] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach(clearTimeout);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  const ITEM_WIDTH = 130; // width of item in roulette reel (px)
  const TARGET_INDEX = 38;

  const handleStartOpening = () => {
    if (isOpening) return;
    setIsOpening(true);
    setWonHat(null);

    // Pick fair winner based on 60% common, 32% rare, 8% legendary
    const target = getRandomHat();
    const newReel = generateReel(target);
    setReel(newReel);
    setTranslateX(0);

    // Random small offset within target card so it doesn't always land at dead center
    const randomOffset = Math.floor(Math.random() * 40) - 20;
    const finalDistance = TARGET_INDEX * ITEM_WIDTH - 240 + randomOffset;

    // Trigger roulette spin on next animation frame
    const t1 = setTimeout(() => {
      setTranslateX(finalDistance);

      // Play tick sounds at decreasing intervals as reel decelerates
      let tickCount = 0;
      const totalTicks = 28;
      const runTicks = () => {
        if (tickCount >= totalTicks) return;
        playTickSound(audioContextRef, soundEnabled);
        tickCount++;
        // Slower interval as ticks progress
        const delay = 40 + Math.pow(tickCount, 2.1) * 3;
        const tickTimer = setTimeout(runTicks, delay);
        timerRef.current.push(tickTimer);
      };
      runTicks();
    }, 50);

    // Stop and display win after 4.8 seconds
    const t2 = setTimeout(() => {
      setWonHat(target);
      setIsOpening(false);
      playWinSound(audioContextRef, target.rarity, soundEnabled);
    }, 4900);

    timerRef.current.push(t1, t2);
  };

  const handleReset = () => {
    setIsOpening(false);
    setWonHat(null);
    setTranslateX(0);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-[#0f1118] border border-white/15 p-5 sm:p-8 shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Коробка со шляпой
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Кейс
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Открой коробку и получи одну из 17 эксклюзивных шляп!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Open / Collection) */}
        <div className="flex items-center gap-2 mt-4 mb-6">
          <button
            onClick={() => {
              setActiveTab('open');
              handleReset();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'open'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Рулетка открытия</span>
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'collection'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Все 17 шляп и шансы</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: ROULETTE OPENING INTERFACE                                 */}
        {/* ================================================================= */}
        {activeTab === 'open' && (
          <div className="space-y-6">
            {/* MAIN STAGE: If not won yet, show Box or Roulette Reel */}
            {!wonHat ? (
              <div className="relative rounded-2xl bg-black/60 border border-white/10 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
                {!isOpening ? (
                  /* Idle Stage: Cardboard Box with Float Animation */
                  <div className="text-center space-y-4 animate-in fade-in duration-300">
                    <div className="relative inline-block group">
                      <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all opacity-60" />
                      <img
                        src={boxImg}
                        alt="Коробка со шляпой"
                        className="relative w-48 sm:w-56 h-auto mx-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400">Стоимость открытия:</span>
                      <div className="text-2xl font-black text-white font-mono">{price} ₽</div>
                    </div>
                  </div>
                ) : (
                  /* Spinning Stage: CS:GO Style Horizontal Roulette Reel */
                  <div className="w-full relative py-4">
                    {/* Top Center Arrow Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]" />
                    </div>

                    {/* Bottom Center Arrow Pointer */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400 drop-shadow-[0_-2px_8px_rgba(251,191,36,0.8)]" />
                    </div>

                    {/* Center Target Indicator Line */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-amber-400/60 z-10 pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.8)]" />

                    {/* Edge Darkening Vignette */}
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0f1118] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0f1118] to-transparent z-10 pointer-events-none" />

                    {/* Roulette Track */}
                    <div
                      ref={reelContainerRef}
                      className="overflow-hidden w-full relative py-2"
                    >
                      <div
                        className="flex items-center gap-3"
                        style={{
                          transform: `translateX(-${translateX}px)`,
                          transition: translateX > 0 ? 'transform 4.8s cubic-bezier(0.12, 0.8, 0.33, 1)' : 'none',
                        }}
                      >
                        {reel.map((hat, idx) => {
                          const config = RARITY_CONFIG[hat.rarity];
                          return (
                            <div
                              key={idx}
                              style={{ width: `${ITEM_WIDTH - 12}px` }}
                              className={`flex-shrink-0 p-3 rounded-2xl bg-neutral-900/90 border ${config.borderColor} flex flex-col items-center justify-center text-center shadow-md relative`}
                            >
                              <div className="w-14 h-14 mb-1.5 flex items-center justify-center">
                                {hat.image ? (
                                  <img
                                    src={hat.image}
                                    alt={hat.name}
                                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                                  />
                                ) : (
                                  <span className="text-3xl filter drop-shadow">{hat.emoji}</span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-white truncate w-full">
                                {hat.name}
                              </span>
                              <span className={`text-[9px] uppercase font-semibold ${config.textColor}`}>
                                {config.shortLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-center text-xs text-neutral-400 mt-4 animate-pulse">
                      Крутится рулетка... Определение выигрыша!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* WIN STAGE: Celebration Card */
              <div className="relative rounded-3xl bg-neutral-900/95 border-2 border-white/20 p-8 flex flex-col items-center justify-center text-center space-y-5 overflow-hidden animate-in zoom-in-90 duration-300 shadow-2xl">
                {/* Radial Glow matching Rarity Color */}
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${RARITY_CONFIG[wonHat.rarity].accentColor} 0%, transparent 70%)`,
                  }}
                />

                <div className="w-full text-center text-xs uppercase font-bold tracking-wider text-neutral-400">
                  🎉 Поздравляем! Ваш выигрыш:
                </div>

                {/* Big Hat Image / Icon - strictly centered */}
                <div className="relative flex items-center justify-center py-2 my-1 w-full">
                  <div
                    className="absolute w-36 h-36 rounded-full blur-2xl opacity-75 pointer-events-none"
                    style={{ backgroundColor: RARITY_CONFIG[wonHat.rarity].accentColor }}
                  />
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] animate-bounce duration-1000">
                    {wonHat.image ? (
                      <img
                        src={wonHat.image}
                        alt={wonHat.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow"
                      />
                    ) : (
                      <span className="text-7xl sm:text-8xl">{wonHat.emoji}</span>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center text-center">
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
                    {wonHat.name}
                  </h4>
                  {wonHat.subtitle && (
                    <p className={`text-xs mt-1 text-center font-medium ${wonHat.subtitle.includes('анимировано') ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {wonHat.subtitle.startsWith('(') ? wonHat.subtitle : `(${wonHat.subtitle})`}
                    </p>
                  )}
                  <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mx-auto"
                    style={{
                      backgroundColor: `${RARITY_CONFIG[wonHat.rarity].accentColor}25`,
                      color: RARITY_CONFIG[wonHat.rarity].accentColor,
                      border: `1px solid ${RARITY_CONFIG[wonHat.rarity].accentColor}50`,
                    }}
                  >
                    <span>{RARITY_CONFIG[wonHat.rarity].label}</span>
                    <span>• {RARITY_CONFIG[wonHat.rarity].percent}% шанс</span>
                  </div>
                </div>

                <div className="pt-2 w-full flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleStartOpening}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-glow-white active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Крутить ещё раз</span>
                  </button>
                  {onBuy && (
                    <button
                      onClick={() => {
                        onClose();
                        onBuy();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-2 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Купить в игре ({price} ₽)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rarity Drop Rates Banner */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['common', 'rare', 'legendary'] as HatRarity[]).map((r) => {
                const config = RARITY_CONFIG[r];
                return (
                  <div
                    key={r}
                    className={`p-3 rounded-2xl ${config.bgColor} border ${config.borderColor} text-center space-y-0.5`}
                  >
                    <span className={`text-[10px] sm:text-xs font-bold uppercase block ${config.textColor}`}>
                      {config.shortLabel}
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-mono">
                      {config.percent}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons Toolbar */}
            {!wonHat && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartOpening}
                  disabled={isOpening}
                  className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-sm ${
                    isOpening
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-white hover:bg-neutral-200 text-black shadow-glow-white active:scale-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isOpening ? 'Открываем...' : 'Открыть коробку (Тест)'}</span>
                </button>

                {onBuy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuy();
                    }}
                    className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Купить ключ ({price} ₽)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: FULL COLLECTION OF 17 HATS                                */}
        {/* ================================================================= */}
        {activeTab === 'collection' && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {(['legendary', 'rare', 'common'] as HatRarity[]).map((rarityKey) => {
              const config = RARITY_CONFIG[rarityKey];
              const hatsOfRarity = HATS_LIST.filter((h) => h.rarity === rarityKey);

              return (
                <div key={rarityKey} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${config.textColor}`}>
                        {config.label}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        ({hatsOfRarity.length} шт.)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded-full bg-white/10">
                      Шанс {config.percent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {hatsOfRarity.map((hat) => {
                      const isAnimated =
                        hat.id === 'fire_red' ||
                        hat.id === 'fire_blue' ||
                        hat.id === 'propeller_cap' ||
                        hat.id === 'cigarette' ||
                        Boolean(hat.subtitle?.includes('анимировано'));

                      return (
                        <div
                          key={hat.id}
                          className={`p-3 sm:p-3.5 rounded-2xl bg-neutral-900/70 border ${config.borderColor} flex flex-col items-center justify-between text-center hover:bg-neutral-900/95 transition-all duration-200 hover:scale-[1.02] group`}
                        >
                          {/* Hat 3D Icon with Rarity Halo */}
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center my-1 flex-shrink-0">
                            <div
                              className="absolute inset-0 rounded-full blur-md opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
                              style={{ backgroundColor: config.accentColor }}
                            />
                            {hat.image ? (
                              <img
                                src={hat.image}
                                alt={hat.name}
                                className="max-w-full max-h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-200"
                              />
                            ) : (
                              <span className="text-3xl">{hat.emoji}</span>
                            )}
                          </div>

                          {/* Hat Title & Animated Label */}
                          <div className="w-full mt-2 flex flex-col items-center justify-center text-center">
                            <p className="text-xs sm:text-sm font-bold text-white text-center leading-snug">
                              {hat.name}
                            </p>
                            {isAnimated && (
                              <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-emerald-400 mt-1 whitespace-nowrap">
                                (анимировано)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
