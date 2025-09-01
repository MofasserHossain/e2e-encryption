export interface ChatMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
  nonce?: string
  sender: {
    id: string
    name: string
    username: string
  }
}

export interface SocketUserData {
  userId: string
  username: string
  email: string
}
