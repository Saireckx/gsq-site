import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  Check, 
  Package, 
  Sparkles, 
  ShieldCheck, 
  CreditCard,
  Gift
} from 'lucide-react';
import { SERVER_INFO } from '../lib/constants';

interface BoxDiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
  pricePerBox?: number;
}

export const BoxDiscordModal: React.FC<BoxDiscordModalProps> = ({
  isOpen,
  onClose,
  initialQuantity = 1,
  pricePerBox = 49,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalPrice = pricePerBox * quantity;
  const discordUrl = SERVER_INFO.links.discord || 'https://discord.gg/GbgNVXDdtf';
  const boxImg = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/box.png';

  const ticketMessage = `Здравствуйте! Хочу купить Коробку со шляпой (${quantity} шт. за ${totalPrice} ₽)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToDiscord = () => {
    // Also copy message to clipboard for convenience
    navigator.clipboard.writeText(ticketMessage);
    window.open(discordUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#0e121d] border border-amber-500/30 p-5 sm:p-8 shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-white/10 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">
                Покупка через Discord
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5865F2]/20 text-[#8e99f7] border border-[#5865F2]/30">
                Тикеты
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Коробка со шляпой</h3>
          </div>
        </div>

        {/* Quantity & Price Card */}
        <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={boxImg} alt="Box" className="w-14 h-14 object-contain drop-shadow-md" />
            <div>
              <p className="text-xs text-neutral-400 font-medium">Выбрано коробок:</p>
              <p className="text-lg font-black text-white font-mono">
                {quantity} шт. • <span className="text-amber-400">{totalPrice} ₽</span>
              </p>
            </div>
          </div>

          {/* Quick Quantity Select */}
          <div className="flex items-center gap-1.5">
            {[1, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(n)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  quantity === n
                    ? 'bg-amber-400 text-black shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                {n} шт.
              </button>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">
            Как происходит покупка и открытие:
          </h4>

          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-black flex items-center justify-center flex-shrink-0 text-xs">
                1
              </span>
              <p className="leading-relaxed">
                Нажмите кнопку <b className="text-white">«Перейти в Discord»</b> ниже и откройте тикет в канале поддержки.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-black flex items-center justify-center flex-shrink-0 text-xs">
                2
              </span>
              <p className="leading-relaxed">
                Укажите в тикете, что хотите приобрести <b className="text-amber-300">{quantity} шт.</b> за <b className="text-amber-300">{totalPrice} ₽</b>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-black flex items-center justify-center flex-shrink-0 text-xs">
                3
              </span>
              <p className="leading-relaxed">
                Оплатите заказ удобным способом (СБП / перевод по карте), который предоставит администратор.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center flex-shrink-0 text-xs">
                4
              </span>
              <p className="leading-relaxed text-emerald-200">
                Администратор отправит вам <b className="text-white">уникальную ссылку на рулетку кейсов</b>. Вы сразу сможете открыть коробки без повторок прямо на сайте!
              </p>
            </div>
          </div>
        </div>

        {/* Notice: No Nickname needed */}
        <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Никнейм вводить не нужно — ссылку на открытие вы получите прямо в тикете Discord.</span>
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleGoToDiscord}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-sm transition-all shadow-lg shadow-[#5865F2]/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Перейти в Discord и создать тикет</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Текст скопирован!' : 'Скопировать текст для тикета'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
