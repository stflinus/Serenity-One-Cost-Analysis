import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textColor?: string;
  subTextColor?: string;
}

export const SerenityLogo: React.FC<LogoProps> = ({
  className = "",
  iconSize = 44,
  textColor = "text-white",
  subTextColor = "text-indigo-200/70"
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic vector rendering of Serenity 1 spiral icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="inner1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* The '1' element standing inside the center hollow */}
        <path
          d="M 43 32 L 53 28 L 53 68 L 43 68 L 43 72 L 61 72 L 61 68 L 55 68 L 55 28 L 43 32 Z"
          fill="#0f172a"
          opacity="0.3"
        />

        {/* Background S ribbon path */}
        <path
          d="M 50 12 
             C 72 12, 85 24, 78 40 
             C 72 52, 54 58, 40 68 
             C 24 81, 40 88, 54 88 
             C 68 88, 80 84, 80 84 
             L 80 92 
             C 80 92, 66 94, 52 94 
             C 32 94, 18 84, 25 68 
             C 32 54, 54 48, 64 38 
             C 72 28, 65 20, 50 20 
             C 34 20, 24 26, 24 26 
             L 24 16 
             C 24 16, 36 12, 50 12 Z"
          fill="url(#sGrad)"
        />

        {/* Outer overlay for ribbon dimension */}
        <path
          d="M 24 26 C 24 26, 36 18, 50 18 C 65 18, 72 26, 64 36 C 56 46, 34 52, 26 66 C 21 76, 28 88, 48 91"
          stroke="url(#inner1Grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle cyan glow accent on the brand '1' */}
        <circle cx="50" cy="50" r="1.5" fill="#2dd4bf" filter="url(#glow)" />
      </svg>
      
      {/* Corporate Lettering */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`flex items-baseline gap-1.5 font-sans text-xl tracking-tight`}>
          <span className={`${textColor} font-extrabold`}>Serenity</span>
          <span className="text-cyan-400 font-black text-2xl drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">1</span>
        </div>
        <div className={`font-sans text-[8px] font-bold tracking-[0.24em] uppercase ${subTextColor}`}>
          Consulting Group
        </div>
      </div>
    </div>
  );
};
