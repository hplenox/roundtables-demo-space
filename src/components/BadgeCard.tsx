import { BadgeType } from "@/lib/mock-badges";

// ── SVG icon paths rendered inside the badge shape ──────────────────────────

function GenderIcon({ color }: { color: string }) {
  return (
    <g>
      {/* Female symbol — circle + cross */}
      <circle cx="43" cy="38" r="7.5" fill="none" stroke={color} strokeWidth="2" />
      <line x1="43" y1="45.5" x2="43" y2="54" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="50" x2="47" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Male symbol — circle + arrow */}
      <circle cx="58" cy="33" r="7" fill="none" stroke={color} strokeWidth="2" />
      <line x1="63.5" y1="27.5" x2="69" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polyline points="64,22 69,22 69,27" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function TrendUpIcon({ color }: { color: string }) {
  return (
    <g>
      <polyline
        points="30,58 42,44 54,50 70,32"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <polyline
        points="62,29 70,32 67,40"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

function PeopleGroupIcon({ color }: { color: string }) {
  return (
    <g>
      {/* 5 person-circles */}
      <circle cx="50" cy="31" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="35" cy="43" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="65" cy="43" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="40" cy="57" r="7" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="60" cy="57" r="7" fill="none" stroke={color} strokeWidth="1.8" />
    </g>
  );
}

function TripleCirclesIcon({ color }: { color: string }) {
  return (
    <g>
      <circle cx="50" cy="34" r="11" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="52" r="11" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="60" cy="52" r="11" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function ChartArrowIcon({ color }: { color: string }) {
  return (
    <g>
      <line x1="28" y1="64" x2="72" y2="64" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      <polyline
        points="30,60 42,46 54,52 70,34"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <polyline
        points="62,31 70,34 67,42"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

function WaveArrowIcon({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M 26 54 C 32 44, 40 64, 50 54 C 60 44, 68 58, 74 52"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="50" y1="50" x2="50" y2="32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polyline
        points="44,38 50,32 56,38"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

function CrownIcon({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M 28 58 L 28 40 L 38 50 L 50 28 L 62 50 L 72 40 L 72 58 Z"
        fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <line x1="26" y1="63" x2="74" y2="63" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="40" r="2.5" fill={color} />
      <circle cx="72" cy="40" r="2.5" fill={color} />
      <circle cx="50" cy="28" r="2.5" fill={color} />
    </g>
  );
}

function Grid4Icon({ color }: { color: string }) {
  return (
    <g>
      <rect x="31" y="31" width="15" height="15" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
      <rect x="54" y="31" width="15" height="15" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
      <rect x="31" y="54" width="15" height="15" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
      <rect x="54" y="54" width="15" height="15" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function BadgeIconEl({ icon, color }: { icon: string; color: string }) {
  switch (icon) {
    case "gender":         return <GenderIcon color={color} />;
    case "trend_up":       return <TrendUpIcon color={color} />;
    case "people_group":   return <PeopleGroupIcon color={color} />;
    case "triple_circles": return <TripleCirclesIcon color={color} />;
    case "chart_arrow":    return <ChartArrowIcon color={color} />;
    case "wave_arrow":     return <WaveArrowIcon color={color} />;
    case "crown":          return <CrownIcon color={color} />;
    case "grid_4":         return <Grid4Icon color={color} />;
    default:               return null;
  }
}

// ── Badge shape wrappers ─────────────────────────────────────────────────────

function HexagonBadge({ badge }: { badge: BadgeType }) {
  const { primaryColor, bgColor, borderColor, icon, year } = badge;
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden>
      {/* Outer hex */}
      <polygon
        points="50,5 88,27 88,73 50,95 12,73 12,27"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2.5"
      />
      {/* Inner hex ring */}
      <polygon
        points="50,14 80,32 80,68 50,86 20,68 20,32"
        fill="none"
        stroke={primaryColor}
        strokeWidth="0.8"
        opacity="0.4"
      />
      <BadgeIconEl icon={icon} color={primaryColor} />
      <text
        x="50" y="79"
        textAnchor="middle"
        fontSize="8.5"
        fill={primaryColor}
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {year}
      </text>
    </svg>
  );
}

function ShieldBadge({ badge }: { badge: BadgeType }) {
  const { primaryColor, bgColor, borderColor, icon, year } = badge;
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden>
      {/* Outer shield */}
      <path
        d="M 50 6 L 88 22 L 88 58 Q 88 82 50 96 Q 12 82 12 58 L 12 22 Z"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2.5"
      />
      {/* Inner shield ring */}
      <path
        d="M 50 14 L 80 27 L 80 57 Q 80 75 50 88 Q 20 75 20 57 L 20 27 Z"
        fill="none"
        stroke={primaryColor}
        strokeWidth="0.8"
        opacity="0.4"
      />
      <BadgeIconEl icon={icon} color={primaryColor} />
      <text
        x="50" y="79"
        textAnchor="middle"
        fontSize="8.5"
        fill={primaryColor}
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {year}
      </text>
    </svg>
  );
}

function CircleBadge({ badge }: { badge: BadgeType }) {
  const { primaryColor, bgColor, borderColor, icon, year } = badge;
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden>
      <circle cx="50" cy="50" r="44" fill={bgColor} stroke={borderColor} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={primaryColor} strokeWidth="0.8" opacity="0.4" />
      <BadgeIconEl icon={icon} color={primaryColor} />
      <text
        x="50" y="79"
        textAnchor="middle"
        fontSize="8.5"
        fill={primaryColor}
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {year}
      </text>
    </svg>
  );
}

function BadgeGraphic({ badge }: { badge: BadgeType }) {
  switch (badge.shape) {
    case "hexagon": return <HexagonBadge badge={badge} />;
    case "shield":  return <ShieldBadge badge={badge} />;
    case "circle":  return <CircleBadge badge={badge} />;
  }
}

// ── Public BadgeCard component ───────────────────────────────────────────────

interface BadgeCardProps {
  badge: BadgeType;
  compact?: boolean;
}

export default function BadgeCard({ badge, compact = false }: BadgeCardProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{
          background: "rgba(15,25,35,0.6)",
          borderColor: badge.borderColor + "60",
        }}
      >
        <div className="shrink-0">
          <BadgeGraphic badge={badge} />
        </div>
        <div className="min-w-0">
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1"
            style={{
              background: badge.categoryBg,
              color: badge.categoryText,
              border: `1px solid ${badge.categoryBorder}`,
            }}
          >
            {badge.category}
          </span>
          <p className="text-white font-bold text-sm leading-tight">{badge.name}</p>
          <p className="text-white/55 text-xs mt-0.5 leading-snug">{badge.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center text-center rounded-2xl p-6 gap-4"
      style={{ background: "#18222e", border: `1px solid ${badge.borderColor}30` }}
    >
      {/* Badge graphic */}
      <div className="mt-1">
        <BadgeGraphic badge={badge} />
      </div>

      {/* Category pill */}
      <span
        className="text-[11px] font-semibold px-3 py-1 rounded-full"
        style={{
          background: badge.categoryBg,
          color: badge.categoryText,
          border: `1px solid ${badge.categoryBorder}`,
        }}
      >
        {badge.category}
      </span>

      {/* Name */}
      <p className="text-white font-bold text-[17px] leading-snug -mt-1">{badge.name}</p>

      {/* Description */}
      <p className="text-white/60 text-[13px] leading-relaxed max-w-[220px] -mt-2">
        {badge.description}
      </p>

      {/* Attribution */}
      <p className="text-white/30 text-[11px] -mt-1">
        Round Tables · Lenox Park Solutions
      </p>
    </div>
  );
}

// ── Mini badge icon for dashboard indicators ─────────────────────────────────

export function MiniBadgeIcon({ badge, size = 28 }: { badge: BadgeType; size?: number }) {
  return (
    <span title={badge.name}>
      {badge.shape === "hexagon" && (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
          <polygon
            points="50,5 88,27 88,73 50,95 12,73 12,27"
            fill={badge.bgColor}
            stroke={badge.borderColor}
            strokeWidth="5"
          />
          <BadgeIconEl icon={badge.icon} color={badge.primaryColor} />
        </svg>
      )}
      {badge.shape === "shield" && (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
          <path
            d="M 50 6 L 88 22 L 88 58 Q 88 82 50 96 Q 12 82 12 58 L 12 22 Z"
            fill={badge.bgColor}
            stroke={badge.borderColor}
            strokeWidth="5"
          />
          <BadgeIconEl icon={badge.icon} color={badge.primaryColor} />
        </svg>
      )}
      {badge.shape === "circle" && (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
          <circle cx="50" cy="50" r="44" fill={badge.bgColor} stroke={badge.borderColor} strokeWidth="5" />
          <BadgeIconEl icon={badge.icon} color={badge.primaryColor} />
        </svg>
      )}
    </span>
  );
}
