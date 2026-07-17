import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { SettingsService } from '@/lib/services/settings.service'

export const GET = withErrorHandling(async (_req: NextRequest) => {
  const stripeEnabled = await SettingsService.isGatewayEnabled('stripe')
  const paystackEnabled = await SettingsService.isGatewayEnabled('paystack')

  return apiSuccess({
    stripe: {
      enabled: stripeEnabled,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    paystack: {
      enabled: paystackEnabled,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    },
  })
})
