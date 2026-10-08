import React from 'react';
import { Crown, Package, ShieldCheck, VolumeX, Heart, Tag, Coins } from 'lucide-react';

export interface ProductIconProps {
  productId?: string;
  category?: string;
  type?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProductIcon: React.FC<ProductIconProps> = ({
  productId = '',
  category = '',
  type = '',
  name = '',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const id = productId.toLowerCase();
  const cat = category.toLowerCase();
  const t = type.toLowerCase();
  const n = name.toLowerCase();

  // 1. Hat Box / Crate (Case with actual 3D box texture or Package)
  if (id.includes('box') || id.includes('hat') || id.includes('case') || cat.includes('кейс') || t.includes('рулет')) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/30 shadow-md ${sizeClasses[size]} ${className}`}>
        <img
          src={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/box.png`}
          alt="Box"
          className="w-4/5 h-4/5 object-contain filter drop-shadow"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <Package className={`${iconSizes[size]} text-amber-400 absolute hidden only:block`} />
      </div>
    );
  }

  // 2. Subscriptions (SUB & SUB+)
  if (id === 'sub-plus' || n.includes('sub+') || n.includes('sub +') || n.includes('🍎')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-rose-950/40 border border-rose-500/30 text-rose-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <Crown className={iconSizes[size]} />
      </div>
    );
  }

  if (id === 'sub' || n.includes('sub') || n.includes('🍇')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-950/40 border border-purple-500/30 text-purple-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <Crown className={iconSizes[size]} />
      </div>
    );
  }

  // 3. Unban
  if (id.includes('unban') || n.includes('разбан')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 text-emerald-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <ShieldCheck className={iconSizes[size]} />
      </div>
    );
  }

  // 4. Unmute
  if (id.includes('unmute') || n.includes('размут')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-sky-950/40 border border-sky-500/30 text-sky-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <VolumeX className={iconSizes[size]} />
      </div>
    );
  }

  // 5. Donate / Support
  if (id.includes('donate') || cat.includes('поддерж') || n.includes('пожертв')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/30 text-amber-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <Heart className={iconSizes[size]} />
      </div>
    );
  }

  // 6. Generic Category / Type Matching
  if (t.includes('привил')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-950/40 border border-purple-500/30 text-purple-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <Crown className={iconSizes[size]} />
      </div>
    );
  }

  if (t.includes('валют') || cat.includes('валют')) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/30 text-amber-400 shadow-md ${sizeClasses[size]} ${className}`}>
        <Coins className={iconSizes[size]} />
      </div>
    );
  }

  // Fallback icon
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-slate-700/20 to-slate-900/40 border border-slate-700/50 text-slate-300 shadow-md ${sizeClasses[size]} ${className}`}>
      <Tag className={iconSizes[size]} />
    </div>
  );
};
