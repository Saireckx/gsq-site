export type HatRarity = 'common' | 'rare' | 'legendary';

export interface HatItem {
  id: string;
  name: string;
  rarity: HatRarity;
  emoji: string;
  image?: string;
  subtitle?: string;
  scale?: string;
}

export const RARITY_CONFIG = {
  common: {
    label: 'Обычная редкость',
    shortLabel: 'Обычная',
    percent: 70,
    textColor: 'text-sky-300',
    borderColor: 'border-sky-500/30',
    bgColor: 'bg-sky-500/10',
    glow: 'rgba(56, 189, 248, 0.4)',
    accentColor: '#38bdf8',
    barColor: 'bg-sky-400',
  },
  rare: {
    label: 'Редкая редкость',
    shortLabel: 'Редкая',
    percent: 25,
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    glow: 'rgba(168, 85, 247, 0.5)',
    accentColor: '#a855f7',
    barColor: 'bg-purple-500',
  },
  legendary: {
    label: 'Легендарная редкость',
    shortLabel: 'Легендарная',
    percent: 5,
    textColor: 'text-amber-300',
    borderColor: 'border-amber-400/50',
    bgColor: 'bg-amber-500/15',
    glow: 'rgba(245, 158, 11, 0.7)',
    accentColor: '#f59e0b',
    barColor: 'bg-gradient-to-r from-amber-400 to-yellow-300',
  },
};

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/';

export const HATS_LIST: HatItem[] = [
  // Базовая редкость (70%)
  { id: 'sombrero', name: 'Сомбреро', rarity: 'common', emoji: '👒', image: `${baseUrl}hats/sombrero.png`, scale: 'scale-105' },
  { id: 'mushroom_hat', name: 'Грибная шляпа', rarity: 'common', emoji: '🍄', image: `${baseUrl}hats/mushroom_hat.png`, scale: 'scale-100' },
  { id: 'toad', name: 'Жаба', rarity: 'common', emoji: '🐸', image: `${baseUrl}hats/toad.png`, scale: 'scale-100' },
  { id: 'beer_helmet', name: 'Пивной шлем', rarity: 'common', emoji: '🍺', image: `${baseUrl}hats/beer_helmet.png`, scale: 'scale-105' },
  { id: 'gold_crown', name: 'Золотая корона', rarity: 'common', emoji: '👑', image: `${baseUrl}hats/gold_crown.png`, scale: 'scale-100' },
  { id: 'ushanka', name: 'Шапка-ушанка', rarity: 'common', emoji: '🪆', image: `${baseUrl}hats/ushanka.png`, scale: 'scale-95' },
  { id: 'welder_mask', name: 'Сварочная маска', rarity: 'common', emoji: '🥽', image: `${baseUrl}hats/welder_mask.png`, scale: 'scale-100' },

  // Редкая редкость (25%)
  { id: 'altyn_helmet', name: 'Шлем «Алтын»', rarity: 'rare', emoji: '🪖', image: `${baseUrl}hats/altyn_helmet.png`, scale: 'scale-105' },
  { id: 'fire_red', name: 'Огонь на голове (красный)', rarity: 'rare', emoji: '🔥', subtitle: 'Анимировано', image: `${baseUrl}hats/fire_red.png`, scale: 'scale-105' },
  { id: 'fire_blue', name: 'Огонь на голове (синий)', rarity: 'rare', emoji: '💠', subtitle: 'Анимировано', image: `${baseUrl}hats/fire_blue.png`, scale: 'scale-105' },
  { id: 'bear_hat', name: 'Медвежья шапка', rarity: 'rare', emoji: '🐻', image: `${baseUrl}hats/bear_hat.png`, scale: 'scale-95' },
  { id: 'fox_hat', name: 'Лисья шапка', rarity: 'rare', emoji: '🦊', image: `${baseUrl}hats/fox_hat.png`, scale: 'scale-95' },
  { id: 'propeller_cap', name: 'Кепка с пропеллером', rarity: 'rare', emoji: '🧢', subtitle: 'Анимировано', image: `${baseUrl}hats/propeller_cap.png`, scale: 'scale-100' },
  { id: 'kabuto_helmet', name: 'Шлем «Кабуто»', rarity: 'rare', emoji: '🥷', image: `${baseUrl}hats/kabuto_helmet.png`, scale: 'scale-105' },

  // Легендарная редкость (5%)
  { id: 'halo', name: 'Нимб', rarity: 'legendary', emoji: '😇', image: `${baseUrl}hats/halo.png`, scale: 'scale-125' },
  { id: 'cigarette', name: 'Сигарета', rarity: 'legendary', emoji: '🚬', subtitle: 'Анимировано', image: `${baseUrl}hats/cigarette.png`, scale: 'scale-[1.6]' },
  { id: 'mlg_glasses', name: 'MLG очки', rarity: 'legendary', emoji: '🕶️', image: `${baseUrl}hats/mlg_glasses.png`, scale: 'scale-135' },
];

/**
 * Честный генератор выпадения согласно процентам (70% обычные, 25% редкие, 5% лег)
 */
export function getRandomHat(): HatItem {
  const rand = Math.random() * 100;
  let chosenRarity: HatRarity = 'common';

  if (rand < 5) {
    // 5% Легендарная
    chosenRarity = 'legendary';
  } else if (rand < 5 + 25) {
    // 25% Редкая
    chosenRarity = 'rare';
  } else {
    // 70% Базовая
    chosenRarity = 'common';
  }

  const candidates = HATS_LIST.filter((h) => h.rarity === chosenRarity);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
