/**
 * Transparent premium estimator.
 *
 *   annual = stateBase(coverage) x cityMult x driverMults...
 *
 * stateBase comes from published state-average premium data; every other factor
 * is a documented multiplier (see /methodology). Nothing here is a real quote —
 * it is a modelled estimate, and every surface that renders it says so.
 */

export type Coverage = 'minimum' | 'full' | 'premium'
export type Record_ = 'clean' | 'ticket' | 'accident' | 'dui'
export type Vehicle = 'sedan' | 'suv' | 'truck' | 'minivan' | 'luxury' | 'sports' | 'ev'

export const AGE_BANDS = [16, 18, 20, 22, 25, 30, 40, 50, 60, 65, 70, 75] as const

/** Age is the strongest single rating factor after location. */
export function ageMult(age: number): number {
  const table: [number, number][] = [
    [16, 2.62], [17, 2.44], [18, 2.21], [19, 2.02], [20, 1.83], [21, 1.66],
    [22, 1.52], [23, 1.4], [24, 1.27], [25, 1.16], [26, 1.11], [28, 1.05],
    [30, 1.0], [35, 0.97], [40, 0.94], [45, 0.92], [50, 0.9], [55, 0.89],
    [60, 0.89], [65, 0.93], [70, 1.02], [75, 1.19], [80, 1.42],
  ]
  const a = Math.min(90, Math.max(16, Math.round(age)))
  let lo = table[0]
  for (const row of table) {
    if (row[0] <= a) lo = row
    else {
      const t = (a - lo[0]) / (row[0] - lo[0])
      return +(lo[1] + (row[1] - lo[1]) * t).toFixed(4)
    }
  }
  return lo[1]
}

export const RECORD_MULT: Record<Record_, number> = {
  clean: 1.0,
  ticket: 1.23,
  accident: 1.47,
  dui: 1.89,
}

export const RECORD_LABEL: Record<Record_, string> = {
  clean: 'Clean record',
  ticket: '1 speeding ticket',
  accident: '1 at-fault accident',
  dui: 'DUI / DWI',
}

export const VEHICLE_MULT: Record<Vehicle, number> = {
  sedan: 1.0,
  suv: 1.05,
  truck: 1.08,
  minivan: 0.95,
  luxury: 1.34,
  sports: 1.46,
  ev: 1.19,
}

export const VEHICLE_LABEL: Record<Vehicle, string> = {
  sedan: 'Sedan',
  suv: 'SUV / crossover',
  truck: 'Pickup truck',
  minivan: 'Minivan',
  luxury: 'Luxury car',
  sports: 'Sports car',
  ev: 'Electric vehicle',
}

export const COVERAGE_LABEL: Record<Coverage, string> = {
  minimum: 'State minimum liability',
  full: 'Full coverage (100/300/100 + comp & collision)',
  premium: 'Full coverage, high limits + low deductible',
}

/** Deductible only moves the comprehensive/collision half of a full policy. */
export function deductibleMult(d: number, coverage: Coverage): number {
  if (coverage === 'minimum') return 1
  const table: Record<number, number> = { 250: 1.11, 500: 1.0, 1000: 0.91, 2000: 0.84 }
  return table[d] ?? 1
}

export function mileageMult(miles: number): number {
  if (miles <= 5000) return 0.89
  if (miles <= 7500) return 0.94
  if (miles <= 12000) return 1.0
  if (miles <= 15000) return 1.06
  if (miles <= 20000) return 1.13
  return 1.2
}

export function maritalMult(married: boolean): number {
  return married ? 0.93 : 1.0
}

export type StateRow = {
  code: string
  name: string
  slug: string
  bi1: number
  bi2: number
  pd: number
  extras: string[]
  noFault: boolean
  baseFull: number
  baseMin: number
  doi: string
}

export type CityRow = {
  name: string
  slug: string
  state: string
  stateSlug: string
  pop: number
  lat: number
  lon: number
  zips: string[]
  tier: string
  mult: number
  rank: number
}

export function coverageBase(state: StateRow, coverage: Coverage): number {
  if (coverage === 'minimum') return state.baseMin
  if (coverage === 'premium') return state.baseFull * 1.19
  return state.baseFull
}

export type Profile = {
  age: number
  record: Record_
  vehicle: Vehicle
  coverage: Coverage
  deductible: number
  mileage: number
  married: boolean
}

export const DEFAULT_PROFILE: Profile = {
  age: 35,
  record: 'clean',
  vehicle: 'sedan',
  coverage: 'full',
  deductible: 500,
  mileage: 12000,
  married: false,
}

export function estimate(
  state: StateRow,
  cityMult: number,
  p: Partial<Profile> = {},
): { annual: number; monthly: number; low: number; high: number } {
  const f = { ...DEFAULT_PROFILE, ...p }
  const annual =
    coverageBase(state, f.coverage) *
    cityMult *
    ageMult(f.age) *
    RECORD_MULT[f.record] *
    VEHICLE_MULT[f.vehicle] *
    deductibleMult(f.deductible, f.coverage) *
    mileageMult(f.mileage) *
    maritalMult(f.married)

  const r = Math.round(annual)
  return {
    annual: r,
    monthly: Math.round(annual / 12),
    // Carrier-to-carrier spread on an identical risk is routinely 2x.
    low: Math.round(annual * 0.71),
    high: Math.round(annual * 1.38),
  }
}

/**
 * Relative pricing index per carrier. These are *modelled* positions used to
 * rank a shortlist, not quoted prices — replace with real rate-filing data when
 * you have it. Every table built from this is labelled as an estimate.
 */
export const CARRIERS: { name: string; index: number; note: string }[] = [
  { name: 'Geico', index: 0.82, note: 'Usually cheapest for clean records' },
  { name: 'State Farm', index: 0.88, note: 'Strong for young and student drivers' },
  { name: 'Progressive', index: 0.95, note: 'Competitive after a ticket or accident' },
  { name: 'Travelers', index: 0.97, note: 'Good multi-policy discounts' },
  { name: 'Nationwide', index: 1.0, note: 'Mid-market, wide availability' },
  { name: 'USAA', index: 0.76, note: 'Military members and families only' },
  { name: 'Allstate', index: 1.14, note: 'Higher base rate, heavy discount stacking' },
  { name: 'Farmers', index: 1.21, note: 'Agent-led, priced above market' },
]

export function money(n: number): string {
  return '$' + n.toLocaleString('en-US')
}
