import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdLeaderboard, AdNative } from '@/components/AdSlot'
import Faq from '@/components/Faq'
import QuoteCalculator from '@/components/QuoteCalculator'
import { Breadcrumbs } from '@/components/Shell'
import { MinimumsTable, RecordTable } from '@/components/Tables'
import { STATES, getCities, getState, stateCityMult } from '@/lib/data'
import { estimate, money } from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

type Params = { state: string }

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { state: slug } = await params
  const state = getState(slug)
  if (!state) return {}
  const dui = estimate(state, stateCityMult(slug), { record: 'dui' })
  const path = `/sr22-insurance/${slug}/`
  const title = `SR-22 Insurance in ${state.name} — Cost, Rules & Cheapest Companies`
  const description = `SR-22 insurance in ${state.name} costs an estimated ${money(dui.annual)} a year after a DUI, plus a filing fee. Learn who needs an SR-22, how long it lasts and which insurers file it.`
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: { title, description, url: canonical(path) },
  }
}

export default async function Sr22Page({ params }: { params: Promise<Params> }) {
  const { state: slug } = await params
  const state = getState(slug)
  if (!state) notFound()

  const mult = stateCityMult(slug)
  const clean = estimate(state, mult)
  const dui = estimate(state, mult, { record: 'dui' })
  const cities = getCities(slug)

  const faqs = [
    {
      q: `How much does SR-22 insurance cost in ${state.name}?`,
      a: `The SR-22 filing itself is a one-off administrative fee, normally $15–$50. The real cost is the policy behind it: a ${state.name} driver with a DUI is estimated at ${money(dui.annual)} a year for full coverage against ${money(clean.annual)} with a clean record — an increase of about ${Math.round((dui.annual / clean.annual - 1) * 100)}%.`,
    },
    {
      q: `What is an SR-22 in ${state.name}?`,
      a: `An SR-22 is not insurance. It is a certificate your insurer files with the ${state.name} motor vehicle authority confirming you carry at least the state minimum liability limits. It exists so the state is notified the moment your policy lapses.`,
    },
    {
      q: `Who needs an SR-22 in ${state.name}?`,
      a: `Typically drivers convicted of DUI or DWI, drivers caught without insurance, drivers involved in an at-fault crash while uninsured, drivers with repeated serious violations, and anyone reinstating a suspended licence.`,
    },
    {
      q: `How long do I need an SR-22 in ${state.name}?`,
      a: `Three years is the most common requirement, though ${state.name} courts can order longer for repeat offences. The clock restarts if the policy lapses, so continuous cover matters more than the calendar date.`,
    },
    {
      q: `Which companies file SR-22s in ${state.name}?`,
      a: `Progressive, The General, Direct Auto and most non-standard carriers file SR-22s routinely. Several standard insurers will decline the risk outright, which is why the quoted price gap after a DUI is so wide — shop specifically for carriers that advertise SR-22 filing.`,
    },
  ]

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: state.name, path: `/car-insurance/${state.slug}/` },
    { name: 'SR-22', path: `/sr22-insurance/${state.slug}/` },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        SR-22 Insurance in {state.name}
      </h1>

      <p className="mt-5 text-lg">
        An SR-22 is a certificate of financial responsibility your insurer files with{' '}
        {state.name} on your behalf — usually after a DUI, an uninsured accident or a
        licence suspension. The filing fee is small. The policy behind it is not: expect
        roughly {money(dui.annual)} a year in {state.name} against {money(clean.annual)}{' '}
        for the same driver with a clean record.
      </p>

      <AdLeaderboard />

      <QuoteCalculator
        state={state}
        cityMult={mult}
        defaultZip={cities[0]?.zips[0] ?? ''}
        sub={`${state.code}-sr22`}
      />

      <h2>What violations cost in {state.name}</h2>
      <RecordTable state={state} cityMult={mult} where={state.name} />

      <AdNative />

      <h2>Coverage your SR-22 policy must carry</h2>
      <p>
        An SR-22 certifies that you hold at least {state.name}&apos;s statutory minimum
        limits. Anything less and the filing is invalid.
      </p>
      <MinimumsTable state={state} />

      <h2>How to get an SR-22 in {state.name}</h2>
      <ul>
        <li>Ask the insurer up front whether they file SR-22s — many will not.</li>
        <li>Buy a policy that meets or exceeds the {state.name} minimum limits.</li>
        <li>Pay the filing fee, normally $15–$50, once per filing.</li>
        <li>The insurer files the certificate with the state, typically within 48 hours.</li>
        <li>Keep the policy continuously in force — a lapse resets the requirement.</li>
      </ul>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <p>
        Also see{' '}
        <Link href={`/car-insurance/${state.slug}/`}>
          average car insurance rates in {state.name}
        </Link>
        .
      </p>

      <AdLeaderboard />
    </article>
  )
}
