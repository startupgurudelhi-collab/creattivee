import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: "multicolor" | "slate" | "white";
}

export default function Logo({
  className = "",
  size = "md",
  showText = true,
  textColor = "multicolor"
}: LogoProps) {
  // Determine dimensions based on size
  const iconDimensions = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-32 w-32"
  };

  const textSizes = {
    sm: "text-base tracking-tight font-black",
    md: "text-xl tracking-tight font-black",
    lg: "text-3xl tracking-tight font-black",
    xl: "text-4xl tracking-tight font-black"
  };

  // Multicolored letters styling matching user's logo exactly:
  // c: red/pink, r: orange, e: amber/yellow, a: lime, t: green, t: sky, i: indigo, v: blue, e: purple, e: pink
  const renderMulticolorText = () => {
    const letters = [
      { char: "c", color: "text-[#e91e63]" }, // Pinkish-Red
      { char: "r", color: "text-[#ff5722]" }, // Orange
      { char: "e", color: "text-[#ffc107]" }, // Amber/Yellow
      { char: "a", color: "text-[#8bc34a]" }, // Lime Green
      { char: "t", color: "text-[#4caf50]" }, // Green
      { char: "t", color: "text-[#00bcd4]" }, // Cyan
      { char: "i", color: "text-[#3f51b5]" }, // Indigo
      { char: "v", color: "text-[#2196f3]" }, // Blue
      { char: "e", color: "text-[#9c27b0]" }, // Purple
      { char: "e", color: "text-[#e91e63]" }  // Magenta
    ];

    return (
      <span className="font-display inline-flex">
        {letters.map((l, index) => (
          <span key={index} className={`${l.color} transition-all duration-300`}>
            {l.char}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Vector SVG Logo Icon */}
      <div className={`shrink-0 transition-transform duration-300 hover:scale-105 ${iconDimensions[size]}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Rainbow Outer Ring Gradient */}
            <linearGradient id="rainbowRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e91e63" />   {/* Pink/Red */}
              <stop offset="20%" stopColor="#ff5722" />  {/* Orange */}
              <stop offset="40%" stopColor="#ffeb3b" />  {/* Yellow */}
              <stop offset="60%" stopColor="#4caf50" />  {/* Green */}
              <stop offset="80%" stopColor="#2196f3" />  {/* Blue */}
              <stop offset="100%" stopColor="#9c27b0" /> {/* Purple */}
            </linearGradient>

            {/* Play Button Outer-ring/Gradient Segment */}
            <linearGradient id="playSegmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e91e63" />
              <stop offset="40%" stopColor="#ff9800" />
              <stop offset="70%" stopColor="#ffeb3b" />
              <stop offset="100%" stopColor="#00bcd4" />
            </linearGradient>

            {/* Play Button Inner Gradient */}
            <linearGradient id="playGradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#9c27b0" />  {/* Purple */}
              <stop offset="50%" stopColor="#03a9f4" /> {/* Light Blue */}
              <stop offset="100%" stopColor="#4caf50" />{/* Green */}
            </linearGradient>
          </defs>

          {/* White inner canvas circle for high contrast background */}
          <circle cx="60" cy="60" r="54" fill="#ffffff" />

          {/* Rainbow Gradient Outer Thin Ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="url(#rainbowRingGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Center Play Button Icon (Hollow stylized rounded triangular ring) */}
          <g transform="translate(60, 58) scale(1.05)">
            {/* Smooth outer rounded play shape */}
            <path
              d="M17.5 1.5 C22.2 4.4 22.2 11.6 17.5 14.5 L-8.5 29.5 C-13.5 32.4 -19.5 28.5 -19.5 22.5 L-19.5 -7.5 C-19.5 -13.5 -13.5 -17.4 -8.5 -14.5 Z"
              fill="url(#playSegmentGradient)"
            />
            {/* Hollow inner masking circle/triangle to make it a hollow play ring */}
            <path
              d="M7.5 1.5 C10.2 3.1 10.2 7.1 7.5 8.7 L-7.5 17.4 C-10.2 19.0 -13.5 16.8 -13.5 13.5 L-13.5 -3.5 C-13.5 -6.8 -10.2 -9.0 -7.5 -7.4 Z"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`font-display select-none select-none tracking-tight ${textSizes[size]}`}>
          {textColor === "multicolor" ? (
            renderMulticolorText()
          ) : (
            <span className={textColor === "white" ? "text-white" : "text-slate-800"}>
              creattivee
            </span>
          )}
        </span>
      )}
    </div>
  );
}
