import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdLeaderboard, AdNative, AdRectangle } from '@/components/AdSlot'
import Faq from '@/components/Faq'
import QuoteCalculator from '@/components/QuoteCalculator'
import { Breadcrumbs } from '@/components/Shell'
import {
  AgeTable,
  CarrierTable,
  CoverageTable,
  MinimumsTable,
  RecordTable,
} from '@/components/Tables'
import { CITIES, getCity, getState, nearbyCities } from '@/lib/data'
import { cityFaq, cityIntro } from '@/lib/copy'
import { estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

type Params = { state: string; city: string }

export function generateStaticParams() {
  return CITIES.map((c) => ({ state: c.stateSlug, city: c.slug }))
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

  const r = estimate(state, city.mult)
  const path = `/car-insurance/${stateSlug}/${citySlug}/`
  const title = `Car Insurance Quotes in ${city.name}, ${state.code} — ${money(r.monthly)}/mo Average`
  const description = `Compare car insurance rates in ${city.name}, ${state.code}. Full coverage averages an estimated ${money(r.annual)} a year. See rates by age, driving record and insurer, plus ${state.name} minimum requirements.`

  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path) },
  }
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { state: stateSlug, city: citySlug } = await params
  const state = getState(stateSlug)
  const city = getCity(stateSlug, citySlug)
  if (!state || !city) notFound()

  const r = estimate(state, city.mult)
  const min = estimate(state, city.mult, { coverage: 'minimum' })
  const faqs = cityFaq(city, state)
  const where = `${city.name}, ${state.code}`
  const nearby = nearbyCities(city)

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Car insurance', path: '/states/' },
    { name: state.name, path: `/car-insurance/${state.slug}/` },
    { name: city.name, path: `/car-insurance/${state.slug}/${city.slug}/` },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />

      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Car Insurance Quotes in {where}
      </h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Full coverage / year" value={money(r.annual)} accent />
        <Stat label="State minimum / year" value={money(min.annual)} />
        <Stat label="Typical quote range" value={`${money(r.low)} – ${money(r.high)}`} />
      </div>

      <p className="mt-5 text-lg">{cityIntro(city, state)}</p>

      <AdLeaderboard />

      <QuoteCalculator
        state={state}
        cityName={city.name}
        cityMult={city.mult}
        defaultZip={city.zips[0] ?? ''}
        sub={`${state.code}-${city.slug}`}
      />

      <h2>Cheapest car insurance companies in {where}</h2>
      <CarrierTable state={state} cityMult={city.mult} where={where} />

      <AdNative />

      <h2>Car insurance rates by age in {city.name}</h2>
      <AgeTable
        state={state}
        cityMult={city.mult}
        where={where}
        stateSlug={state.slug}
      />

      <h2>What a ticket, accident or DUI costs in {city.name}</h2>
      <RecordTable state={state} cityMult={city.mult} where={where} />

      <AdRectangle />

      <h2>Minimum car insurance requirements in {state.name}</h2>
      <p>
        Every driver registering a vehicle in {state.name} must carry at least the limits
        below. Driving without them risks fines, licence suspension and an SR-22 filing
        requirement. Verify current limits with the{' '}
        <a href={state.doi} rel="nofollow noopener" target="_blank">
          {state.name} Department of Insurance
        </a>
        .
      </p>
      <MinimumsTable state={state} />

      <h2>Coverage levels compared in {city.name}</h2>
      <CoverageTable state={state} cityMult={city.mult} where={where} />
      <p>
        Minimum liability is the cheapest legal option, but it pays nothing toward your
        own car. If your vehicle is worth more than roughly {money(3000)}, or you still
        owe money on it, full coverage is normally the rational choice — the lender will
        require it either way.
      </p>

      {city.zips.length > 0 && (
        <>
          <h2>ZIP codes we price in {city.name}</h2>
          <p>
            Rates move between ZIP codes inside the same city, sometimes by 15% or more,
            because claim frequency and theft rates are measured at ZIP level. {city.name}{' '}
            covers{' '}
            {city.zips.map((z, i) => (
              <span key={z}>
                {i > 0 ? ', ' : ''}
                <strong>{z}</strong>
              </span>
            ))}
            {' '}among others. Enter yours in the calculator above.
          </p>
        </>
      )}

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <AdLeaderboard />

      {nearby.length > 0 && (
        <>
          <h2>Car insurance in nearby cities</h2>
          <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {nearby.map((c) => (
              <Link
                key={c.slug}
                href={`/car-insurance/${c.stateSlug}/${c.slug}/`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-800 dark:text-slate-300"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <p>
            Comparing more of {state.name}?{' '}
            <Link href={`/car-insurance/${state.slug}/`}>
              See every {state.name} city we price
            </Link>{' '}
            or read the{' '}
            <Link href={`/cheap-car-insurance/${state.slug}/${city.slug}/`}>
              cheap car insurance guide for {city.name}
            </Link>
            .
          </p>
        </>
      )}
    </article>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={
        'rounded-xl border px-4 py-3 ' +
        (accent
          ? 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900')
      }
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  )
}
