import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060606] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#060606]/70 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">🪵</span>
          <span className="font-bold tracking-tight text-white">MaderaPro</span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">AI</span>
        </div>
        <Link
          href="/app"
          className="group flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)]"
        >
          Try Demo
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">

        {/* background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-amber-500/[0.07] blur-[120px] rounded-full" />
          <div className="absolute inset-[20%] bg-amber-400/[0.05] blur-[80px] rounded-full" />
        </div>

        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-amber-500/25 bg-amber-500/[0.07] text-amber-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Wooden House Quoting · AI-Powered Quoting Assistant
          </div>

          <h1 className="text-[3.5rem] sm:text-[5rem] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6">
            <span className="block text-white/90">Your clients wait</span>
            <span className="block text-white/90">3–5 days for a quote.</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600">
              Make it Hours.
            </span>
          </h1>

          <p className="text-white/45 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Upload AutoCAD floor plans, client emails, and site notes.
            AI extracts every dimension, builds the full price breakdown, and exports
            a ready-to-send quote — with zero manual data entry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black text-base bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.35)] hover:shadow-[0_0_70px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-200"
            >
              Try the Free Demo
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <p className="text-white/25 text-sm">No signup · No API key required</p>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white" />
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-px">
          <div className="bg-white/[0.02] p-10 sm:rounded-l-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/20 mb-6">Before</p>
            {['Open AutoCAD, measure each room manually', 'Transfer numbers to Excel by hand', 'Calculate walls, windows, roof separately', 'Write the offer letter in Word', 'Send it 3–5 days later'].map(item => (
              <div key={item} className="flex items-start gap-3 mb-3">
                <span className="mt-0.5 text-red-500/60 shrink-0">✕</span>
                <span className="text-sm text-white/35 leading-snug">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/[0.04] p-10 sm:rounded-r-2xl border-l border-amber-500/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60 mb-6">After MaderaPro AI</p>
            {['Drop the DWG file — areas extracted automatically', 'Email and notes read in any language', 'Full 18-line pricing computed in seconds', 'DOCX offer letter generated instantly', 'Quote delivered the same day'].map(item => (
              <div key={item} className="flex items-start gap-3 mb-3">
                <span className="mt-0.5 text-amber-400 shrink-0">✓</span>
                <span className="text-sm text-white/70 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { n: '95%', sub: 'Less time per quote' },
            { n: '<15m', sub: 'From files to finished quote' },
            { n: '3 → 1', sub: 'Files become one output' },
          ].map(({ n, sub }) => (
            <div key={n} className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="text-3xl sm:text-4xl font-bold text-amber-400 mb-1">{n}</div>
              <div className="text-xs text-white/35">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">Process</p>
            <h2 className="text-3xl font-bold">Three steps. That&apos;s it.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: '1', icon: '📂', title: 'Upload your project files', desc: 'DWG/DXF floor plan, client email, and handwritten notes — all at once.' },
              { n: '2', icon: '🧠', title: 'AI reads and computes', desc: 'Extracts exact areas, perimeters, window counts, and special requirements from every file.' },
              { n: '3', icon: '📄', title: 'Download the full quote', desc: 'XLSX pricing sheet + DOCX offer letter — formatted exactly like your company template.' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="relative p-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all group">
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  {n}
                </div>
                <span className="text-3xl block mb-5">{icon}</span>
                <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">Capabilities</p>
          <h2 className="text-3xl font-bold">Built for accuracy, not guesswork.</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '📐', title: 'Mathematically exact geometry', desc: 'Shoelace formula on raw DWG polygon coordinates. Not OCR, not estimates — the real numbers from the CAD file.' },
            { icon: '🌍', title: 'Spanish · Catalan · English', desc: 'Extracts project details from documents in any language. No translation step. No lost nuance.' },
            { icon: '⚠️', title: 'Flags what it isn\'t sure about', desc: 'Every extracted field has a confidence score. LOW confidence fields are shown for human review — nothing slips through.' },
            { icon: '📊', title: 'Replicates your Excel exactly', desc: '18-line pricing breakdown matching the MaderaPro template: margins, VAT at 21%, assembly days, wall surfaces.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-amber-500/15 transition-all">
              <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
              <div>
                <h4 className="font-semibold text-white text-sm mb-1.5">{title}</h4>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] bg-amber-500/[0.07] blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-32 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Stop losing deals to<br />
            <span className="text-amber-400">slow quotes.</span>
          </h2>
          <p className="text-white/40 mb-10 leading-relaxed">
            Try the demo with real sample files — a complete Garcia Family project,
            ready to run through the entire pipeline.
          </p>
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-black text-lg bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.4)] hover:shadow-[0_0_80px_rgba(245,158,11,0.55)] hover:scale-[1.02] transition-all duration-200"
          >
            Start Free Demo
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white/20 text-sm">
          <span>🪵</span>
          <span>MaderaPro AI Quoting Assistant</span>
        </div>
        <p className="text-white/15 text-xs">Built with Next.js · Claude AI · AutoCAD geometry parsing</p>
      </footer>

    </main>
  )
}
