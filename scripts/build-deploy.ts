import { execSync } from 'child_process'

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' })
  } catch (e: any) {
    return e.stdout || e.stderr || ''
  }
}

// 1. Try migrate deploy
console.log('→ Running prisma migrate deploy...')
let output = run('npx prisma migrate deploy')
console.log(output)

if (output.includes('P3009') || output.includes('failed migrations')) {
  console.log('→ Failed migrations detected, resolving...')

  // Find failed migration names from output
  const matches = output.match(/The `(\w+)` migration started at/)
  if (matches && matches[1]) {
    const migrationName = matches[1]
    console.log(`→ Rolling back: ${migrationName}`)
    run(`npx prisma migrate resolve --rolled-back "${migrationName}"`)

    // Retry deploy
    console.log('→ Retrying prisma migrate deploy...')
    output = run('npx prisma migrate deploy')
    console.log(output)
  }
}

// 2. Seed admin (idempotent — skips if admin already exists)
console.log('→ Seeding admin...')
const seedOutput = run('npx tsx scripts/seed-admin.ts')
console.log(seedOutput)

console.log('✅ Done')
