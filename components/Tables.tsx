import Link from 'next/link'
import {
  AGE_BANDS,
  CARRIERS,
  COVERAGE_LABEL,
  RECORD_LABEL,
  RECORD_MULT,
  estimate,
  money,
  type Coverage,
  type Record_,
  type StateRow,
} from '@/lib/rates'

const wrap =
  'my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800'
const table = 'w-full min-w-[520px] border-collapse text-sm'
const th =
  'bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-300'
const td = 'border-t border-slate-100 px-4 py-3 text-slate-700 dark:border-slate-800 dark:text-slate-300'
const num = td + ' tabular-nums font-semibold text-slate-900 dark:text-white'

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="-mt-4 mb-6 text-xs text-slate-500 dark:text-slate-500">{children}</p>
  )
}

export function CarrierTable({
  state,
  cityMult,
  where,
}: {
  state: StateRow
  cityMult: number
  where: string
}) {
  const base = estimate(state, cityMult).annual
  const rows = [...CARRIERS].sort((a, b) => a.index - b.index)
  const cheapest = rows[0]

  return (
    <>
      <div className={wrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Insurer</th>
              <th className={th}>Est. annual</th>
              <th className={th}>Est. monthly</th>
              <th className={th}>vs. average</th>
              <th className={th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const annual = Math.round(base * c.index)
              const delta = Math.round((c.index - 1) * 100)
              return (
                <tr key={c.name}>
                  <td className={td + ' font-semibold text-slate-900 dark:text-white'}>
                    {c.name}
                  </td>
                  <td className={num}>{money(annual)}</td>
                  <td className={num}>{money(Math.round(annual / 12))}</td>
                  <td className={td}>
                    <span
                      className={
                        delta <= 0
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'font-semibold text-rose-600 dark:text-rose-400'
                      }
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}%
                    </span>
                  </td>
                  <td className={td}>{c.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Caption>
        Modelled estimates for a 35-year-old with a clean record and full coverage in{' '}
        {where}. {cheapest.name} tends to sit lowest, but the ranking flips constantly by
        ZIP and driver profile — which is exactly why quoting three carriers is worth the
        ten minutes.
      </Caption>
    </>
  )
}

export function AgeTable({
  state,
  cityMult,
  where,
  stateSlug,
}: {
  state: StateRow
  cityMult: number
  where: string
  stateSlug: string
}) {
  return (
    <>
      <div className={wrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Driver age</th>
              <th className={th}>Full coverage / yr</th>
              <th className={th}>Minimum / yr</th>
              <th className={th}>Full coverage / mo</th>
            </tr>
          </thead>
          <tbody>
            {AGE_BANDS.map((age) => {
              const full = estimate(state, cityMult, { age, coverage: 'full' })
              const min = estimate(state, cityMult, { age, coverage: 'minimum' })
              return (
                <tr key={age}>
                  <td className={td + ' font-semibold text-slate-900 dark:text-white'}>
                    <Link
                      className="no-underline hover:text-sky-600 hover:underline"
                      href={`/car-insurance-by-age/${stateSlug}/${age}`}
                    >
                      {age} years old
                    </Link>
                  </td>
                  <td className={num}>{money(full.annual)}</td>
                  <td className={num}>{money(min.annual)}</td>
                  <td className={num}>{money(full.monthly)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Caption>Estimated premiums by age in {where}, clean record, sedan.</Caption>
    </>
  )
}

export function RecordTable({
  state,
  cityMult,
  where,
}: {
  state: StateRow
  cityMult: number
  where: string
}) {
  const clean = estimate(state, cityMult, { record: 'clean' }).annual
  return (
    <>
      <div className={wrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Driving record</th>
              <th className={th}>Est. annual</th>
              <th className={th}>Increase</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(RECORD_MULT) as Record_[]).map((k) => {
              const annual = estimate(state, cityMult, { record: k }).annual
              const up = Math.round(((annual - clean) / clean) * 100)
              return (
                <tr key={k}>
                  <td className={td + ' font-semibold text-slate-900 dark:text-white'}>
                    {RECORD_LABEL[k]}
                  </td>
                  <td className={num}>{money(annual)}</td>
                  <td className={td}>
                    {up === 0 ? (
                      '—'
                    ) : (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        +{up}%
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Caption>
        What a violation costs a 35-year-old in {where}. Surcharges normally stay on the
        policy for three to five years.
      </Caption>
    </>
  )
}

export function CoverageTable({
  state,
  cityMult,
  where,
}: {
  state: StateRow
  cityMult: number
  where: string
}) {
  return (
    <>
      <div className={wrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Coverage level</th>
              <th className={th}>Est. annual</th>
              <th className={th}>Est. monthly</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(COVERAGE_LABEL) as Coverage[]).map((k) => {
              const r = estimate(state, cityMult, { coverage: k })
              return (
                <tr key={k}>
                  <td className={td + ' font-semibold text-slate-900 dark:text-white'}>
                    {COVERAGE_LABEL[k]}
                  </td>
                  <td className={num}>{money(r.annual)}</td>
                  <td className={num}>{money(r.monthly)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Caption>Coverage level comparison for {where}.</Caption>
    </>
  )
}

export function MinimumsTable({ state }: { state: StateRow }) {
  const rows: [string, string][] = []
  if (state.bi1 > 0) {
    rows.push(['Bodily injury liability, per person', money(state.bi1)])
    rows.push(['Bodily injury liability, per accident', money(state.bi2)])
  }
  rows.push(['Property damage liability', money(state.pd)])
  for (const e of state.extras) rows.push([e, 'Required'])

  return (
    <div className={wrap}>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Required coverage in {state.name}</th>
            <th className={th}>Minimum limit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className={td}>{k}</td>
              <td className={num}>{v}</td>
            </tr>
          ))}
          <tr>
            <td className={td}>Insurance system</td>
            <td className={num}>{state.noFault ? 'No-fault' : 'At-fault (tort)'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
