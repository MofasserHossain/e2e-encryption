import { setEncryptionKeysInCookies } from '@/lib/cookie-utils'
import { generateToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        password: true,
        publicKey: true,
        privateKey: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    // Create response with user data
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          publicKey: user.publicKey,
        },
      },
      { status: 200 },
    )

    // Set encryption keys in cookies
    setEncryptionKeysInCookies(response, {
      token: token,
      privateKey: user.privateKey!,
      publicKey: user.publicKey!,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' + error },
      { status: 500 },
    )
  }
}
