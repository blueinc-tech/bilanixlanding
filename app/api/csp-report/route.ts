import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.error('[CSP Report]', JSON.stringify({
      'document-uri': body['document-uri'] || body.documentURI,
      'violated-directive': body['violated-directive'] || body.violatedDirective,
      'effective-directive': body['effective-directive'] || body.effectiveDirective,
      'blocked-uri': body['blocked-uri'] || body.blockedURI,
      'source-file': body['source-file'] || body.sourceFile,
      'line-number': body['line-number'] || body.lineNumber,
      'status-code': body['status-code'] || body.statusCode,
      'disposition': body.disposition,
    }, null, 2))
  } catch {
    // Silently ignore malformed reports
  }

  return new NextResponse(null, { status: 204 })
}
