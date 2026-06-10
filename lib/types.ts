export interface FloorData {
  name: string
  habitable_m2: number
  terrace_m2: number
  perimeter_m: number
  internal_walls_m: number
  height_m: number
  notes: string
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_FOUND'

export interface ExtractedField<T> {
  value: T | null
  confidence: Confidence
  source?: string
}

export interface ProjectData {
  client_name: ExtractedField<string>
  architect_firm: ExtractedField<string>
  architect_contacts: ExtractedField<string>
  project_address: ExtractedField<string>
  site_name: ExtractedField<string>
  floors: FloorData[]
  roof_m2: ExtractedField<number>
  gutter_length_m: ExtractedField<number>
  window_area_m2: ExtractedField<number>
  shutters_count: ExtractedField<number>
  entrance_doors: ExtractedField<number>
  large_span_beams_m: ExtractedField<number>
}

export interface FlaggedField {
  field: string
  label: string
  value: number | string | null
  unit: string
  confidence: Confidence
}

export interface LineItem {
  code: string
  description: string
  category: string
  qty: number
  unit: string
  unit_price: number
  total: number
}

export interface DerivedQuantities {
  ext_wall_surface: number
  int_wall_surface: number
  intermediate_slab: number
  commercial_area: number
  std_beam_length: number
  assembly_days: number
}

export interface ComputationResult {
  derived: DerivedQuantities
  line_items: LineItem[]
  subtotals: { STR: number; ENV: number; WIN: number; SITE: number }
  total_cost: number
  margin_pct: number
  selling_price: number
  vat_pct: number
  vat_amount: number
  final_total: number
}

export interface DwgShape {
  area_m2: number
  perimeter_m: number
  layer: string
  nearbyText: string[]
}
