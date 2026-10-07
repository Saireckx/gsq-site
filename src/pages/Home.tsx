import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVER_INFO, SERVER_FEATURES } from '../lib/constants';
import { useStore } from '../context/StoreContext';
import { useServerStatus } from '../hooks/useServerStatus';
import { CopyIpButton } from '../components/CopyIpButton';
import { 
  Box, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Mic, 
  Coins, 
  Pickaxe, 
  Ticket,
  BookOpen, 
  ShoppingBag,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Disc as DiscordIcon,
  Wifi
} from 'lucide-react';

export const Home: React.FC = () => {
  const { serverSettings } = useStore();
  const serverStatus = useServerStatus(serverSettings.ip);

  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const handleCopy = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const iconMap: Record<string, React.ReactNode> = {
    Pickaxe: <Pickaxe className="w-6 h-6 text-neutral-300" />,
    Mic: <Mic className="w-6 h-6 text-neutral-300" />,
    Coins: <Coins className="w-6 h-6 text-neutral-300" />,
    Ticket: <Ticket className="w-6 h-6 text-neutral-300" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-neutral-300" />,
    Users: <Users className="w-6 h-6 text-neutral-300" />,
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Hero with Dark Minecraft Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.04] blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/70 via-[#070709]/85 to-[#070709]" />
      </div>

      {/* Slide 1: Main Hero Section */}
      <section className="relative z-10 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Online Indicator Pill (Real live status) */}
          <div className="flex items-center justify-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-glow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {serverStatus.isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
              </span>
              <span className="text-xs font-semibold text-neutral-300">
                {serverStatus.isOnline ? (
                  <>
                    Сервер онлайн: <span className="text-white font-mono">{serverStatus.playersOnline}</span>
                    {serverStatus.maxPlayers && serverStatus.maxPlayers > 0 ? ` из ${serverStatus.maxPlayers}` : ' игроков'}
                  </>
                ) : (
                  <span className="text-rose-400">Сервер оффлайн / запуск</span>
                )}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span className="text-xs text-neutral-400 font-mono">версия {serverSettings.version}</span>
            </div>
          </div>

          {/* GSQ Title & Updated Description */}
          <div className="space-y-4 mb-8">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-xl select-none">
              GSQ
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-100">
              {SERVER_INFO.tagline}
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed font-normal">
              Присоединяйся к нашему серверу и окунись в атмосферу настоящего лампового выживания. Уютный, ванильный сервер, доброе комьюнити и масштабные проекты без лишних плагинов.
            </p>
          </div>

          {/* Version Card & IP Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-12">
            {/* Version Card (26.1.2) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-3.5 shadow-lg select-none">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                <Box className="w-5 h-5 text-neutral-200" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-medium">Версия игры</div>
                <div className="text-base sm:text-lg font-mono font-semibold text-white tracking-wide">
                  {serverSettings.version}
                </div>
              </div>
            </div>

            {/* IP Address Card with Copy Button */}
            <CopyIpButton variant="card" />
          </div>

          {/* Backup IP note on Slide 1 */}
          <div className="text-xs text-neutral-400 font-mono -mt-8 mb-10 flex items-center gap-2">
            <span className="text-neutral-500">Если не работает IP сверху:</span>
            <span className="text-neutral-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">play.mygsq.fun:25605</span>
            <span className="text-neutral-500">или</span>
            <span className="text-neutral-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">5.83.140.201:25605</span>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://discord.gg/GbgNVXDdtf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 shadow-glow-white hover:scale-[1.02] active:scale-[0.98]"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Подать заявку в Discord</span>
            </a>
            <Link
              to="/store"
              className="px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 hover:border-white/30 font-semibold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-400" />
              <span>Магазин привилегий</span>
            </Link>
            <Link
              to="/rules"
              className="px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 hover:border-white/30 font-semibold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Правила сервера</span>
            </Link>
            <Link
              to="/map"
              className="px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 hover:border-white/30 font-semibold text-sm transition-all duration-200 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-neutral-400" />
              <span>Онлайн карта</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Slide 2: Server Features (without TPS, economy on AR, simple voice chat) */}
      <section className="relative z-10 py-16 border-t border-white/[0.08] bg-[#09090c]/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>Особенности GSQ</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Почему выбирают наш сервер
            </h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl">
              Мы создали сервер, на котором ценится доверие, эстетика и чистое выживание без читерского доната.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVER_FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-neutral-900/60 hover:bg-neutral-850/90 border border-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-glow-sm hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                  {iconMap[feature.icon] || <Sparkles className="w-6 h-6 text-neutral-300" />}
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-neutral-100">
                  {feature.title}
                </h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 3: Registration, Tickets, Main & Backup IPs, Version 26.1.2 */}
      <section className="relative z-10 py-16 border-t border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/70 border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Instructions with Ticket Requirement */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Регистрация и доступ
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Как попасть на сервер GSQ?
                </h3>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Вступите в Discord и оставьте тикет:</strong>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Перейдите по ссылке <a href="https://discord.gg/GbgNVXDdtf" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-medium">discord.gg/GbgNVXDdtf</a> и откройте тикет на регистрацию (заявку на вайтлист).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Дождитесь рассмотрения заявки:</strong>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Администрация проверяет заявку в тикете и добавляет ваш ник в белый список сервера.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Подключайтесь на версии 26.1.2:</strong>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        После одобрения тикета запускайте Minecraft версии <strong className="text-white">26.1.2</strong> и подключайтесь по основному или запасному адресу!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://discord.gg/GbgNVXDdtf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-glow-sm"
                  >
                    <DiscordIcon className="w-4 h-4" />
                    <span>Оставить тикет на регистрацию</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Main IP and Backup IPs */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-2xl bg-black/70 border border-white/15 space-y-3">
                  <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                    Адреса для подключения (26.1.2)
                  </span>

                  {/* Main IP */}
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                        ● Основной IP
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {serverSettings.ip}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(serverSettings.ip)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1 transition-colors"
                      title="Скопировать"
                    >
                      {copiedIp === serverSettings.ip ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[11px] text-emerald-300">Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-neutral-300" />
                          <span className="text-[11px]">Копия</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Backup IPs */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] text-neutral-400 font-medium block leading-relaxed">
                      Если не работает IP сверху: <strong className="text-white font-mono font-semibold">play.mygsq.fun:25605</strong> или <strong className="text-white font-mono font-semibold">5.83.140.201:25605</strong>
                    </span>

                    {SERVER_INFO.backupIps.slice(1).map((backup) => (
                      <div
                        key={backup.ip}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="text-[10px] text-neutral-400 block">{backup.label}</span>
                          <span className="font-mono text-neutral-200">{backup.ip}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(backup.ip)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="Скопировать запасной IP"
                        >
                          {copiedIp === backup.ip ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="https://discord.gg/GbgNVXDdtf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors text-center block"
                >
                  <DiscordIcon className="w-4 h-4 text-sky-400" />
                  <span>Discord сервера: discord.gg/GbgNVXDdtf</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
