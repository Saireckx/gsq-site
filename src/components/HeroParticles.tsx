import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: number; // percentage
  top: number;  // percentage
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  color: string;
  glow: string;
}

export const HeroParticles: React.FC = () => {
  // Generate a deterministic set of firefly / ember particles
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    const colors = [
      { color: 'bg-amber-300', glow: 'rgba(251, 191, 36, 0.8)' },   // Warm firefly ember
      { color: 'bg-emerald-300', glow: 'rgba(52, 211, 153, 0.7)' }, // Forest spore
      { color: 'bg-white', glow: 'rgba(255, 255, 255, 0.8)' },        // Mist dust speck
      { color: 'bg-amber-200', glow: 'rgba(253, 230, 138, 0.8)' },  // Warm spark
    ];

    // Seeded-style pseudo positions for consistency across renders
    const positions = [
      { x: 12, y: 35, s: 3.5, c: 0, d: 6.5, dl: 0.2 },
      { x: 22, y: 65, s: 2.5, c: 1, d: 8.0, dl: 1.5 },
      { x: 34, y: 25, s: 4.0, c: 0, d: 5.8, dl: 2.8 },
      { x: 45, y: 78, s: 2.0, c: 2, d: 7.2, dl: 0.8 },
      { x: 58, y: 40, s: 3.0, c: 3, d: 6.2, dl: 3.2 },
      { x: 67, y: 20, s: 4.5, c: 0, d: 5.4, dl: 1.1 },
      { x: 78, y: 55, s: 2.5, c: 1, d: 8.5, dl: 2.2 },
      { x: 86, y: 32, s: 3.5, c: 2, d: 6.8, dl: 4.0 },
      { x: 92, y: 70, s: 2.0, c: 0, d: 7.5, dl: 0.5 },
      { x: 18, y: 18, s: 3.0, c: 2, d: 6.0, dl: 2.0 },
      { x: 28, y: 45, s: 4.0, c: 0, d: 7.0, dl: 3.5 },
      { x: 52, y: 15, s: 2.5, c: 1, d: 8.2, dl: 1.8 },
      { x: 62, y: 82, s: 3.5, c: 3, d: 5.6, dl: 4.5 },
      { x: 74, y: 38, s: 2.0, c: 0, d: 7.8, dl: 0.9 },
      { x: 82, y: 85, s: 3.0, c: 1, d: 6.4, dl: 2.5 },
      { x: 15, y: 88, s: 2.5, c: 0, d: 7.3, dl: 3.8 },
      { x: 40, y: 60, s: 3.5, c: 3, d: 6.1, dl: 1.2 },
      { x: 88, y: 15, s: 2.0, c: 2, d: 8.4, dl: 2.7 },
      { x: 25, y: 82, s: 4.0, c: 0, d: 5.9, dl: 0.4 },
      { x: 70, y: 68, s: 2.5, c: 1, d: 7.1, dl: 3.1 },
    ];

    positions.forEach((pos, idx) => {
      const col = colors[pos.c];
      list.push({
        id: idx,
        left: pos.x,
        top: pos.y,
        size: pos.s,
        duration: pos.d,
        delay: pos.dl,
        color: col.color,
        glow: col.glow,
      });
    });

    return list;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {/* Subtle Aurora Breathing Ambient Light */}
      <div
        className="absolute top-1/3 left-1/2 w-[600px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'breatheAurora 10s ease-in-out infinite',
        }}
      />

      {/* Floating Fireflies / Embers */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: `0 0 ${p.size * 3}px ${p.glow}, 0 0 ${p.size * 6}px ${p.glow}`,
            animation: `floatParticle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
