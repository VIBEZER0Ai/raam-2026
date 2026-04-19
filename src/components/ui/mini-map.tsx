/**
 * Stylised SVG placeholder map — not real cartography.
 * Replace with Mapbox GL + GPX overlay in Step B.
 */
export function MiniMap({ compact = false }: { compact?: boolean }) {
  const tsDots = [
    { x: 60,   y: 280 },
    { x: 200,  y: 215 },
    { x: 340,  y: 260 },
    { x: 490,  y: 232 },
    { x: 630,  y: 220 },
    { x: 800,  y: 235 },
    { x: 970,  y: 250 },
    { x: 1140, y: 225 },
    { x: 1290, y: 215 },
    { x: 1430, y: 200 },
    { x: 1560, y: 190 },
  ];
  const passed = tsDots.slice(0, 3);

  return (
    <div
      className="relative overflow-hidden border-0 bg-[#0b0b0f]"
      style={{ aspectRatio: compact ? "16 / 5" : "16 / 6" }}
    >
      <svg
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMid slice"
        className="block h-full w-full"
      >
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#18181b"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="1600" height="500" fill="url(#grid)" />
        <path
          d="M 40 280 Q 160 200 320 260 T 600 220 T 900 250 T 1240 210 T 1560 190"
          stroke="var(--strava-orange)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {tsDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="4" fill="#71717a" />
        ))}
        {passed.map((d, i) => (
          <circle key={`p${i}`} cx={d.x} cy={d.y} r="5" fill="#34d399" />
        ))}
        {/* Kabir — pulsing */}
        <g>
          <circle cx="448" cy="240" r="26" fill="var(--strava-orange)" opacity="0.2">
            <animate attributeName="r" from="14" to="32" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="448" cy="240" r="10" fill="var(--strava-orange)" stroke="#fff" strokeWidth="2" />
        </g>
        <polygon points="462,248 470,258 454,258" fill="var(--strava-orange)" stroke="#09090b" strokeWidth="1.5" />
        <polygon points="482,262 490,272 474,272" fill="#a1a1aa" stroke="#09090b" strokeWidth="1.5" />
        <rect x="438" y="220" width="12" height="12" fill="#a1a1aa" stroke="#09090b" strokeWidth="1.5" />
        <circle cx="448" cy="240" r="40" fill="none" stroke="var(--strava-orange)" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
        <circle cx="448" cy="240" r="80" fill="none" stroke="var(--strava-orange)" strokeWidth="1" strokeDasharray="3 4" opacity="0.2" />
        <text x="60" y="305" fontSize="11" fill="#71717a" fontFamily="ui-monospace, Menlo, monospace">Oceanside</text>
        <text x="1560" y="215" fontSize="11" fill="#71717a" fontFamily="ui-monospace, Menlo, monospace" textAnchor="end">Atlantic City</text>
        <text x="460" y="232" fontSize="11" fill="#fafafa" fontFamily="ui-monospace, Menlo, monospace" fontWeight="700">Kabir · mi 781.4</text>
      </svg>
    </div>
  );
}
