import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { prisma } from '@/lib/db'
import type { EmailTemplateId } from '@/types/admin'

// ─── SES Configuration ─────────────────────────────────────────────

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || '',
  },
})

const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@bilanix.com'
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Bilanix'

// ─── Email Templates ───────────────────────────────────────────────

interface TemplateData {
  [key: string]: string
}

function renderTemplate(templateId: EmailTemplateId, data: TemplateData): { subject: string; html: string } {
  const baseLayout = (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f7f8f8; color: #1a1a1a; }
        .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo img { height: 32px; }
        .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px; color: #0a0a0a; }
        p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #4a4a4a; }
        .btn { display: inline-block; padding: 12px 28px; background-color: #60B746; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 0; }
        .credentials { background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .credentials p { margin: 4px 0; font-size: 14px; color: #52525b; }
        .credentials strong { color: #18181b; }
        .footer { text-align: center; padding: 24px 0; font-size: 12px; color: #a1a1aa; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .warning p { color: #92400e; margin: 0; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <strong style="font-size: 20px; color: #60B746;">Bilanix</strong>
        </div>
        <div class="card">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bilanix. All rights reserved.</p>
          <p>Need help? Contact us at support@bilanix.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  const templates: Record<EmailTemplateId, { subject: string; html: string }> = {
    welcome: {
      subject: `Welcome to Bilanix, ${data.name}!`,
      html: baseLayout(`
        <h1>Welcome to Bilanix!</h1>
        <p>Hi ${data.name},</p>
        <p>We're excited to have you on board. Bilanix is an AI-powered accounting platform built specifically for Nigerian businesses.</p>
        ${data.temporaryPassword ? `
          <div class="credentials">
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
          </div>
          <div class="warning">
            <p>Please log in and change your password immediately for security.</p>
          </div>
        ` : ''}
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Log In to Bilanix</a>` : ''}
        <p style="margin-top: 24px;">If you have any questions, don't hesitate to reach out to our support team.</p>
      `),
    },
    password_reset: {
      subject: 'Reset Your Bilanix Password',
      html: baseLayout(`
        <h1>Password Reset</h1>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        ${data.resetUrl ? `<a href="${data.resetUrl}" class="btn">Reset Password</a>` : ''}
        <p style="margin-top: 16px;">This link will expire in 1 hour for security reasons.</p>
        <div class="warning">
          <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
      `),
    },
    password_changed: {
      subject: 'Your Bilanix Password Was Changed',
      html: baseLayout(`
        <h1>Password Changed</h1>
        <p>Hi ${data.name},</p>
        <p>Your password was successfully changed. If you did not make this change, please contact our support team immediately.</p>
        <p style="margin-top: 16px;"><strong>Changed at:</strong> ${data.changedAt || new Date().toLocaleString()}</p>
      `),
    },
    account_created: {
      subject: 'Your Bilanix Account Has Been Created',
      html: baseLayout(`
        <h1>Account Created</h1>
        <p>Hi ${data.name},</p>
        <p>Your Bilanix account has been created successfully.</p>
        ${data.temporaryPassword ? `
          <div class="credentials">
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
          </div>
          <div class="warning">
            <p>Please log in and change your password on first login.</p>
          </div>
        ` : ''}
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Log In to Bilanix</a>` : ''}
      `),
    },
    subscription_activated: {
      subject: 'Your Bilanix Subscription Is Active',
      html: baseLayout(`
        <h1>Subscription Activated</h1>
        <p>Hi ${data.name},</p>
        <p>Your <strong>${data.planName || 'Bilanix'}</strong> subscription is now active!</p>
        ${data.expiryDate ? `<p>Your subscription is valid until <strong>${data.expiryDate}</strong>.</p>` : ''}
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Go to Dashboard</a>` : ''}
      `),
    },
    subscription_renewed: {
      subject: 'Your Bilanix Subscription Has Been Renewed',
      html: baseLayout(`
        <h1>Subscription Renewed</h1>
        <p>Hi ${data.name},</p>
        <p>Your <strong>${data.planName || 'Bilanix'}</strong> subscription has been successfully renewed.</p>
        ${data.expiryDate ? `<p>Your subscription is now valid until <strong>${data.expiryDate}</strong>.</p>` : ''}
      `),
    },
    subscription_cancelled: {
      subject: 'Your Bilanix Subscription Has Been Cancelled',
      html: baseLayout(`
        <h1>Subscription Cancelled</h1>
        <p>Hi ${data.name},</p>
        <p>Your <strong>${data.planName || 'Bilanix'}</strong> subscription has been cancelled.</p>
        ${data.expiryDate ? `<p>You will continue to have access until <strong>${data.expiryDate}</strong>.</p>` : ''}
        <p>We're sorry to see you go. If you change your mind, you can resubscribe at any time.</p>
      `),
    },
    subscription_expired: {
      subject: 'Your Bilanix Subscription Has Expired',
      html: baseLayout(`
        <h1>Subscription Expired</h1>
        <p>Hi ${data.name},</p>
        <p>Your <strong>${data.planName || 'Bilanix'}</strong> subscription has expired.</p>
        <p>To continue using Bilanix, please renew your subscription.</p>
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Renew Subscription</a>` : ''}
      `),
    },
    subscription_expiring_soon: {
      subject: 'Your Bilanix Subscription Is Expiring Soon',
      html: baseLayout(`
        <h1>Subscription Expiring Soon</h1>
        <p>Hi ${data.name},</p>
        <p>Your <strong>${data.planName || 'Bilanix'}</strong> subscription will expire on <strong>${data.expiryDate || 'soon'}</strong>.</p>
        <p>To avoid interruption of service, please renew your subscription.</p>
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Renew Now</a>` : ''}
      `),
    },
    admin_welcome: {
      subject: `Welcome to Bilanix Admin, ${data.name}!`,
      html: baseLayout(`
        <h1>Welcome to Bilanix Admin</h1>
        <p>Hi ${data.name},</p>
        <p>An administrator account has been created for you on the Bilanix Admin Portal.</p>
        ${data.temporaryPassword ? `
          <div class="credentials">
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
          </div>
          <div class="warning">
            <p>Please log in and change your password immediately for security.</p>
          </div>
        ` : ''}
        ${data.role ? `<p><strong>Your Role:</strong> ${data.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>` : ''}
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Log In to Admin Portal</a>` : ''}
        <p style="margin-top: 24px;">If you have any questions, don't hesitate to reach out to the team.</p>
      `),
    },
    payment_receipt: {
      subject: `Payment Receipt - Bilanix ${data.planName}`,
      html: baseLayout(`
        <h1>Payment Received</h1>
        <p>Hi ${data.name},</p>
        <p>Your payment has been received successfully.</p>
        <div class="credentials">
          <p><strong>Plan:</strong> ${data.planName}</p>
          <p><strong>Amount:</strong> ${data.amount}</p>
          <p><strong>Billing:</strong> ${data.billingCycle}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
          <p><strong>Next Billing:</strong> ${data.nextBillingDate}</p>
        </div>
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Go to Dashboard</a>` : ''}
      `),
    },
    registration_welcome: {
      subject: `Welcome to Bilanix, ${data.name}!`,
      html: baseLayout(`
        <h1>Welcome to Bilanix!</h1>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering. Your subscription is now active.</p>
        ${data.temporaryPassword ? `
          <div class="credentials">
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
          </div>
          <div class="warning">
            <p>Please log in and change your password immediately for security.</p>
          </div>
        ` : ''}
        ${data.loginUrl ? `<a href="${data.loginUrl}" class="btn">Go to Dashboard</a>` : ''}
      `),
    },
  }

  return templates[templateId]
}

// ─── Email Service ─────────────────────────────────────────────────

export const EmailService = {
  async send(params: {
    to: string
    toName?: string
    templateId: EmailTemplateId
    data: TemplateData
    adminId?: string
  }): Promise<string> {
    const template = renderTemplate(params.templateId, params.data)

    // Create email log entry
    const emailLog = await prisma.emailLog.create({
      data: {
        recipientEmail: params.to,
        recipientName: params.toName,
        subject: template.subject,
        templateId: params.templateId,
        body: template.html,
        status: 'queued',
        adminId: params.adminId,
      },
    })

    // Queue for sending (non-blocking)
    this.processEmail(emailLog.id, {
      to: params.to,
      subject: template.subject,
      html: template.html,
    }).catch((error) => {
      console.error('[EmailService] Failed to process email:', error)
    })

    return emailLog.id
  },

  async processEmail(
    emailLogId: string,
    params: { to: string; subject: string; html: string }
  ): Promise<void> {
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: { status: 'sending', sentAt: new Date() },
    })

    try {
      const command = new SendEmailCommand({
        Source: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM}>`,
        Destination: { ToAddresses: [params.to] },
        Message: {
          Subject: { Data: params.subject, Charset: 'UTF-8' },
          Body: { Html: { Data: params.html, Charset: 'UTF-8' } },
        },
      })

      await ses.send(command)

      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: { status: 'sent', sentAt: new Date() },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: 'failed',
          failedAt: new Date(),
          failureReason: message,
        },
      })
    }
  },

  async retryFailed(retryLimit = 3): Promise<number> {
    const failedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'failed',
        retryCount: { lt: retryLimit },
      },
      take: 50,
    })

    let retried = 0
    for (const email of failedEmails) {
      await prisma.emailLog.update({
        where: { id: email.id },
        data: {
          status: 'queued',
          retryCount: { increment: 1 },
          failedAt: null,
          failureReason: null,
        },
      })

      this.processEmail(email.id, {
        to: email.recipientEmail,
        subject: email.subject,
        html: email.body || '',
      }).catch(() => {})

      retried++
    }

    return retried
  },

  async getHistory(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params
    const where = status ? { status } : {}

    const [emails, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ])

    return { emails, total, page, limit, totalPages: Math.ceil(total / limit) }
  },
}
