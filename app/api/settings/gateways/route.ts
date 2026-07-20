export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { SettingsService } from '@/lib/services/settings.service'

export const GET = withErrorHandling(async (_req: NextRequest) => {
  const stripeEnabled = await SettingsService.isGatewayEnabled('stripe')
  const paystackEnabled = await SettingsService.isGatewayEnabled('paystack')

  const stripePublishable = await SettingsService.get('stripe', 'publishable_key') as string
  const paystackPublic = await SettingsService.get('paystack', 'public_key') as string

  return apiSuccess({
    stripe: {
      enabled: stripeEnabled,
      publishableKey: stripePublishable || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    paystack: {
      enabled: paystackEnabled,
      publicKey: paystackPublic || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    },
  })
})
