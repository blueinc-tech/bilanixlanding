import { Navbar } from '@/components/landing/navbar'
import { ContactHero } from '@/components/landing/contact-hero'
import { ContactSection } from '@/components/landing/contact-section'
import { ContactCta } from '@/components/landing/contact-cta'
import { Footer } from '@/components/landing/footer'
import { DemoModal } from '@/components/landing/demo-modal'

export default function ContactPage() {
  return (
    <div className="bilanix">
      <Navbar />
      <ContactHero />
      <ContactSection />
      <ContactCta />
      <Footer />
      <DemoModal />
    </div>
  )
}
