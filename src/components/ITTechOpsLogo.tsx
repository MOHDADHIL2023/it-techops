import React from 'react';

interface ITTechOpsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const ITTechOpsLogo: React.FC<ITTechOpsLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const subtitleSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Modern High-Tech Vector Emblem */}
      <div className="relative flex-shrink-0 group">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Glow Defs */}
          <defs>
            <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0f2b5c" />
              <stop offset="100%" stopColor="#020f26" />
            </linearGradient>

            <linearGradient id="borderGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            <linearGradient id="coreGlow" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="neonPulse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Isometric Base */}
          <polygon
            points="24,2 44,12 44,36 24,46 4,36 4,12"
            fill="url(#shieldGrad)"
            stroke="url(#borderGrad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Circuit Traces */}
          <path
            d="M24 7 L38 14 L38 34 L24 41 L10 34 L10 14 Z"
            stroke="#1e40af"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.6"
          />

          {/* Cyber Server Chip Core */}
          <rect
            x="17"
            y="17"
            width="14"
            height="14"
            rx="3"
            fill="#091830"
            stroke="url(#coreGlow)"
            strokeWidth="1.8"
            filter="url(#neonPulse)"
          />

          {/* Integrated Circuit Pins */}
          <line x1="21" y1="13" x2="21" y2="17" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="27" y1="13" x2="27" y2="17" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="31" x2="21" y2="35" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="27" y1="31" x2="27" y2="35" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="21" x2="17" y2="21" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="27" x2="17" y2="27" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="31" y1="21" x2="35" y2="21" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="31" y1="27" x2="35" y2="27" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

          {/* Central Heartbeat / Terminal Prompt Chevron */}
          <path
            d="M21 21 L24 24 L21 27"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="25"
            y1="27"
            x2="28"
            y2="27"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Glowing Status Dot */}
          <circle cx="24" cy="4.5" r="1.5" fill="#10b981" />
          <circle cx="43" cy="13" r="1.2" fill="#38bdf8" />
          <circle cx="5" cy="13" r="1.2" fill="#38bdf8" />
        </svg>

        {/* Ambient Glow Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-cyan-400/20 rounded-full blur-xs opacity-60 -z-10 pointer-events-none" />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className={`font-black tracking-tight text-white font-sans ${titleSize}`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-200">
              I.T.
            </span>{' '}
            <span className="text-white">TechOps</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest">
            PRO
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center space-x-1 mt-1 text-slate-400 font-mono">
            <span className={`tracking-wider uppercase text-blue-200/80 font-medium ${subtitleSize}`}>
              Operations Management
            </span>
            <span className="text-blue-500 text-[10px]">·</span>
            <span className="text-emerald-400 font-semibold text-[9px]">SLA TIER-3</span>
          </div>
        )}
      </div>
    </div>
  );
};
