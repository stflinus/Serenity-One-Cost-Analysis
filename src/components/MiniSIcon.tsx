import React from "react";
import logoImg from "../assets/images/company_logo.jpg";

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
      <img
        src={logoImg}
        alt="S Logo"
        width={size}
        height={size}
        className="object-contain rounded-md"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
