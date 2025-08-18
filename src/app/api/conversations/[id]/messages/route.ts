import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { id: conversationId } = await params

    // Check if user is a participant in this conversation
    const participant = await prisma.userConversation.findFirst({
      where: {
        userId: userId,
        conversationId: conversationId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { content, senderId } = body

    if (!content || !senderId) {
      return NextResponse.json(
        { error: 'Content and sender ID are required' },
        { status: 400 }
      )
    }

    const { id: conversationId } = await params

    // Check if user is a participant in this conversation
    const participant = await prisma.userConversation.findFirst({
      where: {
        userId: senderId,
        conversationId: conversationId
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content,
        senderId: senderId,
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
