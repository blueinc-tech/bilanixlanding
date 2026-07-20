import Stripe from 'stripe'
import { SettingsService } from './settings.service'

let stripeInstance: Stripe | null = null

async function getStripeSecretKey(): Promise<string> {
  const key = await SettingsService.get('stripe', 'secret_key') as string
  if (!key) throw new Error('Stripe secret key not configured')
  return key
}

export const StripeService = {
  async getInstance(): Promise<Stripe> {
    if (stripeInstance) return stripeInstance
    const secretKey = await getStripeSecretKey()
    stripeInstance = new Stripe(secretKey)
    return stripeInstance
  },

  async createCheckoutSession(params: {
    customerEmail: string
    customerName: string
    planName: string
    amount: number
    currency: string
    billing: 'monthly' | 'yearly'
    metadata: Record<string, string>
  }): Promise<{ sessionId: string; url: string }> {
    const stripe = await this.getInstance()
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: `${params.planName} Plan (${params.billing})`,
              metadata: {
                planName: params.planName,
                billing: params.billing,
              },
            },
            unit_amount: Math.round(params.amount * 100),
            recurring: {
              interval: params.billing === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/register/success?canceled=true`,
      metadata: params.metadata,
      subscription_data: {
        metadata: params.metadata,
      },
    })

    if (!session.url) {
      throw new Error('Failed to create Stripe checkout session')
    }

    return { sessionId: session.id, url: session.url }
  },

  constructWebhookEvent(body: Buffer, sig: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) throw new Error('Stripe webhook secret not configured')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

    return stripe.webhooks.constructEvent(body, sig, webhookSecret)
  },

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    const stripe = await this.getInstance()
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })
  },
}
