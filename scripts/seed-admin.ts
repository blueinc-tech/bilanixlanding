import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Roles ─────────────────────────────────────────────────────

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full access to all features and settings',
      isSystem: true,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Admin',
      description: 'Access to clients, marketing, and payments',
      isSystem: true,
    },
  })

  const supportRole = await prisma.role.upsert({
    where: { name: 'support' },
    update: {},
    create: {
      name: 'support',
      displayName: 'Support',
      description: 'Read-only access to dashboard and client data',
      isSystem: true,
    },
  })

  console.log(`  ✓ Roles: ${superAdminRole.displayName}, ${adminRole.displayName}, ${supportRole.displayName}`)

  // ─── Permissions ───────────────────────────────────────────────

  const modules = [
    'dashboard', 'clients', 'marketing', 'payments',
    'settings', 'notifications', 'activity', 'audit',
    'admins', 'maintenance',
  ]
  const actions = ['read', 'create', 'update', 'delete', 'export', 'send', 'manage']

  const permissionRecords: { id: string; name: string }[] = []

  for (const mod of modules) {
    for (const act of actions) {
      const name = `${mod}:${act}`
      const existing = await prisma.permission.findUnique({ where: { name } })
      if (existing) {
        permissionRecords.push(existing)
      } else {
        const created = await prisma.permission.create({
          data: { name, module: mod, action: act, description: `${act.charAt(0).toUpperCase() + act.slice(1)} ${mod}` },
        })
        permissionRecords.push(created)
      }
    }
  }

  console.log(`  ✓ Permissions: ${permissionRecords.length} permissions created`)

  // ─── Role-Permission Mapping ───────────────────────────────────

  // Super Admin: all permissions
  const allPermIds = permissionRecords.map((p) => p.id)
  for (const permId of allPermIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permId },
    })
  }

  // Admin: everything except admins and maintenance
  const adminModules = ['dashboard', 'clients', 'marketing', 'payments', 'settings', 'notifications', 'activity', 'audit']
  const adminPermIds = permissionRecords
    .filter((p) => adminModules.some((m) => p.name.startsWith(m)))
    .map((p) => p.id)
  for (const permId of adminPermIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permId },
    })
  }

  // Support: read-only on dashboard, clients, notifications, activity, audit
  const supportModules = ['dashboard', 'clients', 'notifications', 'activity', 'audit']
  const supportPermIds = permissionRecords
    .filter((p) => supportModules.some((m) => p.name.startsWith(m)) && p.name.endsWith(':read'))
    .map((p) => p.id)
  for (const permId of supportPermIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: supportRole.id, permissionId: permId } },
      update: {},
      create: { roleId: supportRole.id, permissionId: permId },
    })
  }

  console.log('  ✓ Role-Permission mappings created')

  // ─── Default Super Admin ───────────────────────────────────────

  const adminEmail = 'admin@bilanix.com'
  const adminPassword = 'Admin@123456'

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        role: 'super_admin',
        roleId: superAdminRole.id,
        status: 'active',
      },
    })
    console.log(`  ✓ Default admin created: ${adminEmail}`)
    console.log(`  ⚠ Default password: ${adminPassword} — CHANGE THIS IN PRODUCTION`)
  } else {
    console.log(`  ✓ Admin already exists: ${adminEmail}`)
  }

  // ─── Default System Settings ───────────────────────────────────

  const defaultSettings = [
    { group: 'general', key: 'site_name', value: 'Bilanix', type: 'string' },
    { group: 'general', key: 'site_url', value: 'https://bilanix.com', type: 'string' },
    { group: 'general', key: 'support_email', value: 'support@bilanix.com', type: 'string' },
    { group: 'email', key: 'ses_enabled', value: false, type: 'boolean' },
    { group: 'email', key: 'ses_region', value: 'us-east-1', type: 'string' },
    { group: 'email', key: 'ses_from_email', value: 'noreply@bilanix.com', type: 'string' },
    { group: 'email', key: 'ses_from_name', value: 'Bilanix', type: 'string' },
    { group: 'stripe', key: 'enabled', value: false, type: 'boolean' },
    { group: 'paystack', key: 'enabled', value: true, type: 'boolean' },
    { group: 'maintenance', key: 'enabled', value: false, type: 'boolean' },
    { group: 'branding', key: 'primary_color', value: '#60B746', type: 'string' },
    { group: 'features', key: 'marketing_enabled', value: true, type: 'boolean' },
    { group: 'features', key: 'payments_enabled', value: true, type: 'boolean' },
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { group_key: { group: setting.group, key: setting.key } },
      update: {},
      create: setting,
    })
  }

  console.log(`  ✓ ${defaultSettings.length} default system settings created`)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
