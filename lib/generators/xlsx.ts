import * as XLSX from 'xlsx'
import type { ProjectData, ComputationResult } from '../types'

export function generateXLSX(data: ProjectData, result: ComputationResult): Buffer {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Parameters ──────────────────────────────────────────
  const paramsData = [
    ['TECHNICAL & COMMERCIAL PARAMETERS', '', '', ''],
    ['', '', '', ''],
    ['Parameter', 'Value', 'Unit', 'Notes'],
    ['Default commercial margin', '30%', '%', 'Applied to cost to get selling price'],
    ['VAT rate (Spain)', '21%', '%', 'Standard IVA'],
    ['Snow load (Sitges - coastal)', 0.40, 'kN/m2', 'Eurocode 1 - low-elevation coastal'],
    ['Standard floor height', 2.80, 'm', 'Used to derive wall surface from length'],
    ['External wall thickness (X-lam)', 140, 'mm', 'Default panel choice'],
    ['Internal wall thickness (X-lam)', 100, 'mm', 'Load-bearing internal walls'],
    ['Wood-fibre insulation - walls', 200, 'mm', 'Standard envelope'],
    ['Wood-fibre insulation - roof', 240, 'mm', 'Standard roof package'],
    ['Terrace commercial coefficient', '30%', '%', 'm2 terrace counted at 30% commercial'],
    ['Roof commercial coefficient', '0%', '%', 'Roof area not commercial'],
    ['Site duration (assumption)', 3.00, 'months', 'Crane + scaffolding rental basis'],
    ['', '', '', ''],
    ['Cells in green are inputs (you can change them); other sheets recompute automatically.', '', '', ''],
  ]
  const wsParams = XLSX.utils.aoa_to_sheet(paramsData)
  XLSX.utils.book_append_sheet(wb, wsParams, 'Parameters')

  // ── Sheet 2: Schedule ────────────────────────────────────────────
  const scheduleRows: (string | number)[][] = [
    ['Floor', 'Habitable area m2', 'Terrace area m2', 'Ext. perimeter (m)', 'Int. walls length (m)', 'Floor height (m)', 'Notes'],
  ]
  for (const f of data.floors) {
    scheduleRows.push([f.name, f.habitable_m2, f.terrace_m2, f.perimeter_m, f.internal_walls_m, f.height_m, f.notes])
  }
  scheduleRows.push(['TOTAL',
    data.floors.reduce((s, f) => s + f.habitable_m2, 0),
    data.floors.reduce((s, f) => s + f.terrace_m2, 0),
    data.floors.reduce((s, f) => s + f.perimeter_m, 0),
    data.floors.reduce((s, f) => s + f.internal_walls_m, 0),
    '', '',
  ])
  scheduleRows.push([])
  scheduleRows.push(['Roof data (input)', '', '', '', '', '', ''])
  scheduleRows.push(['Roof projected area (m2)', data.roof_m2.value ?? 0, '', '', '', '', ''])
  scheduleRows.push(['Gutter + downpipe length (m)', data.gutter_length_m.value ?? 0, '', '', '', '', ''])
  scheduleRows.push([])
  scheduleRows.push(['Windows and openings (input)', '', '', '', '', '', ''])
  scheduleRows.push(['Total window area (m2)', data.window_area_m2.value ?? 0, '', '', '', '', ''])
  scheduleRows.push(['Number of shutters (units)', data.shutters_count.value ?? 0, '', '', '', '', ''])
  scheduleRows.push(['Entrance doors (units)', data.entrance_doors.value ?? 0, '', '', '', '', ''])
  scheduleRows.push([])
  scheduleRows.push(['Derived quantities (auto-computed)', '', '', '', '', '', ''])
  scheduleRows.push(['External wall surface (m2)', result.derived.ext_wall_surface, '', '', '', '', ''])
  scheduleRows.push(['Internal wall surface (m2)', result.derived.int_wall_surface, '', '', '', '', ''])
  scheduleRows.push(['Intermediate slab area (m2)', result.derived.intermediate_slab, '', '', '', '', ''])
  scheduleRows.push(['Commercial area (m2)', result.derived.commercial_area, '', '', '', '', ''])
  scheduleRows.push(['Std glulam beams - total length (m)', result.derived.std_beam_length, '', '', '', '', ''])
  scheduleRows.push(['Large-span beams - length (m)', data.large_span_beams_m.value ?? 0, '', '', '', '', ''])

  const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleRows)
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Schedule')

  // ── Sheet 3: PriceList ───────────────────────────────────────────
  const priceData: (string | number)[][] = [
    ['PRICE LIST (cost prices, EUR)', '', '', '', ''],
    ['Code', 'Category', 'Description', 'Unit', 'Unit Price EUR'],
    ...result.line_items.map((i) => [i.code, i.category, i.description, i.unit, i.unit_price]),
  ]
  const wsPricelist = XLSX.utils.aoa_to_sheet(priceData)
  XLSX.utils.book_append_sheet(wb, wsPricelist, 'Pricelist')

  // ── Sheet 4: Computo ─────────────────────────────────────────────
  const computoData: (string | number)[][] = [
    ['QUOTE COMPUTATION', '', '', '', '', '', ''],
    ['Code', 'Description', 'Category', 'Qty', 'Unit', 'Unit Price', 'Total'],
    ...result.line_items.map((i) => [i.code, i.description, i.category, i.qty, i.unit, i.unit_price, i.total]),
    [],
    ['AGGREGATION BY CATEGORY', '', '', '', '', '', ''],
    ['STR', 'Structure (load-bearing timber, beams, slabs)', '', '', '', '', result.subtotals.STR],
    ['ENV', 'Envelope (insulation, facade, roof package)', '', '', '', '', result.subtotals.ENV],
    ['WIN', 'Windows, shutters, doors', '', '', '', '', result.subtotals.WIN],
    ['SITE', 'Site management (crane, scaffolding, engineering, labour)', '', '', '', '', result.subtotals.SITE],
    [],
    ['', 'TOTAL COST', '', '', '', '', result.total_cost],
    ['', 'Margin %', '', '', '', '', `${(result.margin_pct * 100).toFixed(0)}%`],
    ['', 'SELLING PRICE (excl. VAT)', '', '', '', '', result.selling_price],
    ['', `VAT (${(result.vat_pct * 100).toFixed(0)}%)`, '', '', '', '', result.vat_amount],
    ['', 'TOTAL incl. VAT', '', '', '', '', result.final_total],
  ]
  const wsComputo = XLSX.utils.aoa_to_sheet(computoData)
  XLSX.utils.book_append_sheet(wb, wsComputo, 'Computo')

  const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(xlsxBuffer)
}
