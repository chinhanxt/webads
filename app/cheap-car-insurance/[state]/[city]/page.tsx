import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdLeaderboard, AdNative, AdRectangle } from '@/components/AdSlot'
import Faq from '@/components/Faq'
import QuoteCalculator from '@/components/QuoteCalculator'
import { Breadcrumbs } from '@/components/Shell'
import { CarrierTable, CoverageTable } from '@/components/Tables'
import { CHEAP_CITIES, getCity, getState } from '@/lib/data'
import { CARRIERS, estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

type Params = { state: string; city: string }

export function generateStaticParams() {
  return CHEAP_CITIES.map((c) => ({ state: c.stateSlug, city: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params
  const state = getState(stateSlug)
  const city = getCity(stateSlug, citySlug)
  if (!state || !city) return {}
  const min = estimate(state, city.mult, { coverage: 'minimum' })
  const path = `/cheap-car-insurance/${stateSlug}/${citySlug}/`
  const title = `Cheap Car Insurance in ${city.name}, ${state.code} — From ${money(Math.round(min.low / 12))}/mo`
  const description = `The cheapest car insurance in ${city.name}, ${state.code} starts near ${money(min.low)} a year for state-minimum liability. Compare the lowest-priced insurers and see how to cut your premium.`
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path) },
  }
}

export default async function CheapCityPage({ params }: { params: Promise<Params> }) {
  const { state: stateSlug, city: citySlug } = await params
  const state = getState(stateSlug)
  const city = getCity(stateSlug, citySlug)
  if (!state || !city) notFound()

  const full = estimate(state, city.mult)
  const min = estimate(state, city.mult, { coverage: 'minimum' })
  const where = `${city.name}, ${state.code}`
  const cheapest = [...CARRIERS].sort((a, b) => a.index - b.index)

  const faqs = [
    {
      q: `What is the cheapest car insurance in ${city.name}?`,
      a: `The cheapest legal option in ${city.name} is a ${state.name} state-minimum liability policy, estimated at ${money(min.annual)} a year (${money(min.monthly)} a month). On our modelled comparison ${cheapest[0].name} and ${cheapest[1].name} price lowest, though the ranking changes by ZIP code and driver profile.`,
    },
    {
      q: `How can I get cheap car insurance in ${city.name} with a bad driving record?`,
      a: `Carriers that specialise in non-standard risk — Progressive, The General and Direct Auto among them — normally beat standard insurers once you have a DUI or multiple at-fault accidents. Expect roughly ${money(estimate(state, city.mult, { record: 'dui' }).annual)} a year in ${city.name} after a DUI, and expect to need an SR-22 filing.`,
    },
    {
      q: `Is minimum coverage enough in ${city.name}?`,
      a: `It is legal, but ${state.bi1 ? `${money(state.bi1)} of bodily injury cover` : `${money(state.pd)} of property damage cover`} does not go far against a modern vehicle or a hospital bill, and it pays nothing toward repairing your own car. If your vehicle is financed, the lender will require full coverage regardless.`,
    },
    {
      q: `How much can I actually save by switching in ${city.name}?`,
      a: `The gap between the cheapest and most expensive carrier on an identical risk in ${city.name} runs from about ${money(Math.round(full.annual * cheapest[0].index))} to ${money(Math.round(full.annual * cheapest[cheapest.length - 1].index))} a year. Re-quoting takes about ten minutes and is the single highest-value thing you can do at renewal.`,
    },
  ]

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: state.name, path: `/car-insurance/${state.slug}/` },
    { name: city.name, path: `/car-insurance/${state.slug}/${city.slug}/` },
    { name: 'Cheap insurance', path: `/cheap-car-insurance/${state.slug}/${city.slug}/` },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Cheap Car Insurance in {where}
      </h1>

      <p className="mt-5 text-lg">
        The cheapest car insurance in {city.name} is a {state.name} state-minimum
        liability policy at an estimated {money(min.annual)} a year — about{' '}
        {money(min.monthly)} a month. Full coverage runs closer to {money(full.annual)}.
        The list below ranks insurers by estimated price for a clean-record driver in{' '}
        {city.name}, then covers the levers that actually move a premium.
      </p>

      <AdLeaderboard />

      <QuoteCalculator
        state={state}
        cityName={city.name}
        cityMult={city.mult}
        defaultZip={city.zips[0] ?? ''}
        sub={`${state.code}-${city.slug}-cheap`}
      />

      <h2>Cheapest insurers in {city.name}, ranked</h2>
      <CarrierTable state={state} cityMult={city.mult} where={where} />

      <AdNative />

      <h2>Minimum vs full coverage in {city.name}</h2>
      <CoverageTable state={state} cityMult={city.mult} where={where} />

      <h2>Seven ways to cut your {city.name} premium</h2>
      <ul>
        <li>
          <strong>Re-quote every renewal.</strong> Insurers price new business below
          renewal business. Staying put is the most common reason a premium drifts up.
        </li>
        <li>
          <strong>Raise the deductible to $1,000.</strong> Takes roughly 9% off the
          comprehensive and collision portion — worth it if you can absorb the excess.
        </li>
        <li>
          <strong>Bundle home or renters.</strong> Multi-policy discounts of 10–20% are
          standard, and renters insurance is cheap enough to pay for itself.
        </li>
        <li>
          <strong>Drop collision on an old car.</strong> Once the vehicle is worth less
          than about ten times the annual collision premium, the cover stops making
          arithmetic sense.
        </li>
        <li>
          <strong>Ask about low-mileage and telematics.</strong> Under 7,500 miles a year
          is worth roughly 6% on our model, and usage-based programmes can beat that.
        </li>
        <li>
          <strong>Pay in full.</strong> Monthly instalment fees add 3–8% over the term.
        </li>
        <li>
          <strong>Fix the credit-based insurance score</strong> where {state.name} permits
          its use — it moves premiums more than most drivers expect.
        </li>
      </ul>

      <AdRectangle />

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <p>
        Looking for the full picture?{' '}
        <Link href={`/car-insurance/${state.slug}/${city.slug}/`}>
          See average car insurance rates in {city.name}
        </Link>{' '}
        or{' '}
        <Link href={`/car-insurance/${state.slug}/`}>
          compare every city in {state.name}
        </Link>
        .
      </p>

      <AdLeaderboard />
    </article>
  )
}
