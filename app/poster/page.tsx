export default function Poster() {
  return (
    <div
      style={{
        width: 1200,
        height: 1200,
        background: '#060606',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* dot grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* amber top glow */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 600,
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      {/* amber bottom glow */}
      <div style={{
        position: 'absolute', bottom: -100, right: -100,
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '56px 64px' }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🪵</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>MaderaPro</span>
            <span style={{
              marginLeft: 6, padding: '3px 10px', borderRadius: 6,
              background: 'rgba(245,158,11,0.12)', color: '#FBBF24',
              border: '1px solid rgba(245,158,11,0.25)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
            }}>AI QUOTING</span>
          </div>
          <div style={{
            padding: '8px 20px', borderRadius: 999,
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.06)',
            color: '#FBBF24', fontSize: 13, fontWeight: 600,
          }}>
            Built for Wooden House Projects
          </div>
        </div>

        {/* ── HERO STAT ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 18px', borderRadius: 999, marginBottom: 28,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            color: '#FBBF24', fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF24', display: 'inline-block' }} />
            AI-powered quoting assistant
          </div>

          <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, letterSpacing: '-3px', color: 'rgba(255,255,255,0.9)', marginBottom: 16 }}>
            3–5 Days
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '-1px', marginBottom: 16 }}>
            becomes
          </div>
          <div style={{
            fontSize: 100, fontWeight: 900, lineHeight: 1, letterSpacing: '-4px',
            background: 'linear-gradient(135deg, #FDE68A, #F59E0B, #D97706)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Hours.
          </div>
        </div>

        {/* ── BEFORE / AFTER ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {/* Before */}
          <div style={{
            padding: '24px 28px', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '2px', marginBottom: 16, textTransform: 'uppercase' }}>
              The Problem
            </div>
            {[
              'Open each file manually',
              'Extract every measurement by hand',
              'Build the pricing spreadsheet from scratch',
              'Write the offer letter in Word',
              'Owner does it all — not technical',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ color: 'rgba(239,68,68,0.7)', fontSize: 14, marginTop: 1 }}>✕</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* After */}
          <div style={{
            padding: '24px 28px', borderRadius: 16,
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.04)',
          }}>
            <div style={{ color: 'rgba(251,191,36,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '2px', marginBottom: 16, textTransform: 'uppercase' }}>
              The Solution
            </div>
            {[
              'DWG/DXF parsed — exact geometry, not OCR',
              'Reads emails & notes in Spanish/Catalan/English',
              'Flags uncertain fields for human review',
              'Full pricing breakdown computed automatically',
              'DOCX offer letter generated and ready to send ✓',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#FBBF24', fontSize: 14, marginTop: 1 }}>✓</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURE PILLS ── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 44, flexWrap: 'wrap' }}>
          {[
            { icon: '📐', label: 'Exact CAD geometry' },
            { icon: '🧠', label: 'Claude AI extraction' },
            { icon: '📊', label: 'Auto pricing engine' },
            { icon: '📄', label: 'XLSX + DOCX export' },
            { icon: '⚠️', label: 'Confidence scoring' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.09)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* ── TAGLINE ── */}
        <div style={{
          marginTop: 'auto', marginBottom: 36,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', gap: 12, alignItems: 'center',
            color: 'rgba(255,255,255,0.12)', fontSize: 13,
            fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase',
          }}>
            <span>Faster Quotes</span>
            <span style={{ color: '#F59E0B', fontSize: 6 }}>●</span>
            <span>Happier Clients</span>
            <span style={{ color: '#F59E0B', fontSize: 6 }}>●</span>
            <span style={{ color: '#F59E0B' }}>More Projects Won</span>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28,
        }}>
          <div />
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { n: '95%', l: 'Time saved' },
              { n: 'Hours', l: 'Not days' },
              { n: '3→1', l: 'Files to output' },
            ].map(({ n, l }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>{n}</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{
            padding: '12px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            color: '#000', fontWeight: 800, fontSize: 14,
          }}>
            Try Free Demo →
          </div>
        </div>

      </div>
    </div>
  )
}
