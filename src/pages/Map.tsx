import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  ExternalLink, 
  Compass, 
  Settings, 
  Link as LinkIcon
} from 'lucide-react';

export const Map: React.FC = () => {
  const { serverSettings, updateServerSettings } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [activeDimension, setActiveDimension] = useState<'overworld' | 'nether' | 'end'>('overworld');
  const [isUrlSettingsOpen, setIsUrlSettingsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverSettings.mapUrl);
  const [iframeLoading, setIframeLoading] = useState(true);

  const activeMapUrl = serverSettings.mapUrl;
  const isExampleUrl = activeMapUrl.includes('map.example.com');

  const toggleFullscreen = () => {
    const elem = document.getElementById('map-container');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleRefresh = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleSaveUrl = () => {
    updateServerSettings({ mapUrl: inputUrl });
    handleRefresh();
    setIsUrlSettingsOpen(false);
  };

  return (
    <div
      id="map-container"
      className={`relative w-full bg-[#08080a] flex-1 flex flex-col ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[calc(100vh-80px)] min-h-[500px]'
      }`}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Dimension Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[#0e0e12]/90 border border-white/15 backdrop-blur-md shadow-lg text-xs">
          <button
            onClick={() => setActiveDimension('overworld')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeDimension === 'overworld'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Обычный мир
          </button>
          <button
            onClick={() => setActiveDimension('nether')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeDimension === 'nether'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Нижний мир
          </button>
          <button
            onClick={() => setActiveDimension('end')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeDimension === 'end'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Энд
          </button>
        </div>

        {/* Change URL quick button */}
        <button
          onClick={() => {
            setInputUrl(serverSettings.mapUrl);
            setIsUrlSettingsOpen(!isUrlSettingsOpen);
          }}
          className="p-2 rounded-xl bg-[#0e0e12]/90 border border-white/15 text-neutral-300 hover:text-white backdrop-blur-md shadow-lg transition-all"
          title="Настройка ссылки на карту"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Top-Right Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Refresh Iframe */}
        <button
          onClick={handleRefresh}
          className="p-2.5 rounded-xl bg-[#0e0e12]/90 border border-white/15 text-neutral-300 hover:text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
          title="Перезагрузить карту"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-[#0e0e12]/90 border border-white/15 text-neutral-300 hover:text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
          title={isFullscreen ? 'Свернуть' : 'Во весь экран'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* External Link */}
        <a
          href={activeMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-[#0e0e12]/90 border border-white/15 text-neutral-300 hover:text-white backdrop-blur-md shadow-lg transition-all hover:scale-105"
          title="Открыть в новой вкладке"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* URL Settings Drawer / Popover */}
      {isUrlSettingsOpen && (
        <div className="absolute top-16 left-4 z-30 w-80 sm:w-96 p-4 rounded-2xl bg-[#101014]/95 border border-white/20 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Настройка ссылки на карту
            </span>
            <button
              onClick={() => setIsUrlSettingsOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-neutral-400 mb-3">
            Вставьте ссылку на веб-карту (BlueMap / Dynmap) — она сохранится и сразу откроется:
          </p>
          <div className="space-y-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-server-map.com"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-white/40"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveUrl}
                className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setInputUrl('https://map.example.com/?world=gsq');
                  updateServerSettings({ mapUrl: 'https://map.example.com/?world=gsq' });
                  setIsUrlSettingsOpen(false);
                }}
                className="px-3 py-2 rounded-lg bg-white/10 text-neutral-300 text-xs font-medium hover:text-white hover:bg-white/20 transition-colors"
              >
                Сброс
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Viewport / Iframe */}
      <div className="relative w-full h-full flex-1 overflow-hidden">
        {isExampleUrl ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-neutral-950">
            {/* Dark isometric texture pattern */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center filter grayscale contrast-125"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.85) 100%), repeating-linear-gradient(45deg, #121216 0, #121216 2px, transparent 0, transparent 50px)`,
              }}
            />

            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* Instruction Card */}
            <div className="relative z-10 max-w-md mx-4 p-6 sm:p-8 rounded-3xl bg-[#0f0f13]/90 border border-white/15 backdrop-blur-xl shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white shadow-glow-sm">
                <Compass className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Интерактивная карта сервера
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Здесь в реальном времени будет отображаться мир <strong className="text-white">GSQ</strong> (BlueMap / Dynmap / Squaremap).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-left text-xs space-y-1.5 font-mono text-neutral-300">
                <div className="text-[11px] text-neutral-500 font-sans font-medium uppercase tracking-wider">
                  Как подключить вашу карту:
                </div>
                <div>1. Нажмите кнопку «Ввести ссылку сейчас» ниже или откройте Админку</div>
                <div>2. Вставьте ваш URL BlueMap / Dynmap</div>
                <div>3. Карта мгновенно откроется во весь экран!</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setIsUrlSettingsOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-glow-sm"
                >
                  Ввести ссылку сейчас
                </button>
                <button
                  onClick={() => {
                    updateServerSettings({ mapUrl: 'https://map.wyncraft.com' });
                    handleRefresh();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors"
                  title="Попробовать демо-карту"
                >
                  Демо-вид
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={activeMapUrl}
            title="Онлайн карта сервера GSQ"
            className="w-full h-full border-0 select-none bg-neutral-950"
            allow="fullscreen"
            loading="lazy"
            onLoad={() => setIframeLoading(false)}
          />
        )}
      </div>

      {/* Bottom-Right Badge matching Screenshot 4 ("Карта сервера") */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e0e12]/90 border border-white/15 backdrop-blur-md shadow-lg text-xs font-medium text-neutral-200">
          <MapPin className="w-3.5 h-3.5 text-white" />
          <span>Карта сервера GSQ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>
    </div>
  );
};
