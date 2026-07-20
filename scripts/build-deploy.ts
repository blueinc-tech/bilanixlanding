import { execSync } from 'child_process'

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' })
  } catch (e: any) {
    return e.stdout || e.stderr || ''
  }
}

// Sync schema (adds/updates tables without deleting data)
console.log('→ Syncing database schema...')
console.log(run('npx prisma db push'))

// Generate client
console.log('→ Generating Prisma client...')
console.log(run('npx prisma generate'))

// Seed admin (idempotent — skips if already exists)
console.log('→ Seeding admin...')
console.log(run('npx tsx scripts/seed-admin.ts'))

console.log('✅ Deploy prep done')
