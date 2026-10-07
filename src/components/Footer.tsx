import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_INFO, NAV_LINKS } from '../lib/constants';
import { ArrowUp, Disc as DiscordIcon, Send, Play, Shield } from 'lucide-react';
import { CopyIpButton } from './CopyIpButton';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#060608] text-neutral-400 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-white">GSQ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
            </div>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Ванильный сервер Minecraft нового поколения. Настоящая ламповая атмосфера, честная экономика без разрушающего баланс доната и стабильный TPS 20.0.
            </p>
            <div className="pt-2">
              <CopyIpButton variant="badge" />
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Навигация
            </h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-white transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin"
                  className="text-neutral-500 hover:text-amber-400 transition-colors duration-200 flex items-center gap-1.5 group pt-1"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-400" />
                  <span>Панель управления</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Socials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Сообщество
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={SERVER_INFO.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <DiscordIcon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <span>Discord Сервер</span>
                </a>
              </li>
              <li>
                <a
                  href={SERVER_INFO.links.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <Send className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <span>Telegram Канал</span>
                </a>
              </li>
              <li>
                <a
                  href={SERVER_INFO.links.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="text-xs font-bold px-1 py-0.5 rounded bg-white/10 text-neutral-300 group-hover:text-white">VK</span>
                  <span>Группа ВКонтакте</span>
                </a>
              </li>
              <li>
                <a
                  href={SERVER_INFO.links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <Play className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  <span>YouTube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            <p>© {new Date().getFullYear()} GSQ Minecraft. Все права защищены.</p>
            <p className="mt-1 text-[11px] text-neutral-600">
              Сервер не имеет прямого отношения к Mojang Studios или Microsoft.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-neutral-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              title="Панель администратора"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Админка</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white border border-white/[0.06] hover:border-white/20 transition-all group"
              title="Вернуться наверх"
            >
              <span>Наверх</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
