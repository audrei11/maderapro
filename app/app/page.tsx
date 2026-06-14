'use client'
import { useState, useRef } from 'react'
import type { ProjectData, FlaggedField, FloorData } from '@/lib/types'

type Step = 'upload' | 'processing' | 'review' | 'generating' | 'done' | 'error'
interface Summary { total_cost: number; selling_price: number; final_total: number; commercial_area: number }

const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2 })

const EXT_COLORS: Record<string, string> = {
  pdf: '#F87171', dwg: '#60A5FA', dxf: '#60A5FA',
  msg: '#FBBF24', txt: '#94A3B8', docx: '#A78BFA',
}

const STEPS = ['Upload', 'Review', 'Download']
const STEP_INDEX: Record<Step, number> = {
  upload: 0, processing: 0, review: 1, generating: 1, done: 2, error: 0
}

// ── Icons ───────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)
const FileIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
)

// ── Step Progress ────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300
                ${done ? 'bg-amber-500 border-amber-500 text-black' :
                  active ? 'bg-amber-500/15 border-amber-500/60 text-amber-400' :
                  'bg-white/4 border-white/10 text-white/25'}`}>
                {done ? <CheckIcon /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium tracking-wide transition-all
                ${active ? 'text-white/70' : done ? 'text-amber-500/70' : 'text-white/20'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-px mx-2 mb-5 transition-all duration-500
                ${done ? 'bg-amber-500/50' : 'bg-white/8'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [flagged, setFlagged] = useState<FlaggedField[]>([])
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const [xlsxB64, setXlsxB64] = useState('')
  const [docxB64, setDocxB64] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    setFiles(p => [...p, ...Array.from(e.dataTransfer.files)])
  }

  const handleExtract = async () => {
    if (!files.length && !notes.trim()) return
    setStep('processing')
    const form = new FormData()
    form.append('notes', notes)
    files.forEach(f => form.append('file', f))
    try {
      const res = await fetch('/api/extract', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setProjectData(json.projectData); setFlagged(json.flaggedFields ?? [])
      setStep('review')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); setStep('error') }
  }

  const applyCorrections = (): ProjectData => {
    const data = JSON.parse(JSON.stringify(projectData)) as ProjectData
    for (const [path, val] of Object.entries(corrections)) {
      if (!val.trim()) continue
      const parts = path.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let o: any = data
      for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]
      const num = parseFloat(val)
      if (!isNaN(num)) {
        if (o && 'value' in o) { o.value = num; o.confidence = 'HIGH' }
        else o[parts[parts.length - 1]] = num
      }
    }
    return data
  }

  const handleGenerate = async () => {
    setStep('generating')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData: applyCorrections() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setXlsxB64(json.xlsx_base64); setDocxB64(json.docx_base64); setSummary(json.summary)
      setStep('done')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); setStep('error') }
  }

  const download = (b64: string, name: string, mime: string) => {
    const blob = new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: mime })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
    a.click(); URL.revokeObjectURL(a.href)
  }

  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? ''

  return (
    <div className="relative min-h-screen" style={{ zIndex: 1 }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 10 }}
            className="w-8 h-8 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-black font-black text-sm">M</span>
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">MaderaPro</span>
            <span className="text-white/25 text-xs ml-2">AI Quote Generator</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/25">v1.0 MVP</span>
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────────────── */}
      <main className="relative z-10 max-w-lg mx-auto px-5 py-12">

        <StepBar current={STEP_INDEX[step]} />

        {/* ── UPLOAD ─────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                New Quote
              </h1>
              <p className="text-white/35 text-sm mt-2">Upload client files · AI extracts · Download in minutes</p>
            </div>

            {/* Sample downloads */}
            <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 14 }} className="p-4">
              <p className="text-xs font-semibold text-amber-500/70 mb-3 uppercase tracking-widest">Demo files</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ['📧', 'client_email.txt', '/samples/client_email.txt'],
                  ['📝', 'javier_notes.txt', '/samples/javier_notes.txt'],
                  ['📐', 'floor_plan.dxf', '/samples/floor_plan.dxf'],
                ].map(([icon, name, href]) => (
                  <a key={name} href={href} download
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}>
                    <span>{icon}</span>{name}
                  </a>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="relative cursor-pointer rounded-2xl p-10 text-center transition-all duration-200 overflow-hidden"
              style={{
                border: `2px dashed ${isDragging ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.09)'}`,
                background: isDragging ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.015)',
              }}>
              <input ref={fileRef} type="file" multiple className="hidden"
                accept=".pdf,.dwg,.dxf,.msg,.docx,.txt"
                onChange={e => setFiles(p => [...p, ...Array.from(e.target.files ?? [])])} />
              <div className="flex justify-center mb-4 text-white/20">
                <UploadIcon />
              </div>
              <p className="text-sm text-white/55">
                Drop files here or <span className="text-amber-400 font-semibold">browse</span>
              </p>
              <p className="text-xs text-white/20 mt-1.5 tracking-wider">PDF · DWG · DXF · MSG · DOCX · TXT</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => {
                  const ext = getExt(f.name)
                  const color = EXT_COLORS[ext] ?? '#94A3B8'
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <FileIcon color={color} />
                        <span className="text-sm text-white/75 font-medium">{f.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                          {ext.toUpperCase()}
                        </span>
                      </div>
                      <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                        className="text-white/15 hover:text-red-400 transition text-lg leading-none">×</button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                Notes from phone call
              </label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add any extra details from conversations with the client..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none transition-all outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
            </div>

            {/* CTA */}
            <button onClick={handleExtract} disabled={!files.length && !notes.trim()}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide text-black transition-all disabled:opacity-25"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}>
              Generate Quote →
            </button>
          </div>
        )}

        {/* ── PROCESSING ─────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="text-center py-12 space-y-8">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(245,158,11,0.12)' }} />
              <div className="absolute inset-1 rounded-full animate-spin"
                style={{ border: '2px solid transparent', borderTopColor: '#F59E0B' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">⚙️</div>
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent)', animation: 'pulse 2s infinite' }} />
            </div>
            <div>
              <p className="text-lg font-semibold">Processing your files</p>
              <p className="text-sm text-white/35 mt-1.5">AI is reading and extracting project data</p>
            </div>
            <div className="flex justify-center gap-8">
              {['Parse files', 'AI extract', 'Validate'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs text-white/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: `${i * 400}ms` }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEW ─────────────────────────────────────────── */}
        {step === 'review' && projectData && (
          <div className="space-y-5">
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <CheckIcon />
                </div>
                <h2 className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>Data Extracted</h2>
              </div>
              <p className="text-sm text-white/35 ml-7">
                {flagged.length === 0 ? 'All fields found. Ready to generate.' : `${flagged.length} field${flagged.length > 1 ? 's' : ''} need confirmation before generating.`}
              </p>
            </div>

            {/* Flagged */}
            {flagged.map(f => (
              <div key={f.field} className="rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">⚠</span>
                    <span className="text-sm font-semibold text-white/90">{f.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {f.confidence}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number"
                    defaultValue={f.value !== null ? String(f.value) : ''}
                    placeholder="0"
                    className="w-28 px-3 py-2.5 rounded-lg text-white font-bold text-base outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}
                    onChange={e => setCorrections(p => ({ ...p, [f.field]: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')} />
                  <span className="text-sm text-white/35">{f.unit}</span>
                </div>
              </div>
            ))}

            {/* Floors table */}
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Floor data extracted</p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-5 px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span>Floor</span><span>Hab m²</span><span>Ter m²</span><span>Perim</span><span>H m</span>
                </div>
                {projectData.floors.map((f: FloorData, i: number) => (
                  <div key={i} className="grid grid-cols-5 px-4 py-3 text-sm transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-white/70 font-medium truncate pr-2 text-xs">{f.name}</span>
                    <span className="text-white font-semibold">{f.habitable_m2}</span>
                    <span className="text-white/40">{f.terrace_m2 || '—'}</span>
                    <span className="text-white/40">{f.perimeter_m || '—'}</span>
                    <span className="text-white/40">{f.height_m}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide text-black transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}>
              Generate Files →
            </button>
          </div>
        )}

        {/* ── GENERATING ─────────────────────────────────────── */}
        {step === 'generating' && (
          <div className="text-center py-12 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(245,158,11,0.12)' }} />
              <div className="absolute inset-1 rounded-full animate-spin"
                style={{ border: '2px solid transparent', borderTopColor: '#F59E0B' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">📄</div>
            </div>
            <div>
              <p className="text-lg font-semibold">Building your files</p>
              <p className="text-sm text-white/35 mt-1">Generating XLSX and DOCX documents</p>
            </div>
          </div>
        )}

        {/* ── DONE ───────────────────────────────────────────── */}
        {step === 'done' && summary && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <span className="text-green-400 text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-extrabold" style={{ letterSpacing: '-0.03em' }}>Quote Ready</h2>
              <p className="text-white/35 text-sm mt-1.5">Both files generated successfully</p>
            </div>

            {/* Price card */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {[
                  ['Total cost', summary.total_cost],
                  ['Selling price (excl. VAT)', summary.selling_price],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-sm text-white/40">{label}</span>
                    <span className="text-sm text-white/70 font-mono">€ {fmt(val as number)}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 flex justify-between items-center"
                style={{ background: 'rgba(245,158,11,0.06)', borderTop: '1px solid rgba(245,158,11,0.15)' }}>
                <span className="font-bold text-sm text-white/80">TOTAL incl. VAT</span>
                <span className="text-2xl font-black text-amber-400 font-mono" style={{ letterSpacing: '-0.02em' }}>
                  €{fmt(summary.final_total)}
                </span>
              </div>
            </div>

            {/* Downloads */}
            <div className="space-y-2.5">
              <button onClick={() => download(xlsxB64, 'pricing_and_calculation.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}>
                <DownloadIcon />
                pricing_and_calculation.xlsx
              </button>
              <button onClick={() => download(docxB64, 'final_offer.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-black transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                <DownloadIcon />
                final_offer.docx
              </button>
            </div>

            <button onClick={() => { setStep('upload'); setFiles([]); setNotes(''); setSummary(null) }}
              className="w-full text-white/25 hover:text-white/50 text-xs transition py-2">
              ← Start new quote
            </button>
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="text-center py-12 space-y-5">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="text-red-400 text-xl font-bold">!</span>
            </div>
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm text-white/35 mt-1">{error}</p>
            </div>
            <button onClick={() => setStep('upload')}
              className="text-amber-400 hover:text-amber-300 text-sm transition underline underline-offset-4">
              Try again
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
