import { useState, useEffect, useCallback } from 'react';

interface ServerStatusResult {
  isOnline: boolean;
  playersOnline: number;
  maxPlayers: number;
  loading: boolean;
  motd?: string;
  refresh: () => void;
}

export function useServerStatus(ip: string, fallbackOnline = 0, fallbackMax = 100): ServerStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [playersOnline, setPlayersOnline] = useState<number>(fallbackOnline);
  const [maxPlayers, setMaxPlayers] = useState<number>(fallbackMax);
  const [loading, setLoading] = useState<boolean>(true);
  const [motd, setMotd] = useState<string | undefined>(undefined);

  const checkStatus = useCallback(async () => {
    if (!ip) return;
    setLoading(true);

    try {
      // Standard Minecraft Server Status API
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
          setPlayersOnline(data.players?.online ?? 0);
          setMaxPlayers(data.players?.max ?? 100);
          if (data.motd?.clean) {
            setMotd(Array.isArray(data.motd.clean) ? data.motd.clean.join(' ') : data.motd.clean);
          }
        } else {
          setIsOnline(false);
          setPlayersOnline(0);
        }
      } else {
        // Keep fallback
        setIsOnline(false);
      }
    } catch {
      // On network timeout / offline
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [ip]);

  useEffect(() => {
    checkStatus();

    // Recheck status every 45 seconds
    const interval = setInterval(checkStatus, 45000);
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
