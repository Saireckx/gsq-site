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
 * Базовый статистический вес шляпы исходя из её категории редкости:
 * - 70% на категорию обычных (7 шляп => 10.0% каждая)
 * - 25% на категорию редких (7 шляп => 3.5714% каждая)
 * - 5% на категорию легендарных (3 шляпы => 1.6667% каждая)
 */
export function getBaseHatWeight(hat: HatItem): number {
  const countOfRarity = HATS_LIST.filter((h) => h.rarity === hat.rarity).length;
  const categoryPercent = RARITY_CONFIG[hat.rarity]?.percent ?? 0;
  return countOfRarity > 0 ? categoryPercent / countOfRarity : 0;
}

/**
 * Получение пула доступных для выпадения шляп с защитой от повторок.
 * Если исключены не все шляпы — возвращаются оставшиеся.
 * Если собраны все 17 шляп — коллекция собрана на 100%, возвращается весь список для нового цикла.
 */
export function getDynamicDropPool(excludedHatIds: string[] = []): {
  availableHats: HatItem[];
  isCollectionFull: boolean;
} {
  const excludedSet = new Set(excludedHatIds);
  const remaining = HATS_LIST.filter((h) => !excludedSet.has(h.id));
  if (remaining.length === 0) {
    return { availableHats: HATS_LIST, isCollectionFull: true };
  }
  return { availableHats: remaining, isCollectionFull: false };
}

/**
 * Динамический расчет текущих шансов на каждую шляпу и категорию с учетом защиты от повторок:
 * Когда шляпа выпадает, ее шанс пропорционально перераспределяется между всеми оставшимися шляпами!
 */
export function getHatChances(excludedHatIds: string[] = []): {
  hatChances: Record<string, number>;
  rarityChances: Record<HatRarity, number>;
  totalRemaining: number;
  totalHats: number;
  isCollectionFull: boolean;
} {
  const { availableHats, isCollectionFull } = getDynamicDropPool(excludedHatIds);
  const totalWeight = availableHats.reduce((sum, h) => sum + getBaseHatWeight(h), 0);

  const hatChances: Record<string, number> = {};
  const rarityChances: Record<HatRarity, number> = {
    common: 0,
    rare: 0,
    legendary: 0,
  };

  const excludedSet = new Set(excludedHatIds);

  for (const hat of HATS_LIST) {
    const isExcluded = excludedSet.has(hat.id) && !isCollectionFull;
    if (isExcluded || totalWeight <= 0) {
      hatChances[hat.id] = 0;
    } else {
      const weight = getBaseHatWeight(hat);
      const percent = (weight / totalWeight) * 100;
      hatChances[hat.id] = percent;
      rarityChances[hat.rarity] += percent;
    }
  }

  return {
    hatChances,
    rarityChances,
    totalRemaining: isCollectionFull ? 0 : availableHats.length,
    totalHats: HATS_LIST.length,
    isCollectionFull,
  };
}

/**
 * Генератор выпадения БЕЗ ПОВТОРОК с пропорциональным распределением шансов:
 * Если переданы excludedHatIds (уже полученные шляпы), выпадает строго одна из оставшихся.
 * Шансы исключенных шляп автоматически и честно распределяются по остальным.
 */
export function getRandomHat(excludedHatIds: string[] = []): HatItem {
  const { availableHats } = getDynamicDropPool(excludedHatIds);
  const totalWeight = availableHats.reduce((sum, h) => sum + getBaseHatWeight(h), 0);

  if (totalWeight <= 0) {
    return availableHats[Math.floor(Math.random() * availableHats.length)] || HATS_LIST[0];
  }

  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (const hat of availableHats) {
    cumulative += getBaseHatWeight(hat);
    if (rand <= cumulative) {
      return hat;
    }
  }

  return availableHats[availableHats.length - 1];
}
