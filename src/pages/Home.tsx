import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_INFO, SERVER_FEATURES } from '../lib/constants';
import { useStore } from '../context/StoreContext';
import { CopyIpButton } from '../components/CopyIpButton';
import { 
  Box, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Cpu, 
  Mic, 
  Coins, 
  Pickaxe, 
  BookOpen, 
  ShoppingBag,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const { serverSettings } = useStore();

  const iconMap: Record<string, React.ReactNode> = {
    Pickaxe: <Pickaxe className="w-6 h-6 text-neutral-300" />,
    Cpu: <Cpu className="w-6 h-6 text-neutral-300" />,
    Mic: <Mic className="w-6 h-6 text-neutral-300" />,
    Coins: <Coins className="w-6 h-6 text-neutral-300" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-neutral-300" />,
    Users: <Users className="w-6 h-6 text-neutral-300" />,
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Hero with Dark Minecraft Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Deep atmospheric glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.04] blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Dark Minecraft Vibe Silhouette / Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/70 via-[#070709]/85 to-[#070709]" />
      </div>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Online Indicator Pill */}
          <div className="flex items-center justify-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-glow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-300">
                Сервер онлайн: <span className="text-white font-mono">{serverSettings.onlinePlayers}</span> из {serverSettings.maxPlayers}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span className="text-xs text-neutral-400 font-mono">TPS 20.0</span>
            </div>
          </div>

          {/* Massive GSQ Title matching screenshot */}
          <div className="space-y-4 mb-8">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-xl select-none">
              GSQ
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-100">
              {SERVER_INFO.tagline}
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed font-normal">
              {SERVER_INFO.description}
            </p>
          </div>

          {/* Two prominent action / info cards matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mb-12">
            {/* Version Card */}
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

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/store"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm transition-all duration-200 flex items-center gap-2 shadow-glow-white hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
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

      {/* Server Features / Info Blocks */}
      <section className="relative z-10 py-16 border-t border-white/[0.08] bg-[#09090c]/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>Особенности GSQ</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Почему игроки выбирают наш сервер
            </h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl">
              Мы создали сервер, на котором сами хотим играть каждый день — честный, красивый и долговечный.
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

      {/* How to Connect / Guide */}
      <section className="relative z-10 py-16 border-t border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/70 border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Быстрый старт
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Как начать играть на сервере GSQ?
                </h3>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Запустите Minecraft версии <strong className="text-white">{serverSettings.version}</strong> (лицензия или проверенный лаунчер).</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>В меню выберите «Сетевая игра» → «По адресу» или «Добавить сервер».</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>Вставьте адрес <strong className="text-white font-mono">{serverSettings.ip}</strong> и нажимайте «Подключиться»!</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-center space-y-2">
                  <span className="text-xs text-neutral-400">Прямое подключение</span>
                  <div className="font-mono text-lg font-bold text-white tracking-wide">
                    {serverSettings.ip}
                  </div>
                  <CopyIpButton variant="badge" className="w-full justify-center" />
                </div>
                <a
                  href={SERVER_INFO.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <span>Возникли вопросы? Задай их в Discord</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
