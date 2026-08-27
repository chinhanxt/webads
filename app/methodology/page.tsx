import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Shell'
import { site } from '@/lib/config'
import {
  AGE_BANDS,
  CARRIERS,
  COVERAGE_LABEL,
  RECORD_LABEL,
  RECORD_MULT,
  VEHICLE_LABEL,
  VEHICLE_MULT,
  ageMult,
  coverageBase,
  deductibleMult,
  estimate,
  maritalMult,
  mileageMult,
  type Record_,
  type StateRow,
  type Vehicle,
} from '@/lib/rates'
import { JsonLd, breadcrumbJsonLd, canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Methodology — How We Model Car Insurance Rates',
  description:
    'The full rating model behind every number on this site: the base rates, each multiplier and its value, the data sources, and what these estimates are not.',
  alternates: { canonical: canonical('/methodology/') },
}

/**
 * A synthetic state used only to read ratios back out of the model, so the
 * numbers printed on this page can never drift from lib/rates.ts.
 */
const REF: StateRow = {
  code: 'XX',
  name: 'Reference',
  slug: 'reference',
  bi1: 0,
  bi2: 0,
  pd: 0,
  extras: [],
  noFault: false,
  baseFull: 1_000_000,
  baseMin: 1_000_000,
  doi: '',
}

const TH =
  'bg-slate-50 px-4 py-3 text-left font-semibold dark:bg-slate-950'
const TD = 'border-t border-slate-100 px-4 py-3 dark:border-slate-800'
const TDN = `${TD} tabular-nums font-semibold text-slate-900 dark:text-white`

const CITY_TIERS: { tier: string; pop: string; mult: number }[] = [
  { tier: 'metro', pop: '1,000,000 and above', mult: 1.24 },
  { tier: 'major', pop: '400,000 – 999,999', mult: 1.16 },
  { tier: 'large', pop: '150,000 – 399,999', mult: 1.08 },
  { tier: 'mid', pop: '60,000 – 149,999', mult: 1.0 },
  { tier: 'small', pop: '30,000 – 59,999', mult: 0.94 },
  { tier: 'town', pop: 'below 30,000', mult: 0.89 },
]

const MILEAGE_BANDS: { label: string; miles: number }[] = [
  { label: '5,000 miles or less', miles: 5000 },
  { label: '5,001 – 7,500 miles', miles: 7500 },
  { label: '7,501 – 12,000 miles', miles: 12000 },
  { label: '12,001 – 15,000 miles', miles: 15000 },
  { label: '15,001 – 20,000 miles', miles: 20000 },
  { label: 'over 20,000 miles', miles: 25000 },
]

const DEDUCTIBLES = [250, 500, 1000, 2000]

const fx = (n: number) => n.toFixed(2) + 'x'

