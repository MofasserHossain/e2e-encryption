import { setEncryptionKeysInCookies } from '@/lib/cookie-utils'
import { generatePemKeyPair } from '@/lib/e2e-encryption'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validations/auth'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, username } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate E2E encryption keys
    const { privateKeyPem, publicKeyPem } = await generatePemKeyPair()

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password: hashedPassword,
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        publicKey: true,
        privateKey: true,
        createdAt: true,
      },
    })

    // Create response
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          publicKey: user.publicKey,
        },
      },
      { status: 201 },
    )

    // Set encryption keys in cookies
    setEncryptionKeysInCookies(response, {
      privateKey: user.privateKey,
      publicKey: user.publicKey,
    })

    return response
  } catch (error) {
    // console.log('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' + error },
      { status: 500 },
    )
  }
}
