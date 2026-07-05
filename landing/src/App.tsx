import { HeroSection } from "./sections/HeroSection";
import { MarqueeSection } from "./sections/MarqueeSection";
import { ValueSection } from "./sections/ValueSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { TemplatesSection } from "./sections/TemplatesSection";

export default function App() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <HeroSection />
      <MarqueeSection />
      <ValueSection />
      <FeaturesSection />
      <TemplatesSection />

      <footer className="bg-ink px-5 pb-14 pt-6 text-paper sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <span className="font-display text-lg font-bold tracking-tight">
            Decke<span className="text-cobalt">Flow</span>
          </span>
          <span className="text-[11px] uppercase tracking-widest text-paper/40">
            Client-ready presentations from what you already have.
          </span>
        </div>
      </footer>
    </main>
  );
}
