import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  monthlyPrice?: number;
  foreverPrice?: number;
  period?: string;
  description?: string;
  isSubscription?: boolean;
  isBox?: boolean;
  initialQuantity?: number;
}

interface DiscordInstructionModalProps {
  item: PurchaseItem | null;
  onClose: () => void;
}

const DISCORD_TICKET_URL = 'https://discord.com/channels/1272127575392518226/1445470672468836593';

export const DiscordInstructionModal: React.FC<DiscordInstructionModalProps> = ({ item, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'forever'>('forever');
  const [boxQuantity, setBoxQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isSub = !!item.isSubscription;
  const isBox = item.id === 'hat-box' || !!item.isBox;

  // Calculate current price & label
  let displayPrice = item.price;
  let detailLabel = item.period || '';

  if (isSub) {
    if (selectedPeriod === 'month') {
      displayPrice = item.monthlyPrice || (item.id === 'sub' ? 139 : 289);
      detailLabel = '1 месяц';
    } else {
      displayPrice = item.foreverPrice || item.price;
      detailLabel = 'навсегда';
    }
  } else if (isBox) {
    displayPrice = (item.price || 49) * boxQuantity;
    detailLabel = `${boxQuantity} шт.`;
  }

  const ticketText = `Здравствуйте! Хочу приобрести: ${item.name} (${detailLabel} — ${displayPrice} ₽)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToDiscord = () => {
    navigator.clipboard.writeText(ticketText);
    window.open(DISCORD_TICKET_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#0c0c0e] border border-neutral-800 p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-4 border-b border-neutral-800 pr-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {item.name}
            </h3>
            <span className="text-xl font-bold font-mono text-white whitespace-nowrap">
              {displayPrice} ₽
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Subscription Period Selector */}
        {isSub && (
          <div className="mt-4 p-1 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedPeriod('month')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              1 месяц • {item.monthlyPrice || (item.id === 'sub' ? 139 : 289)} ₽
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('forever')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                selectedPeriod === 'forever'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Навсегда • {item.foreverPrice || item.price} ₽
            </button>
          </div>
        )}

        {/* Box Quantity Selector */}
        {isBox && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-neutral-400 font-medium">Количество:</span>
            <div className="flex items-center gap-1.5">
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setBoxQuantity(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    boxQuantity === num
                      ? 'bg-white text-black'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  {num} шт.
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-5 space-y-2.5">
          <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
            Инструкция по покупке:
          </p>

          <div className="space-y-2 text-xs text-neutral-300">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <p className="leading-relaxed">
                Перейдите в наш Discord по кнопке ниже и откройте тикет.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <p className="leading-relaxed">
                Укажите товар, который хотите приобрести: <span className="text-white font-semibold">{item.name}</span> ({detailLabel}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <p className="leading-relaxed">
                Оплатите заказ по реквизитам от администратора.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </span>
              <p className="leading-relaxed text-white font-medium">
                Ожидайте выдачи от администратора.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleGoToDiscord}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span>Перейти в Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs border border-neutral-800 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Текст скопирован' : 'Скопировать текст для тикета'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
