import React from 'react';

export type CubeColor = 'magenta' | 'red' | 'green' | 'white' | 'gold' | 'sword';

interface CubeIconProps {
  color: CubeColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CubeIcon: React.FC<CubeIconProps> = ({ color, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (color === 'sword') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)]">
          {/* Diamond Sword Pixel Art Style */}
          <path d="M48 6 L58 16 L32 42 L22 32 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <path d="M50 8 L56 14 L34 36 L28 30 Z" fill="#bae6fd" />
          <path d="M22 32 L32 42 L28 46 L26 44 L20 50 L14 44 L20 38 L18 36 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M16 46 L10 52 L6 58 L12 54 L18 48 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          <rect x="6" y="56" width="6" height="6" fill="#78350f" />
        </svg>
      </div>
    );
  }

  // Color schemes for isometric 3D cubes
  const colorPalettes: Record<Exclude<CubeColor, 'sword'>, { top: string; left: string; right: string; border: string; glow: string }> = {
    magenta: {
      top: '#e879f9',
      left: '#c026d3',
      right: '#a21caf',
      border: '#701a75',
      glow: 'rgba(217, 70, 239, 0.45)',
    },
    red: {
      top: '#f87171',
      left: '#dc2626',
      right: '#b91c1c',
      border: '#7f1d1d',
      glow: 'rgba(239, 68, 68, 0.45)',
    },
    green: {
      top: '#4ade80',
      left: '#16a34a',
      right: '#15803d',
      border: '#14532d',
      glow: 'rgba(34, 197, 94, 0.45)',
    },
    white: {
      top: '#f8fafc',
      left: '#cbd5e1',
      right: '#94a3b8',
      border: '#64748b',
      glow: 'rgba(241, 245, 249, 0.35)',
    },
    gold: {
      top: '#fde047',
      left: '#eab308',
      right: '#ca8a04',
      border: '#854d0e',
      glow: 'rgba(234, 179, 8, 0.45)',
    },
  };

  const palette = colorPalettes[color as Exclude<CubeColor, 'sword'>] || colorPalettes.magenta;

  return (
    <div
      className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}
      style={{ filter: `drop-shadow(0 4px 10px ${palette.glow})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Isometric Cube: Top face */}
        <polygon
          points="50,14 86,34 50,54 14,34"
          fill={palette.top}
          stroke={palette.border}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Top face inner rune / square decoration */}
        <polygon
          points="50,24 74,37 50,50 26,37"
          fill="none"
          stroke={palette.left}
          strokeWidth="2"
          opacity="0.8"
        />
        <circle cx="50" cy="37" r="3" fill={palette.left} opacity="0.9" />

        {/* Left face */}
        <polygon
          points="14,34 50,54 50,90 14,70"
          fill={palette.left}
          stroke={palette.border}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Left face rune */}
        <polygon
          points="22,43 42,54 42,79 22,68"
          fill="none"
          stroke={palette.right}
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Right face */}
        <polygon
          points="50,54 86,34 86,70 50,90"
          fill={palette.right}
          stroke={palette.border}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right face rune */}
        <polygon
          points="58,54 78,43 78,68 58,79"
          fill="none"
          stroke={palette.border}
          strokeWidth="2"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
