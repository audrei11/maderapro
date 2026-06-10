import type { ProjectData, ComputationResult, DerivedQuantities, LineItem } from './types'

const PARAMS = {
  margin: 0.30,
  vat: 0.21,
  terrace_coeff: 0.30,
  site_duration_months: 3,
  beam_rule: 0.18,        // m of beam per m2 of slab
  assembly_per_wall: 8,   // wall m2 per assembly day
}

const PRICELIST: Record<string, { description: string; category: string; unit: string; price: number }> = {
  'STR-001': { description: 'X-lam wall panel 140 mm (external load-bearing)', category: 'STR', unit: 'm2', price: 285 },
  'STR-002': { description: 'X-lam wall panel 100 mm (internal load-bearing)', category: 'STR', unit: 'm2', price: 230 },
  'STR-010': { description: 'GL24h glulam beam 200x400', category: 'STR', unit: 'm', price: 165 },
  'STR-011': { description: 'GL24h glulam beam 240x480 (large spans)', category: 'STR', unit: 'm', price: 245 },
  'STR-020': { description: 'X-lam intermediate slab 200 mm', category: 'STR', unit: 'm2', price: 315 },
  'STR-021': { description: 'X-lam roof slab 160 mm', category: 'STR', unit: 'm2', price: 295 },
  'ENV-001': { description: 'Wood-fibre insulation 200 mm (walls)', category: 'ENV', unit: 'm2', price: 78 },
  'ENV-002': { description: 'Wood-fibre insulation 240 mm (roof)', category: 'ENV', unit: 'm2', price: 92 },
  'ENV-003': { description: 'Ventilated facade - larch cladding', category: 'ENV', unit: 'm2', price: 145 },
  'ENV-004': { description: 'Ceramic tile roof package (membrane + tiles)', category: 'ENV', unit: 'm2', price: 95 },
  'ENV-005': { description: 'Aluminium flashings and gutter set', category: 'ENV', unit: 'm', price: 48 },
  'WIN-001': { description: 'Aluminium-clad timber window, triple glazing', category: 'WIN', unit: 'm2', price: 720 },
  'WIN-010': { description: 'External louvre shutter (manual)', category: 'WIN', unit: 'unit', price: 380 },
  'WIN-020': { description: 'Glazed aluminium entrance door', category: 'WIN', unit: 'unit', price: 1850 },
  'SITE-01': { description: 'Site crane rental (incl. operator, per month)', category: 'SITE', unit: 'month', price: 2200 },
  'SITE-02': { description: 'Facade scaffolding (per month)', category: 'SITE', unit: 'month', price: 950 },
  'SITE-10': { description: 'Engineering and project management (lump sum)', category: 'SITE', unit: 'ls', price: 18000 },
  'SITE-20': { description: 'On-site assembly labour', category: 'SITE', unit: 'day', price: 780 },
}

export function compute(data: ProjectData): ComputationResult {
  const floors = data.floors

  // Derived quantities
  const ext_wall_surface = floors.reduce((s, f) => s + f.perimeter_m * f.height_m, 0)
  const int_wall_surface = floors.reduce((s, f) => s + f.internal_walls_m * f.height_m, 0)
  const intermediate_slab = floors.slice(1).reduce((s, f) => s + f.habitable_m2, 0)
  const habitable_total = floors.reduce((s, f) => s + f.habitable_m2, 0)
  const terrace_total = floors.reduce((s, f) => s + f.terrace_m2, 0)
  const commercial_area = habitable_total + terrace_total * PARAMS.terrace_coeff
  const std_beam_length = Math.round(intermediate_slab * PARAMS.beam_rule * 10) / 10
  const assembly_days = Math.max(1, Math.round(ext_wall_surface / PARAMS.assembly_per_wall))

  const derived: DerivedQuantities = {
    ext_wall_surface: round2(ext_wall_surface),
    int_wall_surface: round2(int_wall_surface),
    intermediate_slab: round2(intermediate_slab),
    commercial_area: round2(commercial_area),
    std_beam_length,
    assembly_days,
  }

  const roof = data.roof_m2.value ?? 0
  const gutter = data.gutter_length_m.value ?? 0
  const windows = data.window_area_m2.value ?? 0
  const shutters = data.shutters_count.value ?? 0
  const doors = data.entrance_doors.value ?? 0
  const large_beams = data.large_span_beams_m.value ?? 0

  const quantities: Record<string, number> = {
    'STR-001': derived.ext_wall_surface,
    'STR-002': derived.int_wall_surface,
    'STR-010': derived.std_beam_length,
    'STR-011': large_beams,
    'STR-020': derived.intermediate_slab,
    'STR-021': roof,
    'ENV-001': derived.ext_wall_surface,
    'ENV-002': roof,
    'ENV-003': derived.ext_wall_surface,
    'ENV-004': roof,
    'ENV-005': gutter,
    'WIN-001': windows,
    'WIN-010': shutters,
    'WIN-020': doors,
    'SITE-01': PARAMS.site_duration_months,
    'SITE-02': PARAMS.site_duration_months,
    'SITE-10': 1,
    'SITE-20': assembly_days,
  }

  const line_items: LineItem[] = Object.entries(PRICELIST).map(([code, item]) => {
    const qty = round2(quantities[code] ?? 0)
    const total = round2(qty * item.price)
    return { code, description: item.description, category: item.category, qty, unit: item.unit, unit_price: item.price, total }
  })

  const subtotals = { STR: 0, ENV: 0, WIN: 0, SITE: 0 }
  for (const item of line_items) {
    subtotals[item.category as keyof typeof subtotals] += item.total
  }
  Object.keys(subtotals).forEach((k) => {
    subtotals[k as keyof typeof subtotals] = round2(subtotals[k as keyof typeof subtotals])
  })

  const total_cost = round2(Object.values(subtotals).reduce((s, v) => s + v, 0))
  const selling_price = round2(total_cost / (1 - PARAMS.margin))
  const vat_amount = round2(selling_price * PARAMS.vat)
  const final_total = round2(selling_price + vat_amount)

  return {
    derived,
    line_items,
    subtotals,
    total_cost,
    margin_pct: PARAMS.margin,
    selling_price,
    vat_pct: PARAMS.vat,
    vat_amount,
    final_total,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
