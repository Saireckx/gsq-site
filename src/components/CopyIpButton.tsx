import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { SERVER_INFO } from '../lib/constants';

interface CopyIpButtonProps {
  variant?: 'card' | 'badge' | 'minimal';
  className?: string;
}

export const CopyIpButton: React.FC<CopyIpButtonProps> = ({ variant = 'card', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(SERVER_INFO.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = SERVER_INFO.ip;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="relative inline-flex items-center">
        {copied && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white text-black text-xs font-semibold rounded-md shadow-glow-sm pointer-events-none animate-bounce z-20 whitespace-nowrap">
            Скопировано!
          </div>
        )}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors duration-200 ${className}`}
          title="Скопировать IP"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="font-mono">{SERVER_INFO.ip}</span>
        </button>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="relative inline-flex items-center">
        {copied && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-bold rounded-lg shadow-glow-sm pointer-events-none z-20 whitespace-nowrap">
            Скопировано!
          </div>
        )}
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm font-medium text-neutral-200 hover:text-white group ${className}`}
        >
          <span className="font-mono">{SERVER_INFO.ip}</span>
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 transition-transform scale-110" />
          ) : (
            <Copy className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          )}
        </button>
      </div>
    );
  }

  // Card variant matching the hero card on reference image
  return (
    <div
      onClick={handleCopy}
      className={`relative group cursor-pointer p-4 sm:p-5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-850/90 border border-white/10 hover:border-white/25 transition-all duration-300 shadow-lg hover:shadow-glow-sm flex items-center justify-between gap-4 select-none ${className}`}
    >
      {/* Tooltip on copy */}
      {copied && (
        <div className="absolute -top-10 right-4 px-3 py-1 bg-white text-black text-xs font-bold rounded-lg shadow-glow-white pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-30 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Скопировано!</span>
        </div>
      )}

      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-white/20 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
            <line x1="6" x2="6.01" y1="6" y2="6"/>
            <line x1="6" x2="6.01" y1="18" y2="18"/>
          </svg>
        </div>
        <div>
          <div className="text-xs text-neutral-400 font-medium">IP-адрес</div>
          <div className="text-base sm:text-lg font-mono font-semibold text-white tracking-wide flex items-center gap-2">
            {SERVER_INFO.ip}
          </div>
        </div>
      </div>

      <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/15 flex items-center justify-center transition-all border border-transparent group-hover:border-white/20">
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
        ) : (
          <Copy className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
        )}
      </div>
    </div>
  );
};
