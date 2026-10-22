import { HatItem, HATS_LIST, getRandomHat } from './boxHats';

export interface GiftLinkItem {
  id: string;
  token: string;
  nickname?: string;
  totalBoxes: number;
  remainingBoxes: number;
  wonHats: HatItem[];
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  note?: string;
  isRevoked?: boolean;
}

const STORAGE_KEY = 'gsq_gift_links';
const CLAIM_PREFIX = 'gsq_gift_claim_';

// Simple base64url encoding/decoding helper that handles UTF-8
function base64UrlEncode(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return btoa(encodeURIComponent(str)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(atob(base64));
  }
}

// Simple checksum to verify token integrity
function generateChecksum(payload: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Creates a unique smart-token for a gift link
 */
export function createGiftToken(data: {
  id: string;
  nickname?: string;
  totalBoxes: number;
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  note?: string;
}): string {
  const payload = JSON.stringify({
    i: data.id,
    n: data.nickname || '',
    b: data.totalBoxes,
    c: data.createdAt,
    e: data.expiresAt,
    d: data.durationMinutes,
    s: Math.random().toString(36).substring(2, 8),
  });
  const encoded = base64UrlEncode(payload);
  const checksum = generateChecksum(payload);
  return `gsq_${encoded}_${checksum}`;
}

/**
 * Decodes and validates a smart-token
 */
export function parseGiftToken(token: string): Partial<GiftLinkItem> | null {
  if (!token || !token.startsWith('gsq_')) return null;
  const parts = token.split('_');
  if (parts.length < 3) return null;

  try {
    const encoded = parts[1];
    const checksum = parts[2];
    const raw = base64UrlDecode(encoded);
    const expectedChecksum = generateChecksum(raw);

    if (checksum !== expectedChecksum) {
      console.warn('[GiftLink] Invalid token checksum');
      return null;
    }

    const parsed = JSON.parse(raw);
    return {
      id: parsed.i,
      token,
      nickname: parsed.n || undefined,
      totalBoxes: Number(parsed.b) || 1,
      createdAt: Number(parsed.c) || Date.now(),
      expiresAt: Number(parsed.e) || (Date.now() + 15 * 60 * 1000),
      durationMinutes: Number(parsed.d) || 15,
    };
  } catch (err) {
    console.error('[GiftLink] Failed to parse token:', err);
    return null;
  }
}

/**
 * Get all gift links saved in localStorage (admin view)
 */
export function getLocalGiftLinks(): GiftLinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: GiftLinkItem[] = JSON.parse(raw);
    if (Array.isArray(list)) return list;
  } catch {}
  return [];
}

/**
 * Save a new gift link to localStorage
 */
export function saveLocalGiftLink(link: GiftLinkItem): void {
  try {
    const current = getLocalGiftLinks();
    const filtered = current.filter((item) => item.id !== link.id && item.token !== link.token);
    filtered.unshift(link);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Update an existing gift link in localStorage
 */
export function updateLocalGiftLink(idOrToken: string, updates: Partial<GiftLinkItem>): void {
  try {
    const current = getLocalGiftLinks();
    const idx = current.findIndex((item) => item.id === idOrToken || item.token === idOrToken);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch {}
}

/**
 * Delete a gift link from localStorage
 */
export function deleteLocalGiftLink(idOrToken: string): void {
  try {
    const current = getLocalGiftLinks();
    const filtered = current.filter((item) => item.id !== idOrToken && item.token !== idOrToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Get local claim state for a specific token (player session)
 */
export function getLocalClaimState(token: string): {
  wonHats: HatItem[];
  remainingBoxes: number;
  totalBoxes: number;
} | null {
  try {
    const raw = localStorage.getItem(`${CLAIM_PREFIX}${token}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.wonHats)) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Save local claim state for a specific token
 */
export function saveLocalClaimState(
  token: string,
  state: { wonHats: HatItem[]; remainingBoxes: number; totalBoxes: number }
): void {
  try {
    localStorage.setItem(`${CLAIM_PREFIX}${token}`, JSON.stringify(state));
  } catch {}
}

/**
 * Build full shareable URL for a token
 */
export function getGiftLinkUrl(token: string): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/+$/, '');
  return `${origin}${pathname}/#/box?token=${encodeURIComponent(token)}`;
}

/**
 * Build Discord-ready message for copying
 */
export function getDiscordMessage(link: GiftLinkItem): string {
  const url = getGiftLinkUrl(link.token);
  const nick = link.nickname ? `👤 Никнейм: **${link.nickname}**\n` : '';
  const note = link.note ? `📝 Примечание: *${link.note}*\n` : '';

  return `🎁 **Ваша коробка со шляпами GSQ!**
${nick}📦 Доступно коробок: **${link.totalBoxes} шт.**
⏳ Срок действия ссылки: **${link.durationMinutes} минут**
${note}🔗 **Ссылка для открытия:**
${url}

*Перейдите по ссылке и откройте кейсы — выбитые шляпы сразу отобразятся на экране!*`;
}
