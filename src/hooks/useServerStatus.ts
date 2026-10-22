import { useState, useEffect, useCallback } from 'react';

export interface PlayerInfo {
  name: string;
  uuid?: string;
  world?: string;
}

export interface ServerStatusResult {
  isOnline: boolean;
  playersOnline: number;
  maxPlayers: number | null;
  loading: boolean;
  motd?: string;
  players: PlayerInfo[];
  refresh: () => void;
}

const CACHE_KEY = 'gsq_server_status_cache';

function getCachedStatus(): { isOnline: boolean; playersOnline: number; maxPlayers: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data.playersOnline === 'number') return data;
    }
  } catch {}
  return null;
}

function setCachedStatus(data: { isOnline: boolean; playersOnline: number; maxPlayers: number }) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function useServerStatus(ip: string): ServerStatusResult {
  const cached = getCachedStatus();
  const [isOnline, setIsOnline] = useState<boolean>(cached?.isOnline ?? true);
  const [playersOnline, setPlayersOnline] = useState<number>(cached?.playersOnline ?? 30);
  const [maxPlayers, setMaxPlayers] = useState<number | null>(cached?.maxPlayers ?? 100);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [motd, setMotd] = useState<string | undefined>(undefined);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  const checkStatus = useCallback(async () => {
    const cleanHost = (ip || 'play.mygsq.fun').trim();

    // 1. Primary Check: api.mcstatus.io (Fast, reliable, native CORS)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(cleanHost)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.online) {
          const count = typeof data.players?.online === 'number' ? data.players.online : 0;
          const max = typeof data.players?.max === 'number' ? data.players.max : 100;
          setIsOnline(true);
          setPlayersOnline(count);
          setMaxPlayers(max);
          setCachedStatus({ isOnline: true, playersOnline: count, maxPlayers: max });

          if (Array.isArray(data.players?.list)) {
            setPlayers(
              data.players.list.map((p: any) => ({
                name: typeof p === 'string' ? p : p.name_clean || p.name,
              }))
            );
          }

          if (data.motd?.clean) {
            setMotd(data.motd.clean);
          }
          setLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Secondary Fallback: api.mcsrvstat.us
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(cleanHost)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.online) {
          const count = typeof data.players?.online === 'number' ? data.players.online : 0;
          const max = typeof data.players?.max === 'number' ? data.players.max : 100;
          setIsOnline(true);
          setPlayersOnline(count);
          setMaxPlayers(max);
          setCachedStatus({ isOnline: true, playersOnline: count, maxPlayers: max });

          if (Array.isArray(data.players?.list)) {
            setPlayers(data.players.list.map((p: any) => ({ name: typeof p === 'string' ? p : p.name })));
          }

          if (data.motd?.clean) {
            setMotd(Array.isArray(data.motd.clean) ? data.motd.clean.join(' ') : data.motd.clean);
          }
          setLoading(false);
          return;
        }
      }
    } catch {}

    // 3. Fallback check with port 25605 if SRV record had issues
    try {
      const hostWithPort = cleanHost.includes(':') ? cleanHost : `${cleanHost}:25605`;
      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(hostWithPort)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.online) {
          const count = typeof data.players?.online === 'number' ? data.players.online : 0;
          const max = typeof data.players?.max === 'number' ? data.players.max : 100;
          setIsOnline(true);
          setPlayersOnline(count);
          setMaxPlayers(max);
          setCachedStatus({ isOnline: true, playersOnline: count, maxPlayers: max });
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Only if all three fast checks fail, mark offline
    setIsOnline(false);
    setPlayersOnline(0);
    setLoading(false);
  }, [ip]);

  useEffect(() => {
    checkStatus();

    // Recheck status every 15 seconds
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    isOnline,
    playersOnline,
    maxPlayers,
    loading,
    motd,
    players,
    refresh: checkStatus,
  };
}
