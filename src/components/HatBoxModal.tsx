import React, { useState, useEffect, useRef } from 'react';
import { HATS_LIST, HatItem, RARITY_CONFIG, getRandomHat, HatRarity } from '../lib/boxHats';
import { X, Sparkles, Volume2, VolumeX, RotateCcw, Package, HelpCircle, ShoppingBag, Crown, Gem, Shield } from 'lucide-react';

interface HatBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  price?: number;
  availableBoxes?: number;
  onOpenSuccess?: () => void;
  onDropWon?: (hat: HatItem, isPaid: boolean) => void;
  onBuy?: () => void;
}

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

// Web Audio API: tactile mechanical roulette tick (soft, satisfying, zero double-strike)
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

    // Component 1: Warm tactile "thud" body (soft wooden ratchet click)
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

    // Component 2: Subtle micro-click attack
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

// Web Audio API: Melodic win chime (gentle bell notes)
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

const boxImg = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/box.png';

export const HatBoxModal: React.FC<HatBoxModalProps> = ({
  isOpen,
  onClose,
  price = 49,
  availableBoxes = 0,
  onOpenSuccess,
  onDropWon,
  onBuy,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'collection'>('open');
  const [isOpening, setIsOpening] = useState(false);
  const [isSpinningTransition, setIsSpinningTransition] = useState(false);
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

  const ITEM_WIDTH = 140; // width of item in roulette reel (px)
  const TARGET_INDEX = 38;

  const handleStartOpening = () => {
    if (isOpening) return;

    // 1. Clear any running timers immediately to prevent double sounds or overlapping loops
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    setIsOpening(true);
    setIsSpinningTransition(false);
    setWonHat(null);

    // Pick fair winner based on 70% common, 25% rare, 5% legendary
    const target = getRandomHat();
    const newReel = generateReel(target);
    setReel(newReel);
    setTranslateX(0);

    // Random small offset within target card so it doesn't always land at dead center
    // Card is 128px wide (-64 to +64 from its center). Offset between -18 and +18 stays well within card!
    const randomOffset = Math.floor(Math.random() * 36) - 18;

    // Sequential tick intervals perfectly matching the 4.8s cubic-bezier deceleration
    const tickIntervals = [
      65, 65, 65, 70, 70, 75, 80, 85, 95, 105,
      120, 135, 155, 180, 210, 250, 300, 360, 430, 520, 630, 760
    ];

    // Trigger roulette spin on next animation frame
    const t1 = setTimeout(() => {
      // Force DOM reflow so browser paints at translateX(0) before applying 4.8s transition
      if (reelContainerRef.current) {
        void reelContainerRef.current.offsetHeight;
      }

      // Dynamically measure actual rendered container width
      // This ensures target item (TARGET_INDEX = 38) lands exactly under the center indicator
      // on mobile (320px-390px), tablets, and desktops alike.
      const containerWidth = reelContainerRef.current?.offsetWidth || (window.innerWidth < 640 ? Math.max(window.innerWidth - 64, 280) : 560);
      const cardCenter = TARGET_INDEX * ITEM_WIDTH + (ITEM_WIDTH - 12) / 2;
      const finalDistance = Math.round(cardCenter - containerWidth / 2 + randomOffset);

      setIsSpinningTransition(true);
      setTranslateX(finalDistance);

      // Play tick sounds along the deceleration curve without any overlapping or doubling
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

    // Stop and display win after 4.85 seconds
    const t2 = setTimeout(() => {
      setWonHat(target);
      setIsOpening(false);
      setIsSpinningTransition(false);
      playWinSound(audioContextRef, target.rarity, soundEnabled);
      if (onOpenSuccess) {
        onOpenSuccess();
      }
      if (onDropWon) {
        onDropWon(target, (availableBoxes || 0) > 0);
      }
    }, 4900);

    timerRef.current.push(t1, t2);
  };

  const handleReset = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setIsOpening(false);
    setWonHat(null);
    setTranslateX(0);
  };

  return (
    <div
      onClick={() => {
        if (!isOpening) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-[#0e111a] border border-white/15 p-5 sm:p-8 shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 flex-shrink-0">
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
                17 уникальных головных уборов и аксессуаров
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
              onClick={() => {
                if (!isOpening) onClose();
              }}
              disabled={isOpening}
              className={`p-2 rounded-xl transition-colors ${
                isOpening ? 'opacity-30 cursor-not-allowed text-neutral-600' : 'bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Open / Collection) */}
        <div className="flex items-center gap-2 mt-4 mb-5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('open')}
            disabled={isOpening}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'open'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            } ${isOpening ? 'opacity-80' : ''}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isOpening ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isOpening ? 'Крутится рулетка...' : 'Рулетка открытия'}</span>
            {wonHat && !isOpening && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            disabled={isOpening}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'collection'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            } ${isOpening ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={isOpening ? 'Дождитесь завершения открытия' : 'Содержимое кейса'}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Содержимое кейса (17 шт.)</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: ROULETTE OPENING INTERFACE                                 */}
        {/* ================================================================= */}
        <div className={`space-y-6 overflow-y-auto pr-1 ${activeTab === 'open' ? 'block' : 'hidden'}`}>
          {/* MAIN STAGE: If not won yet, show Box or Roulette Reel */}
          {!wonHat ? (
            <div className="relative rounded-2xl bg-[#080a10] border border-white/10 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
              {!isOpening ? (
                /* Idle Stage: Loot Crate View */
                <div className="text-center space-y-4 animate-in fade-in duration-300">
                  <div className="relative inline-block group">
                    <img
                      src={boxImg}
                      alt="Коробка со шляпой"
                      className="relative w-48 sm:w-56 h-auto mx-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-300"
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
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-amber-400 z-10 pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.9)]" />

                    {/* Edge Darkening Vignette */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080a10] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080a10] to-transparent z-10 pointer-events-none" />

                    {/* Roulette Track */}
                    <div
                      ref={reelContainerRef}
                      className="overflow-hidden w-full relative py-2"
                    >
                      <div
                        className="flex items-center gap-3"
                        style={{
                          transform: `translateX(-${translateX}px)`,
                          transition: isSpinningTransition ? 'transform 4.8s cubic-bezier(0.12, 0.8, 0.33, 1)' : 'none',
                        }}
                      >
                        {reel.map((hat, idx) => {
                          const config = RARITY_CONFIG[hat.rarity];
                          return (
                            <div
                              key={idx}
                              style={{ width: `${ITEM_WIDTH - 12}px` }}
                              className="flex-shrink-0 rounded-2xl bg-[#141724] border border-white/10 flex flex-col items-center justify-between overflow-hidden shadow-lg relative h-36"
                            >
                              <div className="w-full flex-1 flex items-center justify-center p-2">
                                {hat.image ? (
                                  <img
                                    src={hat.image}
                                    alt={hat.name}
                                    className={`w-16 h-16 object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] ${hat.scale || ''}`}
                                  />
                                ) : (
                                  <span className="text-3xl filter drop-shadow">{hat.emoji}</span>
                                )}
                              </div>
                              <div className="w-full py-2 px-1 bg-black/40 text-center">
                                <span className="text-[11px] font-bold text-white truncate block px-1">
                                  {hat.name}
                                </span>
                                <span className={`text-[9px] uppercase font-semibold ${config.textColor}`}>
                                  {config.shortLabel}
                                </span>
                              </div>
                              {/* Rarity Bottom Stripe */}
                              <div className={`h-1 w-full ${config.barColor}`} />
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
              <div className="relative rounded-3xl bg-[#121520] border-2 border-white/20 p-8 flex flex-col items-center justify-center text-center space-y-5 overflow-hidden animate-in zoom-in-90 duration-300 shadow-2xl">
                {/* Radial Glow matching Rarity Color */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${RARITY_CONFIG[wonHat.rarity].accentColor} 0%, transparent 70%)`,
                  }}
                />

                <div className="w-full text-center text-xs uppercase font-bold tracking-wider text-neutral-400">
                  🎉 Поздравляем! Ваш выигрыш:
                </div>

                {/* Big Hat Image / Icon */}
                <div className="relative flex items-center justify-center py-2 my-1 w-full">
                  <div
                    className="absolute w-40 h-40 rounded-full blur-2xl opacity-60 pointer-events-none"
                    style={{ backgroundColor: RARITY_CONFIG[wonHat.rarity].accentColor }}
                  />
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)] animate-bounce duration-1000">
                    {wonHat.image ? (
                      <img
                        src={wonHat.image}
                        alt={wonHat.name}
                        className={`max-w-full max-h-full object-contain filter drop-shadow ${wonHat.scale || ''}`}
                      />
                    ) : (
                      <span className="text-7xl sm:text-8xl">{wonHat.emoji}</span>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center text-center space-y-2">
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
                    {wonHat.name}
                  </h4>
                  {wonHat.subtitle && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>{wonHat.subtitle}</span>
                    </span>
                  )}
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mx-auto"
                    style={{
                      backgroundColor: `${RARITY_CONFIG[wonHat.rarity].accentColor}20`,
                      color: RARITY_CONFIG[wonHat.rarity].accentColor,
                      border: `1px solid ${RARITY_CONFIG[wonHat.rarity].accentColor}40`,
                    }}
                  >
                    <span>{RARITY_CONFIG[wonHat.rarity].label}</span>
                    <span>• {RARITY_CONFIG[wonHat.rarity].percent}% шанс</span>
                  </div>
                </div>

                <div className="pt-2 w-full flex flex-wrap items-center justify-center gap-3">
                  {availableBoxes > 0 && (
                    <button
                      onClick={handleStartOpening}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-glow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Открыть следующую (осталось {availableBoxes} шт.)</span>
                    </button>
                  )}
                  {onBuy && (
                    <button
                      onClick={() => {
                        onClose();
                        onBuy();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-2 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{availableBoxes > 0 ? 'Купить ещё' : 'Купить коробку'} ({price} ₽)</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 active:scale-95"
                  >
                    <span>Закрыть</span>
                  </button>
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
                {availableBoxes > 0 ? (
                  <button
                    type="button"
                    onClick={handleStartOpening}
                    disabled={isOpening}
                    className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-sm ${
                      isOpening
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black shadow-glow-lg active:scale-95'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>{isOpening ? 'Открываем...' : `🎁 Открыть коробку (${availableBoxes} шт.)`}</span>
                  </button>
                ) : (
                  onBuy && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBuy();
                      }}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm transition-all shadow-glow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Купить коробку ({price} ₽)</span>
                    </button>
                  )
                )}

                {availableBoxes > 0 && onBuy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuy();
                    }}
                    className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 active:scale-95 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Купить ещё ({price} ₽)</span>
                  </button>
                )}
              </div>
            )}
          </div>

        {/* ================================================================= */}
        {/* TAB 2: FULL COLLECTION OF 17 HATS (Clean Gaming Inventory Cards)  */}
        {/* ================================================================= */}
        <div className={`space-y-6 overflow-y-auto pr-1 flex-1 ${activeTab === 'collection' ? 'block' : 'hidden'}`}>
            {(['legendary', 'rare', 'common'] as HatRarity[]).map((rarityKey) => {
              const config = RARITY_CONFIG[rarityKey];
              const hatsOfRarity = HATS_LIST.filter((h) => h.rarity === rarityKey);

              const RarityIcon = rarityKey === 'legendary' ? Crown : rarityKey === 'rare' ? Gem : Shield;

              return (
                <div key={rarityKey} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <RarityIcon className={`w-4 h-4 ${config.textColor}`} />
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        {rarityKey === 'legendary'
                          ? 'Легендарные предметы'
                          : rarityKey === 'rare'
                          ? 'Редкие предметы'
                          : 'Обычные предметы'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        ({hatsOfRarity.length} шт.)
                      </span>
                    </div>

                    <span
                      className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${config.accentColor}18`,
                        color: config.accentColor,
                        border: `1px solid ${config.accentColor}35`,
                      }}
                    >
                      Шанс {config.percent}%
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {hatsOfRarity.map((hat) => {
                      const isAnimated = Boolean(hat.subtitle?.includes('Анимировано') || hat.subtitle?.includes('анимировано'));

                      return (
                        <div
                          key={hat.id}
                          className="relative rounded-2xl bg-[#131622] hover:bg-[#181c2b] border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm group hover:-translate-y-0.5"
                        >
                          {/* Animated Badge (Top Right) */}
                          {isAnimated && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-md shadow-sm">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Анимация</span>
                              </span>
                            </div>
                          )}

                          {/* 3D Hat Image Viewport */}
                          <div className="w-full h-24 sm:h-28 flex items-center justify-center p-3 relative">
                            {/* Subtle Radial Ambient */}
                            <div
                              className="absolute inset-2 rounded-full blur-xl opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none"
                              style={{ backgroundColor: config.accentColor }}
                            />

                            {hat.image ? (
                              <img
                                src={hat.image}
                                alt={hat.name}
                                className={`w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform duration-200 relative z-10 ${hat.scale || ''}`}
                              />
                            ) : (
                              <span className="text-4xl filter drop-shadow relative z-10">{hat.emoji}</span>
                            )}
                          </div>

                          {/* Hat Title Card Footer */}
                          <div className="p-2.5 pt-0 text-center flex flex-col items-center justify-center">
                            <p className="text-xs sm:text-sm font-bold text-white text-center leading-snug">
                              {hat.name}
                            </p>
                          </div>

                          {/* Bottom Rarity Accent Bar */}
                          <div className={`h-1 w-full ${config.barColor}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};
