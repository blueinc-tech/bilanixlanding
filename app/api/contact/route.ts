export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const company = String(body?.company ?? '').trim()
    const phone = String(body?.phone ?? '').trim()
    const message = String(body?.message ?? '').trim()
    const formType = String(body?.formType ?? 'demo').trim()

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name || !email || !emailRe.test(email)) {
      return NextResponse.json(
        { error: 'Please provide your name and a valid email address.' },
        { status: 400 }
      )
    }

    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company: company || null,
        phone: phone || null,
        message: message || null,
        formType: formType || 'demo',
      },
    })

    return NextResponse.json({ ok: true, message: 'Thank you. Our team will reach out shortly.' })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
