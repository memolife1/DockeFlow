import type { ChartSpec } from "@/lib/types";

// Lightweight SVG chart for the slide preview, styled to match the native
// PowerPoint charts the export produces: theme palette, no gridlines, quiet
// muted axis labels, values on bars.
export function MiniChart({
  chart,
  palette,
  mutedHex,
}: {
  chart: ChartSpec;
  palette: string[];
  mutedHex: string;
}) {
  const W = 400;
  const H = 260;
  const muted = `#${mutedHex}`;
  const colors = palette.map((c) => `#${c}`);

  if (chart.type === "pie") {
    const values = chart.series[0]?.values ?? [];
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let angle = -Math.PI / 2;
    const cx = 130;
    const cy = H / 2;
    const r = 95;
    const slices = values.map((v, i) => {
      const a0 = angle;
      const a1 = (angle += (v / total) * Math.PI * 2);
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
      const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      return (
        <path
          key={i}
          d={`M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`}
          fill={colors[i % colors.length]}
        />
      );
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        {slices}
        {chart.labels.map((l, i) => (
          <g key={i}>
            <rect x={255} y={40 + i * 30 - 8} width={11} height={11} rx={2} fill={colors[i % colors.length]} />
            <text x={272} y={40 + i * 30 + 2} fontSize={12} fill={muted}>
              {l.length > 16 ? l.slice(0, 15) + "…" : l}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  const values = chart.series[0]?.values ?? [];
  const max = Math.max(...values, 1);
  const padL = 8;
  const padB = 28;
  const plotW = W - padL * 2;
  const plotH = H - padB - 18;
  const n = Math.max(values.length, 1);

  if (chart.type === "line") {
    const pts = values.map((v, i) => [
      padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1)),
      18 + plotH - (v / max) * plotH,
    ]);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <polyline
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={colors[0]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={5} fill={colors[0]} />
        ))}
        {chart.labels.map((l, i) => (
          <text
            key={i}
            x={padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1))}
            y={H - 8}
            fontSize={12}
            fill={muted}
            textAnchor="middle"
          >
            {l.length > 9 ? l.slice(0, 8) + "…" : l}
          </text>
        ))}
      </svg>
    );
  }

  // bar
  const bw = Math.min(52, (plotW / n) * 0.55);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      {values.map((v, i) => {
        const x = padL + (plotW * (i + 0.5)) / n - bw / 2;
        const h = (v / max) * plotH;
        return (
          <g key={i}>
            <rect x={x} y={18 + plotH - h} width={bw} height={h} rx={3} fill={colors[0]} />
            <text x={x + bw / 2} y={18 + plotH - h - 6} fontSize={11} fill={muted} textAnchor="middle">
              {formatVal(v)}
            </text>
          </g>
        );
      })}
      {chart.labels.map((l, i) => (
        <text
          key={i}
          x={padL + (plotW * (i + 0.5)) / n}
          y={H - 8}
          fontSize={12}
          fill={muted}
          textAnchor="middle"
        >
          {l.length > 9 ? l.slice(0, 8) + "…" : l}
        </text>
      ))}
    </svg>
  );
}

function formatVal(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return String(v);
}
