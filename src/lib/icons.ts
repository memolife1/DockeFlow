// ~40 business icons, keyed by semantic name. SVG sources come from
// lucide-static (ISC license); the generation model picks icons by name.
// Preview renders the SVG inline; export rasterizes to PNG via canvas and
// embeds with addImage (native PowerPoint picture objects).

import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  User,
  ShieldAlert,
  Shield,
  DollarSign,
  Clock,
  Workflow,
  Lock,
  Lightbulb,
  Rocket,
  BarChart3,
  LineChart,
  PieChart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Calendar,
  Settings,
  Zap,
  Globe,
  Building2,
  Briefcase,
  Handshake,
  Heart,
  Star,
  Award,
  Layers,
  Package,
  Truck,
  Megaphone,
  Mail,
  Phone,
  Search,
  Filter,
  Repeat,
  Scale,
  Wallet,
  Gauge,
  Puzzle,
  Compass,
  Wrench,
} from "lucide-static";

export const ICON_MAP: Record<string, string> = {
  growth: TrendingUp,
  decline: TrendingDown,
  target: Target,
  team: Users,
  person: User,
  risk: ShieldAlert,
  security: Shield,
  money: DollarSign,
  time: Clock,
  process: Workflow,
  lock: Lock,
  idea: Lightbulb,
  launch: Rocket,
  chart: BarChart3,
  trend: LineChart,
  share: PieChart,
  check: CheckCircle2,
  fail: XCircle,
  warning: AlertTriangle,
  milestone: Flag,
  calendar: Calendar,
  settings: Settings,
  speed: Zap,
  global: Globe,
  company: Building2,
  business: Briefcase,
  partnership: Handshake,
  customer: Heart,
  quality: Star,
  award: Award,
  stack: Layers,
  product: Package,
  logistics: Truck,
  marketing: Megaphone,
  email: Mail,
  contact: Phone,
  research: Search,
  focus: Filter,
  retention: Repeat,
  balance: Scale,
  budget: Wallet,
  performance: Gauge,
  strategy: Puzzle,
  direction: Compass,
  operations: Wrench,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

// SVG string for a named icon, tinted and sized. Returns null for unknown
// names so callers can fall back to a plain marker.
export function iconSvg(name: string, hex: string, sizePx: number): string | null {
  const raw = ICON_MAP[name];
  if (!raw) return null;
  const color = hex.startsWith("#") ? hex : `#${hex}`;
  return raw
    .replace(/width="24"/, `width="${sizePx}"`)
    .replace(/height="24"/, `height="${sizePx}"`)
    .replace(/stroke="currentColor"/, `stroke="${color}"`);
}

// Rasterize an icon to a PNG data URI (browser only — the export runs
// client-side, so canvas replaces a server-side sharp pipeline).
const pngCache = new Map<string, string>();

export async function iconPngDataUri(
  name: string,
  hex: string,
  sizePx = 256,
): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const key = `${name}|${hex}|${sizePx}`;
  const hit = pngCache.get(key);
  if (hit) return hit;
  const svg = iconSvg(name, hex, sizePx);
  if (!svg) return null;

  const png = await new Promise<string | null>((resolve) => {
    const img = new Image();
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = sizePx;
        canvas.height = sizePx;
        const g = canvas.getContext("2d");
        if (!g) return resolve(null);
        g.drawImage(img, 0, 0, sizePx, sizePx);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  if (png) pngCache.set(key, png);
  return png;
}
