import { Reveal } from './reveal'

export function ContactHero() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #0a1c08 0%, #112a0e 40%, #1c3f19 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.06,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        width: 600,
        height: 400,
        transform: 'translateX(-50%)',
        borderRadius: '50%',
        background: 'rgba(96,183,70,0.1)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div className="max-w-page" style={{ position: 'relative', paddingTop: 140, paddingBottom: 110, textAlign: 'center' }}>
        <Reveal>
          <h1 className="font-heading" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#fff',
          }}>
            Contact Us
          </h1>
        </Reveal>
        <Reveal>
          <p style={{
            maxWidth: 560,
            margin: '20px auto 0',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)',
          }}>
            Whether you&apos;re an accounting firm, consultant, or finance team ready to manage multiple clients more efficiently — we&apos;d love to hear from you.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
