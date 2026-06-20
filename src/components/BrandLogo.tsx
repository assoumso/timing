import React from 'react';

interface BrandLogoProps {
  className?: string; // height styled classes, e.g. "h-12"
  isDarkBackground?: boolean;
  hideText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-14",
  isDarkBackground = false,
  hideText = false
}) => {
  const textColorClass = isDarkBackground ? "text-white" : "text-stone-800";
  const lineStroke = isDarkBackground ? "rgba(255,255,255,0.25)" : "#2f2f2f";

  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 560 110"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === ICON 1: ÉTIMOÉ (E) === */}
        {/* Stylized Outer Arcs */}
        {/* Large Left Orange Arc */}
        <path
          d="M 58 22 A 32 32 0 1 0 39 91"
          stroke="#ee7b11"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* complementary bottom right Red Arc */}
        <path
          d="M 39 91 A 32 32 0 0 0 71 50"
          stroke="#d02027"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner Stylized E Books - Orange and Red */}
        <g transform="translate(14, 0)">
          {/* Upper Book: Orange curve on left, with inner lines */}
          <path
            d="M 30,38 L 48,38 C 50,38 51,39 51,41 L 51,48 C 51,50 50,51 48,51 L 30,51"
            className="no-print"
            fill="#ee7b11"
          />
          {/* Spine of upper book */}
          <path
            d="M 30,38 C 25,38 23,41 23,44.5 C 23,48 25,51 30,51"
            fill="#d02027"
          />
          {/* Page lines of upper book */}
          <line x1="33" y1="41.5" x2="46" y2="41.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="33" y1="44.5" x2="46" y2="44.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="33" y1="47.5" x2="46" y2="47.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

          {/* Lower Book: Orange curve on left, with inner lines */}
          <path
            d="M 30,59 L 48,59 C 50,59 51,60 51,62 L 51,69 C 51,71 50,72 48,72 L 30,72"
            fill="#ee7b11"
          />
          {/* Spine of lower book */}
          <path
            d="M 30,59 C 25,59 23,62 23,65.5 C 23,69 25,72 30,72"
            fill="#d02027"
          />
          {/* Page lines of lower book */}
          <line x1="33" y1="62.5" x2="46" y2="62.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="33" y1="65.5" x2="46" y2="65.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="33" y1="68.5" x2="46" y2="68.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </g>


        {/* === ICON 2: MAKORÉ (M) === */}
        {/* Stylized Outer Arcs */}
        {/* Left gold arc */}
        <path
          d="M 143 23 A 32 32 0 1 0 120 91"
          stroke="#f3aa1c"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Cobalt Blue arc */}
        <path
          d="M 120 91 A 32 32 0 0 0 155 49"
          stroke="#0b4998"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner M-shaped Pages & Pencil - Gold and Blue */}
        <g transform="translate(100, 0)">
          {/* Custom paths for the "M" book-structure inside */}
          {/* Left golden arc arch */}
          <path
            d="M 23,68 L 23,49 C 23,43 29,38 34,44 C 39,38 45,43 45,49 L 45,68"
            stroke="#f3aa1c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Right blue arch/pencil line */}
          <path
            d="M 45,49 C 45,43 51,38 52,44 L 52,68"
            stroke="#0b4998"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Grid vertical page lines under left arch */}
          <line x1="28" y1="48" x2="28" y2="64" stroke="white" strokeWidth="1.2" />
          <line x1="33" y1="46" x2="33" y2="64" stroke="white" strokeWidth="1.2" />
          {/* Grid vertical page lines under middle arch */}
          <line x1="40" y1="46" x2="40" y2="64" stroke="white" strokeWidth="1.2" />
          <line x1="47" y1="48" x2="47" y2="64" stroke="white" strokeWidth="1.2" />
        </g>


        {/* === VERTICAL SEPARATOR LINE === */}
        <line
          x1="185"
          y1="25"
          x2="185"
          y2="85"
          stroke={lineStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />


        {/* === BRAND TEXT === */}
        {!hideText && (
          <g transform="translate(205, 0)">
            {/* L'école */}
            <text
              x="0"
              y="50"
              fill={isDarkBackground ? "#ffffff" : "#404040"}
              fontSize="24"
              fontWeight="400"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.08em"
            >
              L'école
            </text>
            {/* DES FAMILLES */}
            <text
              x="0"
              y="78"
              fill={isDarkBackground ? "#ffffff" : "#222222"}
              fontSize="23"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.18em"
            >
              DES FAMILLES
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
