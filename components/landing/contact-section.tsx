'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Reveal } from './reveal'

const INQUIRY_TYPES = ['Request a Demo', 'Support', 'Partnership']

const INFO_CARDS = [
  {
    icon: Mail,
    label: 'Email',
    title: 'Send us an email',
    detail: 'hello@bilanix.com',
    sub: 'We reply within one business day',
  },
  {
    icon: Phone,
    label: 'Phone',
    title: 'Speak with our team',
    detail: '+234 701 234 5689',
    sub: 'Monday – Friday, 9:00 AM – 6:00 PM WAT',
  },
  {
    icon: MapPin,
    label: 'Office',
    title: 'Our location',
    detail: '32 Obafemi Awolowo, Ikeja, Lagos',
    sub: 'Lagos, Nigeria',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    title: 'When we\'re available',
    detail: 'Mon – Fri: 9:00 AM – 6:00 PM WAT',
    sub: '',
  },
]

export function ContactSection() {
  const [inquiryType, setInquiryType] = useState('Request a Demo')

  return (
    <section className="features-section" style={{ padding: '80px 0' }}>
      <div className="max-w-page">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'start' }}>
          {/* Left Column */}
          <div>
            <Reveal>
              <div>
                <p className="section-label">Contact Bilanix</p>
                <h2 className="font-heading" style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 300,
                  lineHeight: 1.12,
                  letterSpacing: '-0.015em',
                  color: '#0F0F0F',
                  marginTop: 16,
                }}>
                  Start your journey towards <span style={{ fontWeight: 600 }}>efficient multi-client accounting</span>
                </h2>
                <p style={{
                  marginTop: 16,
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: '#737373',
                }}>
                  Bilanix is purpose-built for accounting firms and consultants managing multiple clients. Request early access, schedule a product walkthrough, or send us a message — our team will respond within one business day.
                </p>
              </div>
            </Reveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
              {INFO_CARDS.map((card) => {
                const Icon = card.icon
                return (
                  <Reveal key={card.label}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      borderRadius: 16,
                      border: '1px solid rgba(0,0,0,0.07)',
                      background: '#fff',
                      padding: 20,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 12,
                        background: 'rgba(96,183,70,0.08)',
                        color: '#60B746',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#60B746' }}>{card.label}</p>
                        <p style={{ marginTop: 2, fontSize: 14, fontWeight: 600, color: '#0F0F0F' }}>{card.title}</p>
                        <p style={{ marginTop: 2, fontSize: 13.5, color: '#737373' }}>{card.detail}</p>
                        <p style={{ marginTop: 2, fontSize: 12.5, color: '#a0a0a0' }}>{card.sub}</p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>

          {/* Right Column — Form */}
          <Reveal>
            <div style={{
              borderRadius: 16,
              border: '1px solid rgba(0,0,0,0.07)',
              background: '#fff',
              padding: 36,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              <h2 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0F0F0F', marginBottom: 24 }}>
                Send us a message
              </h2>

              {/* Inquiry Type */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(15,15,15,0.7)' }}>
                  Inquiry type<span style={{ marginLeft: 2, color: '#60B746' }}>*</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInquiryType(type)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: 999,
                        padding: '6px 16px',
                        fontSize: 13,
                        fontWeight: 500,
                        transition: 'all 0.15s',
                        border: `1px solid ${inquiryType === type ? '#60B746' : 'rgba(0,0,0,0.1)'}`,
                        background: inquiryType === type ? '#60B746' : '#fff',
                        color: inquiryType === type ? '#fff' : '#737373',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <InputField id="first-name" label="First Name" required placeholder="e.g. Jane" />
                  <InputField id="last-name" label="Last Name" required placeholder="e.g. Adeyemi" />
                </div>
                <InputField id="email" label="Work Email" type="email" required placeholder="you@yourfirm.com" />
                <InputField id="company" label="Firm / Company Name" required placeholder="e.g. Adeyemi & Associates" />
                <InputField id="phone" label="Phone Number" type="tel" placeholder="+234 800 000 0000" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="message" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(15,15,15,0.7)' }}>
                    Tell us about your practice<span style={{ marginLeft: 2, color: '#60B746' }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="How many clients does your firm currently manage? What accounting challenges are you looking to solve?"
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: '#fff',
                      padding: '12px 16px',
                      fontSize: 14,
                      color: '#0F0F0F',
                      lineHeight: 1.5,
                      resize: 'none',
                      transition: 'border-color 0.15s',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#60B746'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,183,70,0.1)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 12,
                    background: '#60B746',
                    color: '#fff',
                    fontSize: 14.5,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginTop: 4,
                  }}
                >
                  <Send size={15} />
                  Send Message
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#a0a0a0' }}>
                  We respect your privacy and will never share your information.
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .max-w-page > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

function InputField({ id, label, type = 'text', required = false, placeholder }: {
  id: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(15,15,15,0.7)' }}>
        {label}{required && <span style={{ marginLeft: 2, color: '#60B746' }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        name={id}
        style={{
          width: '100%',
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.1)',
          background: '#fff',
          padding: '12px 16px',
          fontSize: 14,
          color: '#0F0F0F',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#60B746'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,183,70,0.1)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}
