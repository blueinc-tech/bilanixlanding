'use client'

import { ArrowRight, Zap } from 'lucide-react'
import { Reveal } from './reveal'
import { openRegistration } from './registration-modal'

const PILLS = ['Paystack', 'Flutterwave', 'Moniepoint', 'GTBank', 'Access Bank', 'Shopify', 'Slack', 'Google Workspace']

const iconBox: React.CSSProperties = {
  position: 'absolute', width: 48, height: 48, background: '#fff', borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const iconBoxSm: React.CSSProperties = {
  position: 'absolute', width: 44, height: 44, background: '#fff', borderRadius: 11,
  border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 14px rgba(0,0,0,0.09)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

export function Integrations() {
  return (
    <section id="integrations" className="integrations-section" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <Reveal>
            <span className="section-label">Integrations</span>
            <h2 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1, marginBottom: 20 }}>Connects to everything<br />your business runs on.</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#737373', marginBottom: 36 }}>Bilanix plugs into your existing stack—payment processors, banking APIs, HR tools, and productivity apps. Zero double-entry. One source of truth.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
              {PILLS?.map?.((p) => (
                <span key={p} style={{ fontSize: '0.8125rem', fontWeight: 500, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '7px 14px', borderRadius: 100, color: '#333', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={12} color="#60B746" fill="#60B746" />{p}
                </span>
              ))}
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '7px 14px', borderRadius: 100, color: '#333' }}>+40 more</span>
            </div>
            <button className="btn-primary" style={{ background: '#0F0F0F', color: '#fff' }} onClick={openRegistration}>Browse all integrations <ArrowRight size={15} /></button>
          </Reveal>

          <Reveal delay={2} className="hidden md:block">
            <div className="orbit-container">
              <div className="orbit-center" style={{ fontSize: '0.8rem' }}>B</div>
              <div className="orbit-ring orbit-ring-1" />
              <div className="orbit-ring orbit-ring-2" />
              <div className="orbit-ring orbit-ring-3" />

              <div className="orbit-1-icons" style={{ position: 'absolute', left: '50%', top: '50%', width: 210, height: 210, marginLeft: -105, marginTop: -105 }}>
                <div style={{ ...iconBox, left: '50%', top: -24, marginLeft: -24 }} className="orbit-icon-inner"><span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#00C853' }}>PAY</span></div>
                <div style={{ ...iconBox, right: -24, top: '50%', marginTop: -24 }} className="orbit-icon-inner"><i className="fa-brands fa-stripe" style={{ fontSize: '1rem', color: '#635BFF' }} /></div>
                <div style={{ ...iconBox, left: '50%', bottom: -24, marginLeft: -24 }} className="orbit-icon-inner"><span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#FF6B00' }}>FLUT</span></div>
                <div style={{ ...iconBox, left: -24, top: '50%', marginTop: -24 }} className="orbit-icon-inner"><i className="fa-brands fa-google" style={{ fontSize: '1rem', color: '#4285F4' }} /></div>
              </div>

              <div className="orbit-2-icons" style={{ position: 'absolute', left: '50%', top: '50%', width: 370, height: 370, marginLeft: -185, marginTop: -185 }}>
                <div style={{ ...iconBox, left: '50%', top: -24, marginLeft: -24 }} className="orbit-2-inner"><i className="fa-brands fa-slack" style={{ fontSize: '1rem', color: '#E01563' }} /></div>
                <div style={{ ...iconBox, right: -24, top: '20%' }} className="orbit-2-inner"><i className="fa-brands fa-shopify" style={{ fontSize: '1rem', color: '#96BF48' }} /></div>
                <div style={{ ...iconBox, right: -24, bottom: '20%' }} className="orbit-2-inner"><i className="fa-brands fa-microsoft" style={{ fontSize: '1rem', color: '#00A4EF' }} /></div>
                <div style={{ ...iconBox, left: '50%', bottom: -24, marginLeft: -24 }} className="orbit-2-inner"><i className="fa-brands fa-hubspot" style={{ fontSize: '1rem', color: '#FF7A59' }} /></div>
                <div style={{ ...iconBox, left: -24, bottom: '20%' }} className="orbit-2-inner"><i className="fa-brands fa-wordpress" style={{ fontSize: '1rem', color: '#21759B' }} /></div>
                <div style={{ ...iconBox, left: -24, top: '20%' }} className="orbit-2-inner"><i className="fa-brands fa-zapier" style={{ fontSize: '1rem', color: '#FF4F00' }} /></div>
              </div>

              <div className="orbit-3-icons" style={{ position: 'absolute', left: '50%', top: '50%', width: 460, height: 460, marginLeft: -230, marginTop: -230 }}>
                <div style={{ ...iconBoxSm, left: '50%', top: -22, marginLeft: -22 }} className="orbit-3-inner"><span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#1A4731' }}>GT</span></div>
                <div style={{ ...iconBoxSm, right: -22, top: '30%' }} className="orbit-3-inner"><span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#CC0000' }}>ACC</span></div>
                <div style={{ ...iconBoxSm, right: -22, bottom: '30%' }} className="orbit-3-inner"><span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#1A3C5E' }}>MON</span></div>
                <div style={{ ...iconBoxSm, left: '50%', bottom: -22, marginLeft: -22 }} className="orbit-3-inner"><i className="fa-brands fa-amazon" style={{ fontSize: '0.875rem', color: '#FF9900' }} /></div>
                <div style={{ ...iconBoxSm, left: -22, bottom: '30%' }} className="orbit-3-inner"><i className="fa-brands fa-quickbooks" style={{ fontSize: '0.875rem', color: '#2CA01C' }} /></div>
                <div style={{ ...iconBoxSm, left: -22, top: '30%' }} className="orbit-3-inner"><i className="fa-brands fa-dropbox" style={{ fontSize: '0.875rem', color: '#0061FF' }} /></div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
