import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Start seeding...')
  
  // Create default admin user
  const hashedPassword = await bcrypt.hash('123', 10)
  
  const adminUser = await db.user.upsert({
    where: { username: 'marcelo' },
    update: {},
    create: {
      username: 'marcelo',
      password: hashedPassword,
      name: 'Marcelo González',
      email: 'marcelo@constru-fe.com',
      role: 'admin',
      isActive: true
    }
  })
  
  console.log('Created admin user:', adminUser)
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })