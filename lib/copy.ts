import type { CityRow, StateRow } from './rates'
import { estimate, money } from './rates'

/** Deterministic per-slug pick, so a page's wording is stable across builds but
 *  varies from city to city — 3,000 pages sharing one paragraph is a thin-content
 *  signal, and this is the cheapest defence against it. */
export function pick<T>(seed: string, options: T[]): T {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return options[Math.abs(h) % options.length]
}

export function tierPhrase(tier: string): string {
  switch (tier) {
    case 'metro':
      return 'dense metro traffic, higher theft and vandalism claims, and expensive body-shop labour'
    case 'major':
      return 'city-level congestion, a higher share of uninsured drivers, and costlier repairs'
    case 'large':
      return 'steady commuter traffic and a moderate claim frequency'
    case 'mid':
      return 'typical suburban driving patterns'
    case 'small':
      return 'lighter traffic and below-average claim frequency'
    default:
      return 'low traffic density and few comprehensive claims'
  }
}

export function cityIntro(city: CityRow, state: StateRow): string {
  const full = estimate(state, city.mult).annual
  const min = estimate(state, city.mult, { coverage: 'minimum' }).annual
  const delta = Math.round((city.mult - 1) * 100)

  const openings = [
    `Drivers in ${city.name} pay an estimated ${money(full)} a year for full coverage car insurance, or about ${money(Math.round(full / 12))} a month.`,
    `Full coverage car insurance in ${city.name}, ${state.code} runs an estimated ${money(full)} per year — roughly ${money(Math.round(full / 12))} monthly.`,
    `The estimated cost of full coverage car insurance in ${city.name} is ${money(full)} a year, against ${money(min)} for a state-minimum policy.`,
  ]

  const middles =
    delta > 2
      ? [
          ` That sits about ${delta}% above the ${state.name} average, which is what you would expect from ${tierPhrase(city.tier)}.`,
          ` Rates here run roughly ${delta}% higher than the rest of ${state.name}, driven by ${tierPhrase(city.tier)}.`,
        ]
      : delta < -2
        ? [
            ` That is around ${Math.abs(delta)}% below the ${state.name} average, helped by ${tierPhrase(city.tier)}.`,
            ` Premiums here land roughly ${Math.abs(delta)}% under the ${state.name} average thanks to ${tierPhrase(city.tier)}.`,
          ]
        : [
            ` That tracks the ${state.name} average closely, reflecting ${tierPhrase(city.tier)}.`,
          ]

  const closings = [
    ` Your own number moves a long way from the average once age, driving record and ZIP code are applied — the calculator below applies all three.`,
    ` Two drivers on the same street routinely pay double the difference, so treat the average as a starting point and quote your own profile.`,
    ` Use the calculator below to price your actual age, vehicle and record instead of the city average.`,
  ]

  return (
    pick(city.slug + 'a', openings) +
    pick(city.slug + 'b', middles) +
    pick(city.slug + 'c', closings)
  )
}

export function cityFaq(city: CityRow, state: StateRow) {
  const full = estimate(state, city.mult).annual
  const min = estimate(state, city.mult, { coverage: 'minimum' }).annual
  const young = estimate(state, city.mult, { age: 18 }).annual
  const dui = estimate(state, city.mult, { record: 'dui' }).annual
  const req =
    state.bi1 > 0
      ? `${money(state.bi1)} bodily injury per person, ${money(state.bi2)} per accident and ${money(state.pd)} property damage`
      : `${money(state.pd)} property damage liability`

  return [
    {
      q: `How much is car insurance in ${city.name}, ${state.code}?`,
      a: `Full coverage in ${city.name} is estimated at ${money(full)} a year (${money(Math.round(full / 12))} a month) for a 35-year-old with a clean record. A state-minimum liability policy is estimated at ${money(min)} a year. Actual quotes vary with your ZIP, vehicle, credit tier where permitted, and claims history.`,
    },
    {
      q: `What is the minimum car insurance required in ${state.name}?`,
      a: `${state.name} requires at least ${req}${state.extras.length ? `, plus ${state.extras.join(', ').toLowerCase()}` : ''}. ${state.name} is ${state.noFault ? 'a no-fault state, so your own policy pays your initial medical costs regardless of who caused the crash' : 'an at-fault state, so the driver responsible for the crash pays for the damage'}.`,
    },
    {
      q: `Who has the cheapest car insurance in ${city.name}?`,
      a: `On our modelled comparison, Geico, State Farm and Progressive tend to price lowest in ${city.name} for clean records, with USAA lower still for military families. The order changes by ZIP code and driver profile, which is why quoting at least three carriers is worth doing at every renewal.`,
    },
    {
      q: `How much does car insurance cost for a teen driver in ${city.name}?`,
      a: `An 18-year-old in ${city.name} is estimated at ${money(young)} a year for full coverage — roughly ${Math.round((young / full - 1) * 100)}% above a 35-year-old on the same policy. Adding the teen to a parent's policy rather than buying a standalone one almost always costs less.`,
    },
    {
      q: `How much does a DUI raise insurance in ${city.name}?`,
      a: `A DUI takes the estimate from ${money(full)} to about ${money(dui)} a year in ${city.name}, an increase of roughly ${Math.round((dui / full - 1) * 100)}%. ${state.name} drivers with a DUI usually also need an SR-22 certificate filed by the insurer.`,
    },
    {
      q: `Can I lower my car insurance bill in ${city.name}?`,
      a: `The three changes with the largest effect are raising your deductible from $500 to $1,000 (about 9% off the comprehensive and collision portion), bundling home or renters cover, and re-shopping at renewal — loyalty rarely earns a discount. Low-mileage and telematics programmes are worth checking if you drive under 7,500 miles a year.`,
    },
  ]
}

export function stateIntro(state: StateRow, cityMult: number, cityCount: number): string {
  const full = estimate(state, cityMult).annual
  const min = estimate(state, cityMult, { coverage: 'minimum' }).annual
  return `Full coverage car insurance in ${state.name} is estimated at ${money(full)} a year, or ${money(Math.round(full / 12))} a month, for a 35-year-old driver with a clean record. A state-minimum liability policy comes in near ${money(min)} a year. ${state.name} is ${state.noFault ? 'a no-fault state' : 'an at-fault state'}, and drivers must carry ${state.bi1 > 0 ? `${state.bi1 / 1000}/${state.bi2 / 1000}/${state.pd / 1000} liability limits` : `at least ${money(state.pd)} of property damage liability`}. Below you will find estimated rates for ${cityCount.toLocaleString('en-US')} ${state.name} cities, a breakdown by age and driving record, and the coverage the state actually requires.`
}
