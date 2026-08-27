'use client'

import { useMemo, useState } from 'react'
import { affiliate, quoteLink } from '@/lib/config'
import {
  COVERAGE_LABEL,
  RECORD_LABEL,
  RECORD_MULT,
  VEHICLE_LABEL,
  VEHICLE_MULT,
  estimate,
  money,
  type Coverage,
  type Record_,
  type StateRow,
  type Vehicle,
} from '@/lib/rates'

type Props = {
  state: StateRow
  cityName?: string
  cityMult: number
  defaultZip: string
  sub: string
}

const field =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const labelCls =
  'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

export default function QuoteCalculator({
  state,
  cityName,
  cityMult,
  defaultZip,
  sub,
}: Props) {
  const [zip, setZip] = useState(defaultZip)
  const [age, setAge] = useState(35)
  const [record, setRecord] = useState<Record_>('clean')
  const [vehicle, setVehicle] = useState<Vehicle>('sedan')
  const [coverage, setCoverage] = useState<Coverage>('full')
  const [deductible, setDeductible] = useState(500)
  const [mileage, setMileage] = useState(12000)
  const [married, setMarried] = useState(false)

  const result = useMemo(
    () =>
      estimate(state, cityMult, {
        age,
        record,
        vehicle,
        coverage,
        deductible,
        mileage,
        married,
      }),
    [state, cityMult, age, record, vehicle, coverage, deductible, mileage, married],
  )

  const where = cityName ? `${cityName}, ${state.code}` : state.name

  return (
    <section
      id="calculator"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Car insurance calculator — {where}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Estimated from state average premiums and your rating factors. Not a quote.
        </p>
      </header>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="zip">
            ZIP code
          </label>
          <input
            id="zip"
            className={field}
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="age">
            Driver age — {age}
          </label>
          <input
            id="age"
            type="range"
            min={16}
            max={85}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-2 w-full accent-sky-600"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="record">
            Driving record
          </label>
          <select
            id="record"
            className={field}
            value={record}
            onChange={(e) => setRecord(e.target.value as Record_)}
          >
            {(Object.keys(RECORD_MULT) as Record_[]).map((k) => (
              <option key={k} value={k}>
                {RECORD_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="vehicle">
            Vehicle type
          </label>
          <select
            id="vehicle"
            className={field}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value as Vehicle)}
          >
            {(Object.keys(VEHICLE_MULT) as Vehicle[]).map((k) => (
              <option key={k} value={k}>
                {VEHICLE_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="coverage">
            Coverage level
          </label>
          <select
            id="coverage"
            className={field}
            value={coverage}
            onChange={(e) => setCoverage(e.target.value as Coverage)}
          >
            {(Object.keys(COVERAGE_LABEL) as Coverage[]).map((k) => (
              <option key={k} value={k}>
                {COVERAGE_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="deductible">
            Deductible
          </label>
          <select
            id="deductible"
            className={field}
            value={deductible}
            disabled={coverage === 'minimum'}
            onChange={(e) => setDeductible(Number(e.target.value))}
          >
            {[250, 500, 1000, 2000].map((d) => (
              <option key={d} value={d}>
                ${d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="mileage">
            Annual mileage
          </label>
          <select
            id="mileage"
            className={field}
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
          >
            {[5000, 7500, 12000, 15000, 20000, 25000].map((m) => (
              <option key={m} value={m}>
                {m.toLocaleString('en-US')} mi
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={married}
              onChange={(e) => setMarried(e.target.checked)}
              className="h-4 w-4 accent-sky-600"
            />
            Married
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-gradient-to-br from-sky-50 to-white px-5 py-6 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Your estimated premium
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {money(result.monthly)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">/ month</span>
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {money(result.annual)} per year · carriers in {where} typically quote{' '}
              <strong className="tabular-nums">{money(result.low)}</strong> –{' '}
              <strong className="tabular-nums">{money(result.high)}</strong>
            </div>
          </div>

          <a
            href={quoteLink(zip || defaultZip, sub)}
            rel="sponsored nofollow noopener"
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-6 py-3 text-base font-bold text-white no-underline shadow-lg shadow-sky-600/25 transition hover:bg-sky-500 active:scale-[.98]"
          >
            {affiliate.ctaLabel} →
          </a>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
          {affiliate.disclosure} Estimates are modelled, not quoted — see our{' '}
          <a className="underline" href="/methodology">
            methodology
          </a>
          .
        </p>
      </div>
    </section>
  )
}
