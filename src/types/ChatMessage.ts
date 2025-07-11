export interface ChatMessage {
    id?: string
    content: string
    sender: string
    receiver: string
    timestamp: Date
    read?: boolean
}

export interface ChatConversation {
    id: string
    participants: string[]
    lastMessage?: string
    lastMessageTime?: Date
    unreadCount?: number
}