export default function Methodology() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Methodology', path: '/methodology/' },
  ]

  const premiumRatio = coverageBase(REF, 'premium') / REF.baseFull
  const ref = estimate(REF, 1)
  const lowRatio = ref.low / ref.annual
  const highRatio = ref.high / ref.annual

  return (
    <article className="prose-body">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        Methodology
      </h1>
      <p className="mt-5 text-lg">
        Every premium figure on {site.name} is produced by one arithmetic model. This
        page publishes that model in full: the base rate, each multiplier, the exact
        value of each multiplier, and the data behind them. If a number appears
        anywhere on this site, you can reproduce it from what is written here.
      </p>

      <h2>The formula</h2>
      <p>
        A single annual premium estimate is the state base rate for the chosen coverage
        level, multiplied by one factor for location and one factor for each driver and
        policy attribute:
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
        <code className="whitespace-nowrap text-slate-900 dark:text-slate-100">
          annual = stateBase(coverage) x cityMult x ageMult x recordMult x vehicleMult x
          deductibleMult x mileageMult x maritalMult
        </code>
      </div>
      <p>
        The monthly figure is the annual figure divided by twelve. The quoted range is
        the annual figure multiplied by {fx(lowRatio)} at the low end and{' '}
        {fx(highRatio)} at the high end, which reflects how far apart carriers routinely
        price the same risk. Results are rounded to whole dollars for display only;
        rounding is never fed back into the calculation.
      </p>
      <p>
        There is no machine learning, no personal data and no carrier rate filing behind
        any of this. It is a deterministic formula, and it is the same formula on every
        page of the site.
      </p>

      <h2>Base rate by coverage level</h2>
      <p>
        Each state carries two published base rates: a full-coverage average and a
        minimum-liability average. The coverage level selects between them.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Coverage level</th>
              <th className={TH}>What it means</th>
              <th className={TH}>Base rate used</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>Minimum</td>
              <td className={TD}>{COVERAGE_LABEL.minimum}</td>
              <td className={TD}>State minimum-liability average</td>
            </tr>
            <tr>
              <td className={TD}>Full</td>
              <td className={TD}>{COVERAGE_LABEL.full}</td>
              <td className={TD}>State full-coverage average</td>
            </tr>
            <tr>
              <td className={TD}>Premium</td>
              <td className={TD}>{COVERAGE_LABEL.premium}</td>
              <td className={TD}>
                State full-coverage average x {fx(premiumRatio)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The per-state base rates and the statutory minimum limits are listed on the{' '}
        <Link href="/states/">state index</Link>.
      </p>

      <h2>City multiplier</h2>
      <p>
        Urban density is the strongest geographic driver of auto premiums: claim
        frequency, vehicle theft, litigation rates and repair labour cost all rise with
        it. Every city in our dataset is assigned to one of six density tiers by
        population, and the tier sets the multiplier applied to its state base rate.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Tier</th>
              <th className={TH}>City population</th>
              <th className={TH}>Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {CITY_TIERS.map((t) => (
              <tr key={t.tier}>
                <td className={TD}>{t.tier}</td>
                <td className={TD}>{t.pop}</td>
                <td className={TDN}>{fx(t.mult)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Population comes from the source dataset described below, not from a rating
        bureau. A city near a tier boundary can therefore sit one step above or below
        where a carrier would place it. State-level pages use the population-weighted
        average of their cities rather than a single tier.
      </p>

      <h2>Driver age</h2>
      <p>
        Age is the strongest single rating factor after location. The model interpolates
        linearly between the anchor points below, and clamps input to the 16–90 range.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Age</th>
              <th className={TH}>Multiplier</th>
              <th className={TH}>Relative to a 30-year-old</th>
            </tr>
          </thead>
          <tbody>
            {AGE_BANDS.map((a) => (
              <tr key={a}>
                <td className={TD}>{a}</td>
                <td className={TDN}>{fx(ageMult(a))}</td>
                <td className={TD}>
                  {Math.round((ageMult(a) / ageMult(30) - 1) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Driving record</h2>
      <p>
        A single violation is applied. The model does not compound multiple violations,
        and it does not age them out over three or five years the way a carrier
        surcharge schedule does.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Record</th>
              <th className={TH}>Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(RECORD_MULT) as Record_[]).map((k) => (
              <tr key={k}>
                <td className={TD}>{RECORD_LABEL[k]}</td>
                <td className={TDN}>{fx(RECORD_MULT[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Vehicle type</h2>
      <p>
        A body-style factor standing in for repair cost, theft rate and injury claim
        severity. It is a class factor, not a lookup of a specific year, make and model.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Vehicle</th>
              <th className={TH}>Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(VEHICLE_MULT) as Vehicle[]).map((k) => (
              <tr key={k}>
                <td className={TD}>{VEHICLE_LABEL[k]}</td>
                <td className={TDN}>{fx(VEHICLE_MULT[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Deductible</h2>
      <p>
        The deductible only moves the comprehensive and collision half of a policy, so
        it is applied to full and premium coverage and ignored entirely on minimum
        liability.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Deductible</th>
              <th className={TH}>Full / premium coverage</th>
              <th className={TH}>Minimum liability</th>
            </tr>
          </thead>
          <tbody>
            {DEDUCTIBLES.map((d) => (
              <tr key={d}>
                <td className={TD}>${d.toLocaleString('en-US')}</td>
                <td className={TDN}>{fx(deductibleMult(d, 'full'))}</td>
                <td className={TD}>{fx(deductibleMult(d, 'minimum'))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Annual mileage</h2>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Annual mileage</th>
              <th className={TH}>Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {MILEAGE_BANDS.map((m) => (
              <tr key={m.label}>
                <td className={TD}>{m.label}</td>
                <td className={TDN}>{fx(mileageMult(m.miles))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Marital status</h2>
      <p>
        A married driver is modelled at {fx(maritalMult(true))} against{' '}
        {fx(maritalMult(false))} for an unmarried driver. This is the smallest factor in
        the model and several states restrict its use in real rating.
      </p>

      <h2>Carrier index</h2>
      <p>
        Carrier tables on this site rank a shortlist by a relative index, where 1.00 is
        a mid-market position. An index of 0.82 means the model places that carrier
        roughly 18 percent below the market estimate for the same driver. These are
        modelled relative positions used for ordering a list. They are not quoted
        prices, they are not derived from rate filings, and no carrier has reviewed or
        approved them.
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Carrier</th>
              <th className={TH}>Index</th>
              <th className={TH}>Modelled position</th>
            </tr>
          </thead>
          <tbody>
            {CARRIERS.map((c) => (
              <tr key={c.name}>
                <td className={TD}>{c.name}</td>
                <td className={TDN}>{c.index.toFixed(2)}</td>
                <td className={TD}>{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Worked example</h2>
      <p>
        A 25-year-old in a metro city, one at-fault accident, driving an SUV on full
        coverage with a $1,000 deductible, 15,000 miles a year, unmarried, in a state
        whose full-coverage base rate is $2,000:
      </p>
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
        <code className="whitespace-nowrap text-slate-900 dark:text-slate-100">
          2000 x {CITY_TIERS[0].mult} x {ageMult(25)} x {RECORD_MULT.accident} x{' '}
          {VEHICLE_MULT.suv} x {deductibleMult(1000, 'full')} x {mileageMult(15000)} x{' '}
          {maritalMult(false)} ={' '}
          {Math.round(
            2000 *
              CITY_TIERS[0].mult *
              ageMult(25) *
              RECORD_MULT.accident *
              VEHICLE_MULT.suv *
              deductibleMult(1000, 'full') *
              mileageMult(15000) *
              maritalMult(false),
          ).toLocaleString('en-US')}
        </code>
      </div>

      <h2>Data sources</h2>
      <ul>
        <li>
          <strong>City names, population and coordinates</strong> —{' '}
          <a
            href="https://download.geonames.org/export/dump/"
            rel="nofollow noopener"
            target="_blank"
          >
            GeoNames cities5000
          </a>
          , licensed under CC BY 4.0.
        </li>
        <li>
          <strong>ZIP codes</strong> — the open{' '}
          <a
            href="https://github.com/millbj92/US-Zip-Codes-JSON"
            rel="nofollow noopener"
            target="_blank"
          >
            US ZIP Codes JSON
          </a>{' '}
          dataset, matched to cities by name and state and, where no direct match
          exists, by nearest coordinates.
        </li>
        <li>
          <strong>Statutory minimum limits and no-fault status</strong> — the published
          requirements of each state Department of Insurance. Each state page links to
          its own regulator.
        </li>
        <li>
          <strong>State base rates</strong> — published industry state-average premium
          data for full coverage and for minimum liability.
        </li>
      </ul>
      <p>
        Source data is fetched and normalised at build time, so the site is a static
        snapshot. Averages lag the market, and rate filings change through the year.
      </p>

      <h2>Known limitations</h2>
      <ul>
        <li>
          The model has no credit-based insurance score, which is a major rating factor
          in most states and is prohibited in a few.
        </li>
        <li>
          It applies no discounts: multi-policy, multi-car, telematics, good student,
          defensive driving, paid-in-full and paperless are all absent.
        </li>
        <li>
          It does not price the specific year, make, model or trim of a vehicle, only a
          body-style class.
        </li>
        <li>
          It uses city-level density rather than the ZIP or garaging address a carrier
          rates on, and rates within a single city vary considerably by ZIP.
        </li>
        <li>
          It does not model claims history depth, coverage lapse, licence tenure,
          SR-22 filing surcharges or carrier-specific tier placement.
        </li>
        <li>
          Multipliers are independent and multiplicative. Real rating plans interact
          these factors, so the model is least accurate at the extremes, for example a
          teenage driver with a DUI.
        </li>
      </ul>

      <h2>What this is not</h2>
      <p>
        <strong>These figures are not a quote.</strong> Nothing on this site is an offer
        of insurance, a binding rate, or a price any carrier has agreed to. Only an
        insurer or a licensed agent can quote you, and only after underwriting your
        actual details.
      </p>
      <p>
        <strong>This is not insurance advice.</strong> {site.name} is not an insurer, an
        agent or a broker, and is not licensed to give advice on coverage, limits or
        claims. Decide what coverage you need with a licensed professional.
      </p>
      <p>
        <strong>We are not affiliated with any insurer.</strong> Carrier names appear
        for identification only and are the trademarks of their owners. No carrier
        sponsors, endorses or reviews this site, and no carrier supplies the numbers on
        it.
      </p>
      <p>
        <strong>The carrier index is not a price.</strong> Index values are modelled
        relative positions used to order a shortlist, not quoted premiums, and they say
        nothing about what a specific carrier would charge you.
      </p>
      <p>
        <strong>Your real premium will differ.</strong> The right way to use this site is
        as a reference point for what to expect, then to collect actual quotes from
        several carriers.
      </p>

      <h2>Corrections</h2>
      <p>
        If you find an error in a base rate, a minimum limit, a city assignment or the
        model itself, write to{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a> and we will check it and
        correct it in the next build.
      </p>
      <p>
        See also our <Link href="/terms/">terms of use</Link> and{' '}
        <Link href="/privacy/">privacy policy</Link>.
      </p>
    </article>
  )
}
