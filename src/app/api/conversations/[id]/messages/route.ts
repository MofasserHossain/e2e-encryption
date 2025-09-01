import { getEncryptionKeysFromCookies } from '@/lib/cookie-utils'
import { decryptMessage, encryptMessage } from '@/lib/e2e-encryption'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Type declaration for global io instance
declare global {
  var io:
    | {
        to: (room: string) => {
          emit: (event: string, data: unknown) => void
        }
      }
    | undefined
}

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: conversationId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    // Get all participants for this conversation in ONE query
    const participants = await prisma.userConversation.findMany({
      where: { conversationId },
      include: {
        user: { select: { id: true, publicKey: true } },
      },
    })

    if (!participants.find((p) => p.user.id === userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            publicKey: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get user's encryption keys from cookies
    const userKeys = getEncryptionKeysFromCookies(request)

    if (!userKeys.privateKey) {
      return NextResponse.json(
        { error: 'Encryption keys not found' },
        { status: 401 },
      )
    }

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        try {
          let decryptedContent: string

          if (message.senderId === userId) {
            // Decrypt own message (sender decrypts their own message)
            // Find the OTHER participant's public key from our map
            const otherParticipantPublicKey = participants.find(
              (p) => p.user.id !== userId,
            )?.user.publicKey

            if (otherParticipantPublicKey) {
              decryptedContent = await decryptMessage(
                message.content,
                message.nonce,
                userKeys.privateKey!,
                otherParticipantPublicKey, // Use OTHER person's public key
              )
            } else {
              decryptedContent =
                'Failed to decrypt: missing receiver public key'
            }
          } else {
            // Decrypt sender's message
            decryptedContent = await decryptMessage(
              message.content,
              message.nonce as string,
              userKeys.privateKey!,
              message.sender.publicKey!,
            )
          }

          return {
            ...message,
            content: decryptedContent || 'Failed to decrypt message',
            createdAt: message.createdAt.toISOString(),
          }
        } catch (_error) {
          // Failed to decrypt message
          return {
            ...message,
            content: 'Failed to decrypt message',
            createdAt: message.createdAt.toISOString(),
          }
        }
      }),
    )

    return NextResponse.json(decryptedMessages)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// POST /api/conversations/[id]/messages - Send a new encrypted message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: conversationId } = await params
    const body = await request.json()
    const { content, senderId, receiverPublicKey } = body

    if (!content || !senderId || !receiverPublicKey) {
      return NextResponse.json(
        { error: 'Content, sender ID, and receiver public key are required' },
        { status: 400 },
      )
    }

    // Check if user is a participant in this conversation
    const participant = await prisma.userConversation.findFirst({
      where: {
        userId: senderId,
        conversationId: conversationId,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get user's encryption keys from cookies
    const userKeys = getEncryptionKeysFromCookies(request)

    if (!userKeys.privateKey) {
      return NextResponse.json(
        { error: 'Encryption keys not found' },
        { status: 401 },
      )
    }

    // Encrypt the message
    const { cipher, nonce } = await encryptMessage(
      userKeys.privateKey,
      receiverPublicKey,
      content,
    )

    // Create the encrypted message
    const message = await prisma.message.create({
      data: {
        content: cipher, // Store encrypted content
        nonce: nonce, // Store nonce for decryption
        senderId: senderId,
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            publicKey: true,
          },
        },
      },
    })

    const decryptedMessage = await decryptMessage(
      message.content,
      message.nonce,
      userKeys.privateKey,
      receiverPublicKey,
    )

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Notify all participants about the new message
    if (global.io) {
      global.io
        .to(`conversation:${conversationId}`)
        .emit('message:received', message)

      global.io
        .to(`conversation:${conversationId}`)
        .emit('conversation:updated', { conversationId, message })
    }

    return NextResponse.json(
      {
        ...message,
        content: decryptedMessage,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
