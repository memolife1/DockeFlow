import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { AnimatedDemo } from "./AnimatedDemo";
import { PainSection } from "./PainSection";
import { HowItWorks } from "./HowItWorks";
import { FeatureShowcase } from "./FeatureShowcase";
import { WhoItsFor } from "./WhoItsFor";
import { TimeSavings } from "./TimeSavings";
import { SocialProof } from "./SocialProof";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";

export function LandingPageContent() {
  return (
    <div className="lp min-h-screen overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <AnimatedDemo />
        <PainSection />
        <HowItWorks />
        <FeatureShowcase />
        <WhoItsFor />
        <TimeSavings />
        <SocialProof />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
