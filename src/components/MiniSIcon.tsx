import React from "react";

interface MiniSIconProps {
  size?: number;
  className?: string;
}

export const MiniSIcon: React.FC<MiniSIconProps> = ({ size = 28, className = "" }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 p-1.5 shadow-md shadow-indigo-500/10 border border-indigo-500/30 shrink-0 ${className}`}
      style={{ width: size + 12, height: size + 12 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="miniSGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="miniInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Central embedded '1' silhouette */}
        <path
          d="M 44 34 L 52 30 L 52 68 L 44 68 L 44 72 L 60 72 L 60 68 L 54 68 L 54 30 L 44 34 Z"
          fill="#0f172a"
          opacity="0.25"
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
          fill="url(#miniSGrad)"
        />

        {/* Highlight inner line overlay */}
        <path
          d="M 24 26 C 24 26, 36 18, 50 18 C 65 18, 72 26, 64 36 C 56 46, 34 52, 26 66"
          stroke="url(#miniInnerGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
