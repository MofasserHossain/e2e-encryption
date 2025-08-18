'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, LogOut, Plus, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface User {
  id: string
  name: string
  username: string
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: User
}

interface Conversation {
  id: string
  participants: Array<{
    user: User
  }>
  messages: Message[]
  updatedAt: string
}

export default function ChatPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages-container')
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const focusMessageInput = () => {
    messageInputRef.current?.focus()
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100 // Reduced threshold for better responsiveness
    setShowScrollButton(isScrolledUp)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin')
    }
  }, [isLoading])

  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      // Small delay to ensure conversation is loaded before focusing
      setTimeout(() => focusMessageInput(), 100)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true)
      const response = await fetch(
        `/api/conversations?userId=${user?.id}`,
      )
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingConversation(true)
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?userId=${user?.id}`,
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `/api/users/search?q=${query}&currentUserId=${user?.id}`,
      )
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const startConversation = async (otherUser: User) => {
    try {
      setIsLoadingConversation(true)
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          otherUserId: otherUser.id,
        }),
      })

      if (response.ok) {
        const conversation = await response.json()
        setConversations((prev) => [conversation, ...prev])
        setSelectedConversation(conversation)
        setIsSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
        focusMessageInput() // Focus input when starting new conversation
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id)
      return

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
            senderId: user.id,
          }),
        },
      )

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        fetchConversations() // Refresh conversation list to update last message
        focusMessageInput() // Focus input after sending message
      } else {
        // If sending failed, restore the message
        setNewMessage(messageContent)
        console.error('Failed to send message')
      }
    } catch (error) {
      // If sending failed, restore the message
      setNewMessage(messageContent)
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth/signin')
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (p) => p.user.id !== user?.id,
    )?.user
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setIsLoadingConversation(true)
    setSelectedConversation(conversation)
    setMessages([]) // Clear messages while loading
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Conversations */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chats</h1>
            <div className="flex items-center gap-2">
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h3 className="font-medium">Start a new conversation</h3>
                    <Input
                      placeholder="Search by username or name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                    />
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => startConversation(user)}
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm">Loading conversations...</span>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin messaging</p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation)
              const lastMessage = conversation?.messages?.[0] || null
              return (
                <div
                  key={conversation.id}
                  className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{otherUser?.name}</p>
                      <p className="text-sm text-gray-500">
                        @{otherUser?.username}
                      </p>
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                      {lastMessage.sender.id === user?.id ? 'You: ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Side - Messages */}
      <div className="flex flex-1 flex-col relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold">
                {getOtherParticipant(selectedConversation)?.name}
              </h2>
              <p className="text-sm text-gray-500">
                @{getOtherParticipant(selectedConversation)?.username}
              </p>
            </div>

            {/* Messages */}
            <div className="messages-container flex-1 space-y-4 overflow-y-auto p-4 flex flex-col-reverse relative" onScroll={handleScroll}>
              
              <div className="space-y-4">
                {/* Loading indicator */}
                {isLoadingConversation && (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span>Loading conversation...</span>
                    </div>
                  </div>
                )}
                
                {!isLoadingConversation && messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                        message.senderId === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Sending indicator */}
                {isSending && (
                  <div className="flex justify-end">
                    <div className="max-w-xs rounded-lg px-4 py-2 lg:max-w-md bg-blue-500 text-white opacity-70">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                      </div>
                        <span className="text-xs opacity-70">Sending...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex gap-2">
                <Input
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isSending ? "Sending message..." : "Type a message..."}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="flex-1"
                  autoFocus
                  disabled={isSending }
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a chat from the left sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
