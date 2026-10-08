export type HatRarity = 'common' | 'rare' | 'legendary';

export interface HatItem {
  id: string;
  name: string;
  rarity: HatRarity;
  emoji: string;
  subtitle?: string;
}

export const RARITY_CONFIG = {
  common: {
    label: 'Базовая редкость',
    shortLabel: 'Обычная',
    percent: 60,
    textColor: 'text-sky-300',
    borderColor: 'border-sky-500/40',
    bgColor: 'bg-sky-500/10',
    glow: 'rgba(56, 189, 248, 0.4)',
    accentColor: '#38bdf8',
  },
  rare: {
    label: 'Редкая редкость',
    shortLabel: 'Редкая',
    percent: 32,
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-500/15',
    glow: 'rgba(168, 85, 247, 0.5)',
    accentColor: '#a855f7',
  },
  legendary: {
    label: 'Легендарная редкость',
    shortLabel: 'Легендарная',
    percent: 8,
    textColor: 'text-amber-300',
    borderColor: 'border-amber-400',
    bgColor: 'bg-amber-500/20',
    glow: 'rgba(245, 158, 11, 0.7)',
    accentColor: '#f59e0b',
  },
};

export const HATS_LIST: HatItem[] = [
  // Базовая редкость (60%)
  { id: 'sombrero', name: 'Сомбреро', rarity: 'common', emoji: '👒' },
  { id: 'mushroom_hat', name: 'Грибная шляпа', rarity: 'common', emoji: '🍄' },
  { id: 'toad', name: 'Жаба', rarity: 'common', emoji: '🐸' },
  { id: 'beer_helmet', name: 'Пивной шлем', rarity: 'common', emoji: '🍺' },
  { id: 'gold_crown', name: 'Золотая корона', rarity: 'common', emoji: '👑' },
  { id: 'ushanka', name: 'Шапка ушанка', rarity: 'common', emoji: '🪆', subtitle: 'аккуратная' },
  { id: 'welder_mask', name: 'Сварочная маска', rarity: 'common', emoji: '🥽' },

  // Редкая редкость (32%)
  { id: 'mlg_glasses', name: 'MLG очки', rarity: 'rare', emoji: '🕶️', subtitle: 'стильные' },
  { id: 'fire_red', name: 'Огонь на голове (красный)', rarity: 'rare', emoji: '🔥' },
  { id: 'fire_blue', name: 'Огонь на голове (синий)', rarity: 'rare', emoji: '💠' },
  { id: 'bear_hat', name: 'Медвежья шапка', rarity: 'rare', emoji: '🐻', subtitle: 'теплая' },
  { id: 'fox_hat', name: 'Лисья шапка', rarity: 'rare', emoji: '🦊', subtitle: 'пушистая' },
  { id: 'propeller_cap', name: 'Кепка с пропеллером', rarity: 'rare', emoji: '🧢' },
  { id: 'kabuto_helmet', name: 'Шлем «кабуто»', rarity: 'rare', emoji: '🥷' },

  // Легендарная редкость (8%)
  { id: 'halo', name: 'нимб', rarity: 'legendary', emoji: '😇', subtitle: 'священный ореол' },
  { id: 'cigarette', name: 'сигарета', rarity: 'legendary', emoji: '🚬', subtitle: 'культовый стиль' },
  { id: 'altyn_helmet', name: 'шлем «Алтын»', rarity: 'legendary', emoji: '🪖', subtitle: 'легендарная защита' },
];

/**
 * Честный генератор выпадения согласно процентам (60% обычные, 32% редкие, 8% лег)
 */
export function getRandomHat(): HatItem {
  const rand = Math.random() * 100;
  let chosenRarity: HatRarity = 'common';

  if (rand < 8) {
    // 8% Легендарная
    chosenRarity = 'legendary';
  } else if (rand < 8 + 32) {
    // 32% Редкая
    chosenRarity = 'rare';
  } else {
    // 60% Базовая
    chosenRarity = 'common';
  }

  const candidates = HATS_LIST.filter((h) => h.rarity === chosenRarity);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
