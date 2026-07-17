import { SettingsService } from './settings.service'

interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    amount: number
    currency: string
    status: string
    reference: string
    metadata: Record<string, unknown>
    customer: {
      id: number
      email: string
      name: string | null
    }
    authorization: Record<string, unknown>
    created_at: string
  }
}

async function getPaystackSecretKey(): Promise<string> {
  const key = await SettingsService.get('paystack', 'secret_key') as string
  if (!key) throw new Error('Paystack secret key not configured')
  return key
}

async function paystackRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const secretKey = await getPaystackSecretKey()
  const response = await fetch(`https://api.paystack.co${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()
  if (!data.status) {
    throw new Error(data.message || 'Paystack API error')
  }
  return data as T
}

export const PaystackService = {
  async initializeTransaction(params: {
    email: string
    amount: number
    currency: string
    reference: string
    metadata: Record<string, unknown>
    callbackUrl: string
  }): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
    const amountInKobo = Math.round(params.amount * 100)

    const result = await paystackRequest<PaystackInitializeResponse>('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        amount: amountInKobo,
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: {
          ...params.metadata,
          custom_fields: [
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: params.metadata.planName || '',
            },
          ],
        },
      }),
    })

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    }
  },

  async verifyTransaction(reference: string): Promise<{
    success: boolean
    amount: number
    currency: string
    reference: string
    gatewayRef: string
    customerEmail: string
    paidAt: Date
    metadata: Record<string, unknown>
  }> {
    const result = await paystackRequest<PaystackVerifyResponse>(
      `/transaction/verify/${reference}`
    )

    return {
      success: result.data.status === 'success',
      amount: result.data.amount / 100,
      currency: result.data.currency,
      reference: result.data.reference,
      gatewayRef: String(result.data.id),
      customerEmail: result.data.customer.email,
      paidAt: new Date(result.data.created_at),
      metadata: result.data.metadata || {},
    }
  },

  validateWebhook(body: string, signature: string): boolean {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET
    if (!secret) return false

    const crypto = require('crypto') as typeof import('crypto')
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
    return hash === signature
  },
}
