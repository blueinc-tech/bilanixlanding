import { createHmac } from 'crypto'
import { SettingsService } from '@/lib/services/settings.service'

export interface IntegrationEvent {
  event: string
  userId: string
  email: string
  planSlug: string
  planName: string
  billing?: string
  expiresAt?: Date | string
  amount?: number
  currency?: string
}

const EVENTS = {
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
} as const

/**
 * Notifies the main accounting app about subscription events.
 * Non-blocking — failures are logged and swallowed so they never break
 * the primary payment flow.
 */
export const IntegrationService = {
  EVENTS,

  async isConfigured(): Promise<boolean> {
    const url = (await SettingsService.get('integration', 'app_webhook_url')) as string
    return Boolean(url)
  },

  /**
   * Fire-and-forget POST to the accounting app's webhook endpoint.
   * Payload is HMAC-signed with the shared secret.
   */
  async notify(event: IntegrationEvent): Promise<void> {
    try {
      const url = (await SettingsService.get('integration', 'app_webhook_url')) as string
      if (!url) return

      const secret = (await SettingsService.get('integration', 'app_webhook_secret')) as string || ''
      const body = JSON.stringify({ ...event, sentAt: new Date().toISOString() })
      const signature = createHmac('sha256', secret).update(body).digest('hex')

      await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-webhook-signature': signature,
          'x-source': 'bilanix',
        },
        body,
      })
    } catch (error) {
      console.error('[Integration] Failed to notify accounting app:', error)
    }
  },
}
