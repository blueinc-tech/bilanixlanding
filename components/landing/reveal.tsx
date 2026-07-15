'use client'

import { useEffect, useRef, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5
  as?: 'div' | 'article' | 'section' | 'header' | 'li'
  style?: React.CSSProperties
}

export function Reveal({ children, className = '', delay = 0, as = 'div', style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref?.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries?.forEach?.((e) => {
          if (e?.isIntersecting) {
            setVisible(true)
            observer?.unobserve?.(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer?.observe?.(el)
    return () => observer?.disconnect?.()
  }, [])

  const delayClass = delay ? `fade-in-delay-${delay}` : ''
  const Tag = as as any

  return (
    <Tag
      ref={ref}
      style={style}
      className={`fade-in ${delayClass} ${visible ? 'visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}
