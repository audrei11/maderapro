import { NextRequest, NextResponse } from 'next/server'
import { parsePDF } from '@/lib/parsers/pdf'
import { parseDWG, formatDwgForAI } from '@/lib/parsers/dwg'
import { parseMSG } from '@/lib/parsers/msg'
import { extractProjectData, getFlaggedFields } from '@/lib/extractor'
import mammoth from 'mammoth'

export const config = { api: { bodyParser: false } }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDemoData(): any {
  return {
    client_name: { value: 'Garcia Family (private)', confidence: 'HIGH', source: 'email' },
    architect_firm: { value: 'M+M Arquitectos', confidence: 'HIGH', source: 'email' },
    architect_contacts: { value: 'Laura Martin, Carlos Vega', confidence: 'HIGH', source: 'email' },
    project_address: { value: 'Carrer Major 18, 08870 Sitges', confidence: 'HIGH', source: 'email' },
    site_name: { value: 'Sitges 042', confidence: 'HIGH', source: 'email' },
    floors: [
      { name: 'P0 - Ground floor', habitable_m2: 115, terrace_m2: 0, perimeter_m: 48, internal_walls_m: 32, height_m: 2.8, notes: 'Living + kitchen + 1 bedroom' },
      { name: 'P1 - First floor', habitable_m2: 110, terrace_m2: 30, perimeter_m: 46, internal_walls_m: 30, height_m: 2.8, notes: '3 bedrooms + 2 bathrooms' },
      { name: 'P2 - Attic / technical', habitable_m2: 15, terrace_m2: 0, perimeter_m: 12, internal_walls_m: 0, height_m: 1.5, notes: 'Low technical floor' },
    ],
    roof_m2: { value: 150, confidence: 'HIGH', source: 'dwg' },
    gutter_length_m: { value: 38, confidence: 'MEDIUM', source: 'dwg' },
    window_area_m2: { value: 43, confidence: 'MEDIUM', source: 'email' },
    shutters_count: { value: 14, confidence: 'HIGH', source: 'notes' },
    entrance_doors: { value: 1, confidence: 'HIGH', source: 'notes' },
    large_span_beams_m: { value: null, confidence: 'NOT_FOUND', source: '' },
  }
}

async function parseFile(name: string, buffer: Buffer): Promise<string> {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'pdf') {
    return `=== ${name} (PDF) ===\n${await parsePDF(buffer)}`
  }
  if (ext === 'msg') {
    return `=== ${name} (EMAIL) ===\n${await parseMSG(buffer)}`
  }
  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer })
    return `=== ${name} (DOCX) ===\n${result.value}`
  }
  if (ext === 'txt' || ext === 'md') {
    return `=== ${name} (TEXT) ===\n${buffer.toString('utf-8')}`
  }
  if (ext === 'dwg' || ext === 'dxf') {
    const { shapes, texts } = await parseDWG(buffer, ext)
    return formatDwgForAI(shapes, texts)
  }
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const notes = (formData.get('notes') as string) ?? ''
    const parts: string[] = []

    if (notes.trim()) {
      parts.push(`=== JAVIER'S NOTES ===\n${notes}`)
    }

    for (const [, value] of formData.entries()) {
      if (!(value instanceof File)) continue
      const buffer = Buffer.from(await value.arrayBuffer())
      const text = await parseFile(value.name, buffer)
      if (text.trim()) parts.push(text)
    }

    if (parts.length === 0) {
      return NextResponse.json({ error: 'No readable content found in uploaded files.' }, { status: 400 })
    }

    const combinedText = parts.join('\n\n')

    // DEMO MODE: return sample data when no API key is set
    const isDemoMode = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here'
    const projectData = isDemoMode ? getDemoData() : await extractProjectData(combinedText)
    const flaggedFields = getFlaggedFields(projectData)

    return NextResponse.json({ projectData, flaggedFields })
  } catch (err) {
    console.error('[/api/extract]', err)
    return NextResponse.json({ error: 'Extraction failed. Please try again.' }, { status: 500 })
  }
}
