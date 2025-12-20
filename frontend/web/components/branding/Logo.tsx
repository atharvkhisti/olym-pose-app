import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 32, text: "text-lg" },
  md: { icon: 40, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {/* SVG Logo - Abstract figure in motion */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#gradient-bg)"
          fillOpacity="0.1"
        />
        
        {/* Abstract human figure in motion */}
        <g>
          {/* Head */}
          <circle cx="24" cy="12" r="4" fill="url(#gradient-primary)" />
          
          {/* Body core */}
          <path
            d="M24 16 L24 28"
            stroke="url(#gradient-primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Left arm - raised */}
          <path
            d="M24 20 L16 14"
            stroke="url(#gradient-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Right arm - extended */}
          <path
            d="M24 20 L34 18"
            stroke="url(#gradient-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Left leg - lunging */}
          <path
            d="M24 28 L18 40"
            stroke="url(#gradient-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Right leg - extended back */}
          <path
            d="M24 28 L32 36"
            stroke="url(#gradient-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Motion arc */}
          <path
            d="M8 24 Q12 20 16 24"
            stroke="url(#gradient-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <path
            d="M32 24 Q36 20 40 24"
            stroke="url(#gradient-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient-bg" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient-primary" x1="24" y1="8" x2="24" y2="40">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient-secondary" x1="16" y1="14" x2="34" y2="18">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="gradient-accent" x1="8" y1="24" x2="40" y2="24">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className={`font-display font-bold tracking-tight ${text}`}>
          <span className="text-brand-primary">Olym</span>
          <span className="text-content"> Pose</span>
        </span>
      )}
    </Link>
  );
}
