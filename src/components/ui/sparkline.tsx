export function Sparkline({
  points = [12, 18, 34, 22, 40, 28, 60, 42, 70, 55, 80, 62, 50, 40, 30],
  w = 200,
  h = 28,
  color = "var(--amber-400)",
}: {
  points?: number[];
  w?: number;
  h?: number;
  color?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = w / (points.length - 1);
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * step} ${
          h - ((p - min) / (max - min || 1)) * h * 0.9 - 2
        }`,
    )
    .join(" ");
  return (
    <svg
      className="block h-7 w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
