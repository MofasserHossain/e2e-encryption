const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Create demo users
  const users = [
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      username: 'alice',
      password: 'password123',
    },
    {
      email: 'bob@example.com',
      name: 'Bob Smith',
      username: 'bob',
      password: 'password123',
    },
    {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      username: 'charlie',
      password: 'password123',
    },
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1', // P-256
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        username: userData.username,
        password: hashedPassword,
        publicKey,
        privateKey,
      },
    })

    console.log(`✅ Created user: ${user.name} (@${user.username})`)
  }

  // Create a demo conversation between Alice and Bob
  const alice = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  })
  const bob = await prisma.user.findUnique({
    where: { email: 'bob@example.com' },
  })

  if (alice && bob) {
    await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: alice.id }, { userId: bob.id }],
        },
      },
    })
    console.log('✅ Created demo conversation (no messages)')
  }

  console.log('🎉 Demo data seeding completed!')
  console.log('')
  console.log('Demo accounts:')
  console.log('- alice@example.com / password123')
  console.log('- bob@example.com / password123')
  console.log('- charlie@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
