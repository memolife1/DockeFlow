import Link from "next/link";

// Marketing homepage (converted from the Stitch design). Static/server
// component — the only interactive bits are real links into the app.
export default function HomePage() {
  return (
    <div className="font-jakarta bg-surface text-on-surface selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full top-0 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md sticky z-50 border-b border-outline-variant/30">
        <div className="flex items-center gap-sm">
          <div className="bg-primary p-1 rounded-lg">
            <span className="material-symbols-outlined text-white text-[24px]" data-icon="auto_awesome_motion">
              auto_awesome_motion
            </span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-primary">DeckeFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-xl font-semibold text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#">Features</a>
          <a className="hover:text-primary transition-colors" href="#">Solutions</a>
          <a className="hover:text-primary transition-colors" href="#">Pricing</a>
        </div>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="font-bold text-on-surface-variant hover:text-primary px-md py-xs"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-on-primary px-lg py-sm rounded-full font-bold transition-all hover:shadow-lg active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-gradient pt-xl pb-3xl px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center gap-xl">
            <div className="space-y-md max-w-4xl animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                The Future of Professional Slides
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.1]">
                A smarter way to present <span className="text-primary">high-stakes ideas.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
                Turn raw notes into executive-ready presentations. Engineered for sales leaders,
                consultants, and founders who demand precision.
              </p>
            </div>

            {/* Punchy CTA & Input Area */}
            <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl border border-outline-variant/50 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3">
                <span className="material-symbols-outlined text-outline mr-3" data-icon="edit_note">
                  edit_note
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-on-surface placeholder:text-outline/60 bg-transparent"
                  placeholder="A pitch deck for a fintech startup..."
                  type="text"
                />
              </div>
              <Link
                href="/signup"
                className="bg-primary text-white px-xl py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                Generate Deck
                <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Hero Visual */}
            <div className="w-full max-w-5xl mt-xl relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container slide-glow">
                {/* IMAGE PLACEHOLDER — swap in real asset */}
                <div className="w-full aspect-[16/9] bg-surface-container-high border border-dashed border-outline-variant flex items-center justify-center text-center p-lg">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-outline" data-icon="image">
                      image
                    </span>
                    <span className="text-sm font-semibold">Real product screenshot — Hero deck example</span>
                  </div>
                </div>
              </div>
              {/* Floating Detail Card */}
              <div className="absolute -bottom-6 -right-4 md:-right-12 bg-white p-lg rounded-xl shadow-2xl border border-outline-variant hidden sm:block max-w-[280px] text-left">
                <div className="flex items-center gap-sm mb-sm text-primary">
                  <span className="material-symbols-outlined" data-icon="insights">insights</span>
                  <span className="font-bold text-sm uppercase">AI Insights</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Chart data extracted from your raw Q4 CRM exports and automatically visualized for
                  clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* "Upload Your Template" Core Differentiator */}
        <section className="py-3xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3xl items-center">
            <div className="space-y-xl">
              <div className="space-y-md">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[16px]" data-icon="schedule">schedule</span>
                  Coming soon
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface leading-tight">
                  Your brand, <span className="text-primary italic">amplified.</span> Not replaced.
                </h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Unlike generic slide generators, DeckeFlow learns your visual DNA. Upload your
                  existing master template or brand book, and we&apos;ll ensure every pixel aligns
                  with your corporate identity.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                <div className="flex gap-md">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined" data-icon="upload_file">upload_file</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Upload Master</h4>
                    <p className="text-sm text-on-surface-variant">Drop your .pptx or .pdf brand guidelines.</p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined" data-icon="palette">palette</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">DNA Extraction</h4>
                    <p className="text-sm text-on-surface-variant">We map fonts, HEX colors, and layouts.</p>
                  </div>
                </div>
              </div>
              <button className="border-2 border-primary text-primary px-xl py-md rounded-xl font-bold hover:bg-primary hover:text-white transition-all inline-flex items-center gap-2">
                Join the waitlist
                <span className="material-symbols-outlined text-[20px]" data-icon="schedule">schedule</span>
              </button>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                {/* IMAGE PLACEHOLDER — swap in real asset */}
                <div className="w-full aspect-[4/3] rounded-xl bg-surface-container-high border border-dashed border-outline-variant flex items-center justify-center text-center p-lg">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-outline" data-icon="image">image</span>
                    <span className="text-sm font-semibold">Real product screenshot — Brand template example</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        {/* Professional Visuals Gallery */}
        <section className="py-3xl px-margin-mobile md:px-margin-desktop bg-white">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-2xl space-y-md">
              <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface">Precision for every professional.</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                High-fidelity layouts tailored for the people who close the deals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {[
                {
                  title: "For Sales Leaders",
                  body: "Complex revenue data transformed into persuasive narratives in seconds.",
                  label: "Real product screenshot — Sales deck example",
                },
                {
                  title: "For Consultants",
                  body: "Logical, editorial structures that guide stakeholders through complex strategies.",
                  label: "Real product screenshot — Consulting deck example",
                },
                {
                  title: "For Startup Founders",
                  body: "Investor-ready pitch decks with cinematic impact and perfect brand compliance.",
                  label: "Real product screenshot — Founder pitch example",
                },
              ].map((card) => (
                <div key={card.title} className="group flex flex-col gap-md">
                  <div className="aspect-video rounded-xl overflow-hidden border border-outline-variant/30 shadow-lg transition-all group-hover:scale-[1.02] group-hover:shadow-xl">
                    {/* IMAGE PLACEHOLDER — swap in real asset */}
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-center p-md">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[28px] text-outline" data-icon="image">image</span>
                        <span className="text-sm font-semibold px-2">{card.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{card.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* High Impact CTA Section */}
        <section className="py-3xl px-margin-mobile md:px-margin-desktop">
          <div className="max-w-screen-xl mx-auto bg-primary rounded-[2.5rem] p-xl md:p-3xl text-center text-white relative overflow-hidden shadow-2xl">
            {/* Decorative light patterns */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
            <div className="relative z-10 space-y-xl">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Ready to elevate your <br />presentation game?
              </h2>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                Built for professionals who present for a living.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-md">
                <Link
                  href="/signup"
                  className="bg-white text-primary px-xl py-md rounded-full font-extrabold text-lg transition-all hover:scale-105 shadow-xl"
                >
                  Get Started for Free
                </Link>
                <Link
                  href="/login"
                  className="bg-blue-700/50 backdrop-blur-md text-white border border-white/20 px-xl py-md rounded-full font-bold text-lg hover:bg-blue-700 transition-all"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface py-3xl px-margin-mobile md:px-margin-desktop border-t border-outline-variant/30">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-xl mb-3xl">
            <div className="col-span-2">
              <div className="flex items-center gap-sm mb-lg">
                <div className="bg-primary p-1 rounded-md">
                  <span className="material-symbols-outlined text-white text-[20px]" data-icon="auto_awesome_motion">
                    auto_awesome_motion
                  </span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-primary">DeckeFlow</span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
                The world&apos;s most advanced AI presentation engine for high-stakes professional use.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-lg">Product</h4>
              <ul className="space-y-md text-sm text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-lg">Resources</h4>
              <ul className="space-y-md text-sm text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Case Studies</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-lg">Company</h4>
              <ul className="space-y-md text-sm text-on-surface-variant">
                <li><a className="hover:text-primary transition-colors" href="#">About</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-xl border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-md text-xs text-outline font-semibold">
            <p>© 2026 DeckeFlow Inc. All rights reserved.</p>
            <div className="flex gap-xl">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile CTA (Hidden on desktop) */}
      <div className="fixed bottom-6 left-margin-mobile right-margin-mobile z-50 sm:hidden">
        <Link
          href="/signup"
          className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Get Started for Free
          <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
