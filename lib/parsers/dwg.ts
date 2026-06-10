import type { DwgShape } from '../types'

function shoelaceArea(pts: { x: number; y: number }[]): number {
  let area = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += pts[i].x * pts[j].y
    area -= pts[j].x * pts[i].y
  }
  return Math.abs(area) / 2
}

function calcPerimeter(pts: { x: number; y: number }[]): number {
  let p = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    const dx = pts[j].x - pts[i].x
    const dy = pts[j].y - pts[i].y
    p += Math.sqrt(dx * dx + dy * dy)
  }
  return p
}

function normalizeToMeters(value: number, rawAreaM2: number): number {
  // detect unit: if area > 1000 probably mm², divide by 1_000_000
  // if area > 10 and < 1000 probably m² already
  if (rawAreaM2 > 10000) return value / 1_000_000
  if (rawAreaM2 > 100) return value / 10_000  // cm²
  return value
}

export async function parseDWG(buffer: Buffer, fileExt = 'dwg'): Promise<{ shapes: DwgShape[]; texts: string[] }> {
  try {
    const { DwgReader, DxfReader, LwPolyline, TextEntity, MText } = await import('@node-projects/acad-ts')

    const isDxf = fileExt === 'dxf'
    let doc

    if (isDxf) {
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      doc = DxfReader.readFromStream(uint8)
    } else {
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer
      doc = DwgReader.readFromStream(arrayBuffer)
    }
    const shapes: DwgShape[] = []
    const texts: string[] = []

    if (!doc.entities) return { shapes, texts }

    const allTexts: { x: number; y: number; text: string }[] = []

    for (const entity of doc.entities) {
      if (entity instanceof TextEntity && entity.value) {
        texts.push(entity.value)
        allTexts.push({
          x: entity.insertPoint?.x ?? 0,
          y: entity.insertPoint?.y ?? 0,
          text: entity.value,
        })
      }
      if (entity instanceof MText && (entity as { value?: string }).value) {
        const val = (entity as { value: string }).value
        texts.push(val)
        const pos = (entity as { insertPoint?: { x: number; y: number } }).insertPoint
        allTexts.push({ x: pos?.x ?? 0, y: pos?.y ?? 0, text: val })
      }
    }

    for (const entity of doc.entities) {
      if (!(entity instanceof LwPolyline) || !entity.isClosed) continue
      if (entity.vertices.length < 3) continue

      const pts = entity.vertices.map((v) => ({ x: v.location.x, y: v.location.y }))
      const rawArea = shoelaceArea(pts)
      const rawPerimeter = calcPerimeter(pts)

      if (rawArea < 1) continue

      const area_m2 = normalizeToMeters(rawArea, rawArea)
      const perimeter_m = rawPerimeter > 1000
        ? rawPerimeter / 1000
        : rawPerimeter > 100
        ? rawPerimeter / 100
        : rawPerimeter

      if (area_m2 < 1 || area_m2 > 5000) continue

      // find nearby text labels (within bounding box of polygon)
      const minX = Math.min(...pts.map((p) => p.x))
      const maxX = Math.max(...pts.map((p) => p.x))
      const minY = Math.min(...pts.map((p) => p.y))
      const maxY = Math.max(...pts.map((p) => p.y))

      const nearbyText = allTexts
        .filter((t) => t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY)
        .map((t) => t.text)

      shapes.push({
        area_m2: Math.round(area_m2 * 100) / 100,
        perimeter_m: Math.round(perimeter_m * 100) / 100,
        layer: entity.layer?.name ?? '',
        nearbyText,
      })
    }

    // sort by area descending
    shapes.sort((a, b) => b.area_m2 - a.area_m2)
    return { shapes, texts }
  } catch (err) {
    console.error('[dwg-parser] failed:', err)
    return { shapes: [], texts: [] }
  }
}

export function formatDwgForAI(shapes: DwgShape[], texts: string[]): string {
  const lines: string[] = ['=== DWG EXTRACTED DATA ===', '']

  if (shapes.length > 0) {
    lines.push('CLOSED SHAPES (floor/roof areas):')
    shapes.forEach((s, i) => {
      lines.push(`  Shape ${i + 1}: area=${s.area_m2} m², perimeter=${s.perimeter_m} m, layer="${s.layer}"`)
      if (s.nearbyText.length > 0) {
        lines.push(`    Labels: ${s.nearbyText.slice(0, 5).join(' | ')}`)
      }
    })
    lines.push('')
  }

  if (texts.length > 0) {
    lines.push('TEXT ANNOTATIONS IN DRAWING:')
    const uniqueTexts = [...new Set(texts)].filter((t) => t.trim().length > 1)
    uniqueTexts.slice(0, 50).forEach((t) => lines.push(`  "${t.trim()}"`))
  }

  return lines.join('\n')
}
