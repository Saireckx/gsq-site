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

const SQUAREMAP_URL = 'https://map.mygsq.fun/tiles/players.json';
// Fallback CORS proxy in case the browser enforces strict cross-origin restrictions
const SQUAREMAP_CORS_PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(SQUAREMAP_URL);

export function useServerStatus(ip: string): ServerStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [playersOnline, setPlayersOnline] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [motd, setMotd] = useState<string | undefined>(undefined);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  const checkStatus = useCallback(async () => {
    setLoading(true);

    // 1. Primary: Squaremap Realtime Players (Zero-delay direct from server)
    const squaremapEndpoints = [SQUAREMAP_URL, SQUAREMAP_CORS_PROXY];
    for (const url of squaremapEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.players)) {
            setIsOnline(true);
            setPlayersOnline(data.players.length);
            setMaxPlayers(typeof data.max === 'number' && data.max > 0 ? data.max : 100);
            setPlayers(
              data.players.map((p: any) => ({
                name: p.name || 'Player',
                uuid: p.uuid,
                world: p.world,
              }))
            );
            setLoading(false);
            return;
          }
        }
      } catch {
        // Continue to fallback
      }
    }

    // 2. Secondary Fallback: mcstatus.io (with auto port 25605)
    const cleanIp = ip ? (ip.includes(':') ? ip : `${ip}:25605`) : 'play.mygsq.fun:25605';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(cleanIp)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.online) {
          setIsOnline(true);
          const rawOnline = typeof data.players?.online === 'number' ? data.players.online : 0;
          const rawMax = typeof data.players?.max === 'number' ? data.players.max : null;

          setPlayersOnline(rawOnline > 0 ? rawOnline : 0);
          setMaxPlayers(rawMax && rawMax > 0 ? rawMax : 100);
          if (Array.isArray(data.players?.list)) {
            setPlayers(
              data.players.list.map((p: any) => ({
                name: typeof p === 'string' ? p : p.name_clean || p.name,
              }))
            );
          } else {
            setPlayers([]);
          }

          if (data.motd?.clean) {
            setMotd(data.motd.clean);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      // Continue to mcsrvstat.us
    }

    // 3. Third Fallback: mcsrvstat.us
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(cleanIp)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.online) {
          setIsOnline(true);
          const rawOnline = typeof data.players?.online === 'number' ? data.players.online : 0;
          const rawMax = typeof data.players?.max === 'number' ? data.players.max : null;

          setPlayersOnline(rawOnline > 0 ? rawOnline : 0);
          setMaxPlayers(rawMax && rawMax > 0 ? rawMax : 100);
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
    } catch {
      // All endpoints failed
    }

    setIsOnline(false);
    setPlayersOnline(0);
    setMaxPlayers(null);
    setPlayers([]);
    setLoading(false);
  }, [ip]);

  useEffect(() => {
    checkStatus();

    // Recheck status every 10 seconds for real-time Squaremap synchronization
    const interval = setInterval(checkStatus, 10000);
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
