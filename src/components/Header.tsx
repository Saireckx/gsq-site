import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../lib/constants';
import { useStore } from '../context/StoreContext';
import { useServerStatus } from '../hooks/useServerStatus';
import { Menu, X, Wifi, Copy, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const { serverSettings } = useStore();
  const serverStatus = useServerStatus(serverSettings.ip, serverSettings.onlinePlayers, serverSettings.maxPlayers);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(serverSettings.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070709]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo + Status Dot matching requirement */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="GSQ Главная"
            title={serverStatus.isOnline ? `Сервер онлайн (${serverStatus.playersOnline} игроков)` : 'Сервер оффлайн'}
          >
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white group-hover:text-neutral-200 transition-colors drop-shadow-sm">
              GSQ
            </span>

            {/* Glowing Status Dot next to GSQ logo */}
            <span className="relative flex h-2.5 w-2.5">
              {serverStatus.isOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                </>
              ) : (
                <>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span>
                </>
              )}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08] shadow-glow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Real Server Status & Quick Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Server Online Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300">
            <span className="relative flex h-2 w-2">
              {serverStatus.isOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="font-medium">
              {serverStatus.isOnline ? (
                <>
                  <span className="text-white font-semibold font-mono">{serverStatus.playersOnline}</span>
                  <span className="text-neutral-500 font-mono"> / {serverStatus.maxPlayers}</span>
                  <span className="text-emerald-400 text-[10px] ml-1">онлайн</span>
                </>
              ) : (
                <span className="text-rose-400 text-[11px] font-medium">Оффлайн</span>
              )}
            </span>
          </div>

          {/* Quick Copy IP Button */}
          <button
            onClick={handleCopyIp}
            title="Скопировать IP сервера"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono text-neutral-200 hover:text-white transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-sans font-medium">Скопировано!</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-neutral-400" />
                <span>{serverSettings.ip}</span>
                <Copy className="w-3 h-3 text-neutral-400 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-neutral-300">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${serverStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-white font-mono font-medium">
              {serverStatus.isOnline ? serverStatus.playersOnline : 'off'}
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-mono">{serverSettings.ip}</span>
            <button
              onClick={handleCopyIp}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать IP'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
