import { execSync } from 'child_process'

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' })
  } catch (e: any) {
    return e.stdout || e.stderr || ''
  }
}

// Force-sync schema (handles failed migrations, fresh databases)
console.log('→ Syncing database schema...')
let output = run('npx prisma db push --force-reset --accept-data-loss')
console.log(output)

// Generate client
console.log('→ Generating Prisma client...')
output = run('npx prisma generate')
console.log(output)

// Seed admin (idempotent)
console.log('→ Seeding admin...')
output = run('npx tsx scripts/seed-admin.ts')
console.log(output)

console.log('✅ Deploy prep done')
