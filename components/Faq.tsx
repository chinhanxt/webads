export type Qa = { q: string; a: string }

export default function Faq({ items }: { items: Qa[] }) {
  return (
    <div className="my-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {items.map((item) => (
        <details key={item.q} className="group bg-white dark:bg-slate-900">
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-950">
            <span className="mr-2 inline-block text-sky-600 transition group-open:rotate-90">
              ▸
            </span>
            {item.q}
          </summary>
          <div className="px-5 pb-5 pl-12 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  )
}
