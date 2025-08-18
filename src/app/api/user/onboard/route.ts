import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, username } = body

    if (!name || !username) {
      return NextResponse.json(
        { error: 'Name and username are required' },
        { status: 400 },
      )
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 },
      )
    }

    // Update user with onboarding information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        isOnboarded: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        isOnboarded: true,
      },
    })

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
