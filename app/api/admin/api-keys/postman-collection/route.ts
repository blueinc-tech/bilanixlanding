export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authenticate } from '@/lib/auth-middleware'

// Serves the Postman collection for the external subscriber API, with
// `baseUrl` filled in to match wherever this instance is actually running.
// Gated behind admin auth (not a public file) since it documents an
// internal integration surface, even though it contains no secrets itself.

const COLLECTION_PATH = path.join(process.cwd(), 'lib/postman/subscriber-api.postman_collection.json')

export async function GET(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const raw = fs.readFileSync(COLLECTION_PATH, 'utf-8')
  const collection = JSON.parse(raw)

  const baseUrl = process.env.SITE_URL || req.nextUrl.origin
  const baseUrlVar = collection.variable?.find((v: { key: string }) => v.key === 'baseUrl')
  if (baseUrlVar) baseUrlVar.value = baseUrl

  return new NextResponse(JSON.stringify(collection, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="bilanix-subscriber-api.postman_collection.json"',
    },
  })
}
