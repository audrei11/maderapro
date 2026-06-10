import Anthropic from '@anthropic-ai/sdk'
import type { ProjectData, FloorData, ExtractedField, Confidence } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function field<T>(value: T | null, confidence: Confidence, source?: string): ExtractedField<T> {
  return { value, confidence, source }
}

const SYSTEM_PROMPT = `You are extracting construction project data for a wooden house quoting system.
Documents may be in Spanish, Catalan, or English. Extract ONLY what is explicitly stated.
Return a single JSON object — no markdown, no explanation.

Confidence rules:
- HIGH: mentioned in 2+ sources, or very explicit
- MEDIUM: mentioned once, clear
- LOW: inferred or unclear
- NOT_FOUND: not in documents

Floor naming convention: use "P0 - Ground floor", "P1 - First floor", "P2 - Attic/technical", etc.`

const USER_TEMPLATE = (combinedText: string) => `
Extract from the following documents. Return ONLY this JSON structure:

{
  "client_name": { "value": string|null, "confidence": "HIGH"|"MEDIUM"|"LOW"|"NOT_FOUND", "source": string },
  "architect_firm": { "value": string|null, "confidence": "...", "source": string },
  "architect_contacts": { "value": string|null, "confidence": "...", "source": string },
  "project_address": { "value": string|null, "confidence": "...", "source": string },
  "site_name": { "value": string|null, "confidence": "...", "source": string },
  "floors": [
    {
      "name": "P0 - Ground floor",
      "habitable_m2": number,
      "terrace_m2": number,
      "perimeter_m": number,
      "internal_walls_m": number,
      "height_m": number,
      "notes": string
    }
  ],
  "roof_m2": { "value": number|null, "confidence": "...", "source": string },
  "gutter_length_m": { "value": number|null, "confidence": "...", "source": string },
  "window_area_m2": { "value": number|null, "confidence": "...", "source": string },
  "shutters_count": { "value": number|null, "confidence": "...", "source": string },
  "entrance_doors": { "value": number|null, "confidence": "...", "source": string },
  "large_span_beams_m": { "value": number|null, "confidence": "...", "source": string }
}

Rules:
- floors array: one entry per floor level found
- If a floor has no terrace, set terrace_m2 to 0
- Default height_m to 2.8 if not found (standard)
- For internal_walls_m: estimate from DWG shapes or set LOW confidence if not found
- large_span_beams_m: manual value for living room spans (often 8-12m), set NOT_FOUND if not mentioned

DOCUMENTS:
${combinedText}
`

export async function extractProjectData(combinedText: string): Promise<ProjectData> {
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: USER_TEMPLATE(combinedText) }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(raw) as ProjectData
    return parsed
  } catch {
    console.error('[extractor] JSON parse failed, raw:', raw.slice(0, 300))
    return emptyProjectData()
  }
}

function emptyProjectData(): ProjectData {
  const notFound = <T>(): ExtractedField<T> => field<T>(null, 'NOT_FOUND')
  const defaultFloor = (): FloorData => ({
    name: 'P0 - Ground floor',
    habitable_m2: 0,
    terrace_m2: 0,
    perimeter_m: 0,
    internal_walls_m: 0,
    height_m: 2.8,
    notes: '',
  })
  return {
    client_name: notFound(),
    architect_firm: notFound(),
    architect_contacts: notFound(),
    project_address: notFound(),
    site_name: notFound(),
    floors: [defaultFloor()],
    roof_m2: notFound(),
    gutter_length_m: notFound(),
    window_area_m2: notFound(),
    shutters_count: notFound(),
    entrance_doors: notFound(),
    large_span_beams_m: notFound(),
  }
}

export function getFlaggedFields(data: ProjectData): { field: string; label: string; value: number | string | null; unit: string; confidence: Confidence }[] {
  const flags: ReturnType<typeof getFlaggedFields> = []

  const checkNum = (key: keyof ProjectData, label: string, unit: string) => {
    const f = data[key] as ExtractedField<number>
    if (!f) return
    if (f.confidence === 'NOT_FOUND' || f.confidence === 'LOW' || f.value === null) {
      flags.push({ field: key as string, label, value: f.value, unit, confidence: f.confidence })
    }
  }

  checkNum('roof_m2', 'Roof projected area', 'm²')
  checkNum('gutter_length_m', 'Gutter + downpipe length', 'm')
  checkNum('window_area_m2', 'Total window area', 'm²')
  checkNum('shutters_count', 'Number of shutters', 'units')
  checkNum('entrance_doors', 'Entrance doors', 'units')
  checkNum('large_span_beams_m', 'Large-span beams (living room)', 'm')

  // check floors
  data.floors.forEach((floor, i) => {
    if (floor.perimeter_m === 0) {
      flags.push({ field: `floors.${i}.perimeter_m`, label: `${floor.name} — Perimeter`, value: null, unit: 'm', confidence: 'NOT_FOUND' })
    }
    if (floor.internal_walls_m === 0) {
      flags.push({ field: `floors.${i}.internal_walls_m`, label: `${floor.name} — Internal walls length`, value: null, unit: 'm', confidence: 'LOW' })
    }
  })

  return flags
}
