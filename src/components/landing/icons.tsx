import {
  Clock,
  Palette,
  Zap,
  PenLine,
  Download,
  ArrowRight,
  ArrowDown,
  Check,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-static";

const LP_ICONS = {
  clock: Clock,
  palette: Palette,
  zap: Zap,
  pen: PenLine,
  download: Download,
  arrowRight: ArrowRight,
  arrowDown: ArrowDown,
  check: Check,
  menu: Menu,
  x: X,
  chevronDown: ChevronDown,
  sparkles: Sparkles,
};

export type LpIconName = keyof typeof LP_ICONS;

// Renders one of the lucide-static SVGs (the same icon source the deck
// editor uses) with a custom size/color, server-render safe.
export function Icon({
  name,
  size = 24,
  color = "currentColor",
  className,
}: {
  name: LpIconName;
  size?: number;
  color?: string;
  className?: string;
}) {
  const svg = LP_ICONS[name]
    .replace(/width="24"/, `width="${size}"`)
    .replace(/height="24"/, `height="${size}"`)
    .replace(/stroke="currentColor"/, `stroke="${color}"`);
  return (
    <span
      className={className}
      style={{ display: "inline-flex", lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
