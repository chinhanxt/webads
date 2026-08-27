'use client'

import { useEffect, useRef } from 'react'
import { ads } from '@/lib/config'

type BannerCfg = { key: string; width: number; height: number }

/**
 * Adsterra banner placement.
 *
 * Adsterra's banner snippet works by assigning a global `atOptions` object and
 * then loading invoke.js, which reads that global. Two banners on one page
 * therefore race and the second one wins twice. Rendering each placement into
 * its own `srcdoc` iframe gives every slot a private `window`, so any number of
 * them can coexist.
 */
function Banner({ cfg, label }: { cfg: BannerCfg; label?: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !cfg.key) return
    el.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head><body>
<script type="text/javascript">
atOptions = {"key":"${cfg.key}","format":"iframe","height":${cfg.height},"width":${cfg.width},"params":{}};
<\/script>
<script type="text/javascript" src="//www.highperformanceformat.com/${cfg.key}/invoke.js"><\/script>
</body></html>`
  }, [cfg.key, cfg.width, cfg.height])

  if (!ads.enabled || !cfg.key) {
    return (
      <div
        className="mx-auto flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[11px] uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
        style={{ width: cfg.width, height: cfg.height, maxWidth: '100%' }}
      >
        ad {cfg.width}x{cfg.height}
      </div>
    )
  }

  return (
    <div className="mx-auto" style={{ width: cfg.width, maxWidth: '100%' }}>
      {label ? (
        <div className="mb-1 text-center text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </div>
      ) : null}
      <iframe
        ref={ref}
        title="advertisement"
        width={cfg.width}
        height={cfg.height}
        scrolling="no"
        loading="lazy"
        style={{ border: 0, display: 'block', width: '100%', height: cfg.height }}
      />
    </div>
  )
}

/** Desktop leaderboard, swapped for a mobile banner under 768px. */
export function AdLeaderboard() {
  return (
    <div className="my-6">
      <div className="hidden md:block">
        <Banner cfg={ads.banner728} label="Advertisement" />
      </div>
      <div className="md:hidden">
        <Banner cfg={ads.banner320} label="Advertisement" />
      </div>
    </div>
  )
}

export function AdRectangle({ label = 'Advertisement' }: { label?: string }) {
  return (
    <div className="my-6">
      <Banner cfg={ads.banner300} label={label} />
    </div>
  )
}

/** Adsterra Native Banner — highest CTR unit on content pages. */
export function AdNative() {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current || !ads.enabled || !ads.nativeSrc) return
    mounted.current = true
    const s = document.createElement('script')
    s.async = true
    s.setAttribute('data-cfasync', 'false')
    s.src = ads.nativeSrc.startsWith('http') ? ads.nativeSrc : `https:${ads.nativeSrc}`
    document.body.appendChild(s)
  }, [])

  if (!ads.enabled || !ads.nativeSrc || !ads.nativeContainerId) {
    return (
      <div className="my-6 rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-[11px] uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600">
        native ad unit
      </div>
    )
  }
  return <div className="my-6" id={ads.nativeContainerId} />
}

/** Social Bar + Popunder: site-wide, load exactly once. */
export function AdGlobalScripts() {
  const done = useRef(false)

  useEffect(() => {
    if (done.current || !ads.enabled) return
    done.current = true
    for (const src of [ads.socialBarSrc, ads.popunderSrc]) {
      if (!src) continue
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.src = src.startsWith('http') ? src : `https:${src}`
      document.body.appendChild(s)
    }
  }, [])

  return null
}
