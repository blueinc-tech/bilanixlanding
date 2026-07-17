import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { LogoStrip } from '@/components/landing/logo-strip'
import { Features } from '@/components/landing/features'
import { BusinessTypes } from '@/components/landing/business-types'
import { SpotlightAI, SpotlightExpense, SpotlightPayroll, SpotlightCashflow } from '@/components/landing/spotlights'
import { Stats } from '@/components/landing/stats'
import { Testimonials } from '@/components/landing/testimonials'
import { PricingSection } from '@/components/landing/pricing-section'
import { FinalCta } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'
import { RegistrationModal } from '@/components/landing/registration-modal'

export default function Home() {
  return (
    <div className="bilanix">
      <Navbar />
      <Hero />
      <LogoStrip />
      <main>
        <Features />
        <SpotlightAI />
        <PricingSection />
        <BusinessTypes />
        <SpotlightExpense />
        <SpotlightPayroll />
        <SpotlightCashflow />
        <Stats />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
      <RegistrationModal />
    </div>
  )
}
