import React from "react";
import logoImg from "../assets/images/company_logo.jpg";

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
      {/* Exact company logo image loaded from assets */}
      <img
        src={logoImg}
        alt="Serenity 1 Logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0 drop-shadow-md object-contain rounded-lg"
        style={{ width: iconSize, height: iconSize }}
        referrerPolicy="no-referrer"
      />
      
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
