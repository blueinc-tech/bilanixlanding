export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { SettingsService } from '@/lib/services/settings.service'

export const GET = withErrorHandling(async (_req: NextRequest) => {
  const stripeEnabled = await SettingsService.isGatewayEnabled('stripe')
  const paystackEnabled = await SettingsService.isGatewayEnabled('paystack')

  const stripeMode = await SettingsService.getGatewayMode('stripe')
  const paystackMode = await SettingsService.getGatewayMode('paystack')

  const stripePublishable = await SettingsService.get(
    'stripe',
    stripeMode === 'test' ? 'test_publishable_key' : 'publishable_key'
  ) as string
  const paystackPublic = await SettingsService.get(
    'paystack',
    paystackMode === 'test' ? 'test_public_key' : 'public_key'
  ) as string

  return apiSuccess({
    stripe: {
      enabled: stripeEnabled,
      mode: stripeMode,
      publishableKey: stripePublishable || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    paystack: {
      enabled: paystackEnabled,
      mode: paystackMode,
      publicKey: paystackPublic || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    },
  })
})
