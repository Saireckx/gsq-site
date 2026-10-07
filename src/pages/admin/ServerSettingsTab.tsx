import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useServerStatus } from '../../hooks/useServerStatus';
import { Server, MapPin, Check, RotateCcw, ShieldCheck } from 'lucide-react';

export const ServerSettingsTab: React.FC = () => {
  const { serverSettings, updateServerSettings } = useStore();
  const serverStatus = useServerStatus(serverSettings.ip);
  const [formData, setFormData] = useState(serverSettings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateServerSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Сбросить все настройки сервера к значениям по умолчанию?')) {
      const defaults = {
        ip: 'play.mygsq.fun',
        version: '26.1.2',
        mapUrl: 'https://map.mygsq.fun/',
      };
      setFormData(defaults);
      updateServerSettings(defaults);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>GSQ — настройки сервера</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Управляйте IP-адресом, версией и ссылкой на онлайн-карту прямо из панели управления.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#131a29] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Параметры подключения</span>
          </div>

          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Сохранено!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              IP-адрес сервера для подключения
            </label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
              placeholder="play.gsq.ru"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Версия Minecraft
            </label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
              placeholder="1.21.x"
              required
            />
          </div>
        </div>

        {/* Live Server Status Monitor Card */}
        <div className="p-4 rounded-xl bg-[#0e1422] border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serverStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>Реальный статус сервера (живой опрос по API)</span>
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              {serverStatus.isOnline ? (
                <>
                  {serverStatus.playersOnline}
                  {serverStatus.maxPlayers && serverStatus.maxPlayers > 0 ? ` / ${serverStatus.maxPlayers}` : ''} онлайн
                </>
              ) : 'Оффлайн'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Онлайн запрашивается напрямую с игрового сервера в реальном времени без накрутки. Обновляется каждые 30 секунд.
          </p>
        </div>

        {/* Live Map URL input */}
        <div className="pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Ссылка на веб-карту сервера (BlueMap / Dynmap / Squaremap)</span>
          </label>
          <input
            type="url"
            value={formData.mapUrl}
            onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
            placeholder="https://map.your-server.ru"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Эта ссылка открывается в лайв-тайме на странице «Карта». Изменив её здесь, она сразу обновится для всех посетителей!
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Сохранить настройки
          </button>
        </div>
      </form>
    </div>
  );
};
