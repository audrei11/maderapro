import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="text-amber-400 text-xl">🪵</span>
          <span className="font-semibold text-white tracking-tight">MaderaPro</span>
          <span className="text-xs text-white/30 font-normal ml-1">AI Quoting</span>
        </div>
        <Link
          href="/app"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
        >
          Try Demo →
        </Link>
      </nav>

      {/* hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32">
        {/* glow */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Built for MaderaPro SL · Barcelona
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
            From 3–5 Days to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Under 15 Minutes.
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your floor plans, emails, and project notes. The AI reads everything,
            computes the full quote, and exports a client-ready document — automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_45px_rgba(245,158,11,0.45)] hover:scale-[1.02] transition-all duration-200"
            >
              Try the Free Demo
              <span className="text-base">→</span>
            </Link>
            <span className="text-white/25 text-sm">No account needed · No API key</span>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/5">
          {[
            { value: '95%', label: 'Less time per quote' },
            { value: '18', label: 'Pricing line items auto-calculated' },
            { value: '3', label: 'File types supported (DWG, PDF, Email)' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-10 px-6 text-center">
              <span className="text-4xl font-bold text-amber-400 mb-2">{value}</span>
              <span className="text-sm text-white/40 leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-white/40 text-sm">Three steps from files to finished quote</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Your Files',
              desc: 'Drop in the AutoCAD floor plan (.DWG/.DXF), client email, and any project notes. All in one go.',
              icon: '📂',
            },
            {
              step: '02',
              title: 'AI Reads Everything',
              desc: 'Claude extracts dimensions, window counts, materials, and special requirements — in Spanish, Catalan, or English.',
              icon: '🧠',
            },
            {
              step: '03',
              title: 'Download the Quote',
              desc: 'Get a complete XLSX breakdown and DOCX offer letter, matching your company template exactly.',
              icon: '📄',
            },
          ].map(({ step, title, desc, icon }) => (
            <div
              key={step}
              className="relative p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-mono text-amber-500/60">{step}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-3">Built for Precision</h2>
            <p className="text-white/40 text-sm">Every feature exists to reduce errors and save time</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: '📐',
                title: 'Exact DWG/DXF Geometry',
                desc: 'Uses Shoelace formula on actual polygon coordinates — not OCR estimates. Area and perimeter are mathematically exact.',
              },
              {
                icon: '🌍',
                title: 'Multilingual Extraction',
                desc: 'Reads project documents in Spanish, Catalan, and English. No manual translation needed.',
              },
              {
                icon: '⚠️',
                title: 'Confidence Scoring',
                desc: 'Fields the AI is unsure about are flagged for your review — so you always know what to double-check.',
              },
              {
                icon: '📊',
                title: 'Full Excel Replication',
                desc: '18-line pricing engine with margins, VAT, and assembly days — identical to your existing Excel template.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-xl border border-white/8 bg-transparent hover:border-amber-500/15 transition-all"
              >
                <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
                <div>
                  <h4 className="font-medium text-white mb-1">{title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] bg-amber-500/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to cut quote time by{' '}
            <span className="text-amber-400">95%?</span>
          </h2>
          <p className="text-white/40 mb-8 text-sm">
            No setup. No API key. Try the full demo with sample project files right now.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.45)] hover:scale-[1.02] transition-all duration-200 text-base"
          >
            Start Free Demo →
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/20 text-xs">
          MaderaPro AI Quoting Assistant · Built with Next.js + Claude AI
        </p>
      </footer>
    </main>
  )
}
