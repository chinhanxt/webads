'use client'

import { useState } from 'react'
import QuoteCalculator from './QuoteCalculator'
import type { StateRow } from '@/lib/rates'

export default function CalculatorHub({ states }: { states: StateRow[] }) {
  const [slug, setSlug] = useState('california')
  const state = states.find((s) => s.slug === slug) ?? states[0]

  return (
    <div>
      <div className="mb-4">
        <label
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          htmlFor="state-picker"
        >
          Your state
        </label>
        <select
          id="state-picker"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {states.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <QuoteCalculator
        key={state.slug}
        state={state}
        cityMult={1}
        defaultZip=""
        sub={`${state.code}-hub`}
      />
    </div>
  )
}
