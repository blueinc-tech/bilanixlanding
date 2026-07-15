'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, decimals = 0, delay = 0) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries?.forEach?.((e) => {
          if (e?.isIntersecting && !started.current) {
            started.current = true
            setTimeout(() => {
              const duration = 1800
              let startTs = 0
              const step = (ts: number) => {
                if (!startTs) startTs = ts
                const p = Math.min((ts - startTs) / duration, 1)
                const eased = 1 - Math.pow(1 - p, 3)
                setVal(parseFloat((eased * target).toFixed(decimals)))
                if (p < 1) requestAnimationFrame(step)
                else setVal(target)
              }
              requestAnimationFrame(step)
            }, delay)
          }
        })
      },
      { threshold: 0.3 }
    )
    obs?.observe?.(el)
    return () => obs?.disconnect?.()
  }, [target, decimals, delay])

  return { ref, val }
}

export function Stats() {
  const s1 = useCountUp(213.4, 1, 0)
  const s2 = useCountUp(200, 0, 100)
  const s3 = useCountUp(100, 0, 200)
  const s4 = useCountUp(12, 0, 300)

  return (
    <section id="stats" className="stats-section" style={{ padding: '120px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-page">
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span className="section-label">Platform at a glance</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15 }}>Built for scale.<br />Designed for accuracy.</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ position: 'relative', rowGap: 48, columnGap: 16 }}>
          <div ref={s1.ref} className="text-center" style={{ padding: '0 12px' }}>
            <div className="stat-num"><span className="green">₦</span>{s1.val.toFixed(1)}<span className="green">M</span></div>
            <p className="stat-label">Net Worth Tracked</p>
          </div>
          <div ref={s2.ref} className="text-center" style={{ padding: '0 12px' }}>
            <div className="stat-num">{Math.floor(s2.val)}<span className="green">+</span></div>
            <p className="stat-label">Active Clients</p>
          </div>
          <div ref={s3.ref} className="text-center" style={{ padding: '0 12px' }}>
            <div className="stat-num">{Math.floor(s3.val)}<span className="green">%</span></div>
            <p className="stat-label">Double-entry Accuracy</p>
          </div>
          <div ref={s4.ref} className="text-center" style={{ padding: '0 12px' }}>
            <div className="stat-num">{Math.floor(s4.val)}<span className="green">+</span></div>
            <p className="stat-label">Core Modules Shipped</p>
          </div>
        </div>
      </div>
    </section>
  )
}
