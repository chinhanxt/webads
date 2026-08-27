import type { Metadata } from 'next'
import Link from 'next/link'
import { AdLeaderboard, AdNative } from '@/components/AdSlot'
import CalculatorHub from '@/components/CalculatorHub'
import Faq from '@/components/Faq'
import { Breadcrumbs } from '@/components/Shell'
import { STATES } from '@/lib/data'
import { JsonLd, breadcrumbJsonLd, canonical, faqJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Car Insurance Calculator — Estimate Your Premium in 30 Seconds',
  description:
    'Free car insurance calculator. Estimate your annual and monthly premium from your state, age, vehicle, driving record, deductible and mileage.',
  alternates: { canonical: canonical('/car-insurance-calculator/') },
}

const faqs = [
  {
    q: 'How accurate is this car insurance calculator?',
    a: 'It models a premium from published state average rates and the standard rating factors — location, age, vehicle class, driving record, deductible, mileage and marital status. It is a well-grounded estimate, not a quote: real carriers also rate on credit-based insurance scores where permitted, prior coverage history, VIN-level vehicle data and their own loss experience in your ZIP.',
  },
  {
    q: 'What actually determines my car insurance premium?',
    a: 'In rough order of impact: where you garage the car, your age, your driving record, the coverage limits and deductible you pick, the vehicle itself, and your annual mileage. Location and age together typically account for the majority of the variance between two drivers.',
  },
  {
    q: 'Why do quotes vary so much between insurers?',
    a: 'Each carrier files its own rating plan and weights the factors differently, so the same driver can be a preferred risk at one insurer and a surcharged risk at another. A 2x spread across carriers on an identical profile is normal, which is why comparison shopping pays.',
  },
  {
    q: 'Is full coverage worth it?',
    a: 'If the car is financed or leased, the lender requires it. If you own it outright, the usual rule of thumb is to drop collision once the vehicle is worth less than about ten times the annual collision premium.',
  },
]

export default function CalculatorPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Calculator', path: '/car-insurance-calculator/' },
  ]

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Car Insurance Calculator
      </h1>
      <p className="mt-5 text-lg">
        Pick your state and set your rating factors. The estimate updates instantly, using
        state average premiums as the base and the same factor categories carriers rate
        on. Nothing is submitted anywhere and no personal details are collected.
      </p>

      <AdLeaderboard />

      <CalculatorHub states={STATES} />

      <AdNative />

      <h2>How the calculation works</h2>
      <p>
        We start from the average annual premium in your state, adjust it for the density
        of the area you drive in, then apply multipliers for age, driving record, vehicle
        class, coverage level, deductible, annual mileage and marital status. Every
        multiplier is published on the{' '}
        <Link href="/methodology/">methodology page</Link> — no black box.
      </p>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <h2>Rates by state</h2>
      <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {STATES.map((s) => (
          <Link
            key={s.slug}
            href={`/car-insurance/${s.slug}/`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-800 dark:text-slate-300"
          >
            {s.name}
          </Link>
        ))}
      </div>

      <AdLeaderboard />
    </article>
  )
}
