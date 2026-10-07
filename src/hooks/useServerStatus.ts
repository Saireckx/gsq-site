import { useState, useEffect, useCallback } from 'react';

export interface ServerStatusResult {
  isOnline: boolean;
  playersOnline: number;
  maxPlayers: number | null;
  loading: boolean;
  motd?: string;
  refresh: () => void;
}

export function useServerStatus(ip: string): ServerStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [playersOnline, setPlayersOnline] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [motd, setMotd] = useState<string | undefined>(undefined);

  const checkStatus = useCallback(async () => {
    if (!ip) return;
    setLoading(true);

    // 1. Try mcstatus.io (fast, supports port & SRV, real-time)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.online) {
          setIsOnline(true);
          const rawOnline = typeof data.players?.online === 'number' ? data.players.online : 0;
          const rawMax = typeof data.players?.max === 'number' ? data.players.max : null;

          // If server reports -1 (e.g. proxy maintenance mode), treat as 0 real players
          setPlayersOnline(rawOnline > 0 ? rawOnline : 0);
          setMaxPlayers(rawMax && rawMax > 0 ? rawMax : null);

          if (data.motd?.clean) {
            setMotd(data.motd.clean);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to mcsrvstat.us
    }

    // 2. Fallback to mcsrvstat.us
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`, {
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
          setMaxPlayers(rawMax && rawMax > 0 ? rawMax : null);

          if (data.motd?.clean) {
            setMotd(Array.isArray(data.motd.clean) ? data.motd.clean.join(' ') : data.motd.clean);
          }
          setLoading(false);
          return;
        }
      }
      setIsOnline(false);
      setPlayersOnline(0);
      setMaxPlayers(null);
    } catch {
      setIsOnline(false);
      setPlayersOnline(0);
      setMaxPlayers(null);
    } finally {
      setLoading(false);
    }
  }, [ip]);

  useEffect(() => {
    checkStatus();

    // Recheck status every 30 seconds for live player count
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    isOnline,
    playersOnline,
    maxPlayers,
    loading,
    motd,
    refresh: checkStatus,
  };
}
