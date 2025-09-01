import { getEncryptionKeysFromCookies } from '@/lib/cookie-utils'
import { decryptMessage } from '@/lib/e2e-encryption'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/conversations - Get conversations for a user
export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    // Get user's encryption keys from cookies
    const userKeys = getEncryptionKeysFromCookies(request)
    if (!userKeys.privateKey) {
      return NextResponse.json(
        { error: 'Encryption keys not found' },
        { status: 401 },
      )
    }

    // Get conversations where the user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                publicKey: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Decrypt the last message in each conversation
    const conversationsWithDecryptedMessages = await Promise.all(
      conversations.map(async (conversation) => {
        if (conversation.messages.length === 0) {
          return conversation
        }

        const lastMessage = conversation.messages[0] // First message due to desc order

        // Skip decryption if message is missing required fields
        if (!lastMessage.nonce) {
          return {
            ...conversation,
            messages: [
              {
                ...lastMessage,
                content: 'Message missing encryption data',
              },
            ],
          }
        }

        try {
          let decryptedContent: string

          if (lastMessage.senderId === userId) {
            // Decrypt own message (sender decrypts their own message)
            // Find the OTHER participant's public key
            const otherParticipant = conversation.participants.find(
              (p) => p.user.id !== userId,
            )

            if (otherParticipant?.user.publicKey) {
              decryptedContent = await decryptMessage(
                lastMessage.content,
                lastMessage.nonce as string,
                userKeys.privateKey as string,
                otherParticipant.user.publicKey,
              )
            } else {
              decryptedContent =
                'Failed to decrypt: missing receiver public key'
            }
          } else {
            // Decrypt sender's message
            decryptedContent = await decryptMessage(
              lastMessage.content,
              lastMessage.nonce as string,
              userKeys.privateKey as string,
              lastMessage.sender.publicKey!,
            )
          }

          return {
            ...conversation,
            messages: [
              {
                ...lastMessage,
                content: decryptedContent || 'Failed to decrypt message',
              },
            ],
          }
        } catch (_error) {
          // If decryption fails, return conversation with error message
          return {
            ...conversation,
            messages: [
              {
                ...lastMessage,
                content: 'Failed to decrypt message',
              },
            ],
          }
        }
      }),
    )

    return NextResponse.json(conversationsWithDecryptedMessages)
  } catch (error) {
    // console.error('Error fetching conversations:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
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
    const { userId, otherUserId } = body

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: 'User ID and other user ID are required' },
        { status: 400 },
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (existingConversation) {
      return NextResponse.json(existingConversation)
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    // console.error('Error creating conversation:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
