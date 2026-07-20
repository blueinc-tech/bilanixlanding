export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { NotificationService } from '@/lib/services/notification.service'

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || '',
  },
})

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@bilanix.com'
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@bilanix.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Bilanix'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const firstName = String(body?.firstName ?? '').trim()
    const lastName = String(body?.lastName ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const company = String(body?.company ?? '').trim()
    const phone = String(body?.phone ?? '').trim()
    const message = String(body?.message ?? '').trim()
    const inquiryType = String(body?.inquiryType ?? 'Request a Demo').trim()

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!firstName || !lastName || !email || !emailRe.test(email) || !company || !phone || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    await prisma.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        company: company || null,
        phone: phone || null,
        message: message || null,
        inquiryType: inquiryType || 'Request a Demo',
      },
    })

    const fullName = `${firstName} ${lastName}`
    const adminSubject = `New Contact Submission: ${fullName} (${inquiryType})`
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;font-family:Inter,-apple-system,sans-serif;background:#f7f8f8;color:#1a1a1a;">
        <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
          <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <h1 style="font-size:20px;font-weight:600;margin:0 0 20px;color:#0a0a0a;">New Contact Submission</h1>
            <table style="width:100%;font-size:14px;line-height:1.6;color:#4a4a4a;">
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;">Name</td><td>${fullName}</td></tr>
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;">Email</td><td><a href="mailto:${email}" style="color:#52A33C;">${email}</a></td></tr>
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;">Company</td><td>${company || '—'}</td></tr>
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;">Phone</td><td>${phone || '—'}</td></tr>
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;">Inquiry Type</td><td>${inquiryType}</td></tr>
              <tr><td style="font-weight:600;padding:4px 12px 4px 0;color:#18181b;vertical-align:top;">Message</td><td>${message}</td></tr>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bilanix.com'}/admin/submissions" style="display:inline-block;padding:12px 28px;background:#52A33C;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">View in Admin</a>
            </div>
          </div>
          <p style="text-align:center;padding:24px 0;font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} Bilanix</p>
        </div>
      </body>
      </html>
    `

    ses.send(new SendEmailCommand({
      Source: `${FROM_NAME} <${FROM_EMAIL}>`,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: { Data: adminSubject, Charset: 'UTF-8' },
        Body: { Html: { Data: adminHtml, Charset: 'UTF-8' } },
      },
    })).catch((err) => {
      console.error('[Contact] Failed to send admin notification:', err)
    })

    // In-app notification for admins
    await NotificationService.create({
      title: 'New Contact Submission',
      message: `New ${inquiryType} submission from ${fullName} (${email}) at ${company}.`,
      type: 'info',
      actionUrl: `/admin/submissions`,
    })

    return NextResponse.json({ ok: true, message: 'Thank you. Our team will reach out shortly.' })
  } catch (err) {
    console.error('[Contact] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
