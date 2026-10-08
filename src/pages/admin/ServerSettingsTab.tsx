import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useServerStatus } from '../../hooks/useServerStatus';
import { api } from '../../lib/api';
import { Server, MapPin, Check, RotateCcw, CreditCard, Copy, ExternalLink, ShieldCheck, Sparkles, Key } from 'lucide-react';

export const ServerSettingsTab: React.FC = () => {
  const { serverSettings, updateServerSettings } = useStore();
  const serverStatus = useServerStatus(serverSettings.ip);
  const [formData, setFormData] = useState(serverSettings);
  const [saved, setSaved] = useState(false);

  // YooKassa Configuration State
  const [yooShopId, setYooShopId] = useState('');
  const [yooSecretKey, setYooSecretKey] = useState('');
  const [yooTestMode, setYooTestMode] = useState(true);
  const [yooEnabled, setYooEnabled] = useState(true);
  const [yooConfigured, setYooConfigured] = useState(false);
  const [yooSaved, setYooSaved] = useState(false);
  const [yooSaving, setYooSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = `${window.location.origin}/api/yookassa/webhook`;

  useEffect(() => {
    // Fetch YooKassa settings from backend
    api.getYooKassaSettings()
      .then((data) => {
        if (data) {
          setYooShopId(data.shopId || '');
          setYooSecretKey(data.secretKey || '');
          setYooTestMode(data.testMode ?? true);
          setYooEnabled(data.enabled ?? true);
          setYooConfigured(data.isConfigured ?? false);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateServerSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveYooKassa = async (e: React.FormEvent) => {
    e.preventDefault();
    setYooSaving(true);
    try {
      const res = await api.updateYooKassaSettings({
        shopId: yooShopId.trim(),
        secretKey: yooSecretKey.trim(),
        testMode: yooTestMode,
        enabled: yooEnabled,
      });
      if (res && res.success) {
        setYooConfigured(res.isConfigured);
        setYooSaved(true);
        setTimeout(() => setYooSaved(false), 2500);
      }
    } catch (err) {
      alert('Ошибка при сохранении настроек ЮKassa: ' + (err as Error).message);
    } finally {
      setYooSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
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
    <div className="space-y-8 max-w-3xl">
      {/* 1. Server General Settings Card */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>GSQ — настройки сервера и шлюзов</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Управляйте IP-адресом, версией, картой и платёжным шлюзом ЮKassa прямо из панели управления.
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
            Онлайн запрашивается напрямую с игрового сервера в реальном времени. Обновляется автоматически.
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
            Эта ссылка открывается на странице «Карта».
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
            Сохранить настройки сервера
          </button>
        </div>
      </form>

      {/* 2. YooKassa Integration Card */}
      <form onSubmit={handleSaveYooKassa} className="p-6 rounded-2xl bg-[#131a29] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Интеграция ЮKassa</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    yooConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {yooConfigured ? 'Подключено' : 'Требуется настройка'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Приём платежей по СБП, картам МИР / Visa / Mastercard, SberPay и T-Pay
              </p>
            </div>
          </div>

          {yooSaved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>ЮKassa сохранена!</span>
            </span>
          )}
        </div>

        {/* API Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <span>Идентификатор магазина (Shop ID)</span>
              <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={yooShopId}
              onChange={(e) => setYooShopId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
              placeholder="Например: 1042981"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Берётся в личном кабинете ЮKassa в левом верхнем углу
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Секретный ключ API</span>
              <span className="text-amber-400">*</span>
            </label>
            <input
              type="password"
              value={yooSecretKey}
              onChange={(e) => setYooSecretKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
              placeholder="live_... или test_..."
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Сгенерируйте в ЛК ЮKassa (раздел Интеграция → Ключи API)
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label className="p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Тестовый режим</span>
              <span className="text-[11px] text-slate-400 block">
                Для тестирования оплат тестовыми картами
              </span>
            </div>
            <input
              type="checkbox"
              checked={yooTestMode}
              onChange={(e) => setYooTestMode(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-[#0e1422] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Приём платежей включён</span>
              <span className="text-[11px] text-slate-400 block">
                Разрешить игрокам переходить к оплате
              </span>
            </div>
            <input
              type="checkbox"
              checked={yooEnabled}
              onChange={(e) => setYooEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
            />
          </label>
        </div>

        {/* Webhook URL Box */}
        <div className="p-4 rounded-xl bg-[#0e1422] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              URL для HTTP-уведомлений (Webhook в ЛК ЮKassa)
            </span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook ? 'Скопировано!' : 'Скопировать'}</span>
            </button>
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-slate-300 select-all overflow-x-auto">
            {webhookUrl}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Вставьте эту ссылку в личном кабинете ЮKassa в разделе <strong>Интеграция → HTTP-уведомления</strong> и выберите событие <code>payment.succeeded</code>.
          </p>
        </div>

        {/* Setup Guide Steps */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Как подключить магазин в 3 шага:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Зарегистрируйтесь в <a href="https://yookassa.ru" target="_blank" rel="noreferrer" className="text-emerald-400 underline">yookassa.ru</a> и активируйте договор.</li>
            <li>В разделе «Интеграция → Ключи API» скопируйте Shop ID и создайте секретный ключ.</li>
            <li>Вставьте их в поля выше, скопируйте Webhook URL и нажмите «Сохранить настройки ЮKassa».</li>
          </ol>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={yooSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {yooSaving ? 'Сохранение...' : 'Сохранить настройки ЮKassa'}
          </button>
        </div>
      </form>
    </div>
  );
};
