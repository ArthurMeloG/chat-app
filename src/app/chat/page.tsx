"use client"

import {useEffect, useRef, useState} from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatArea } from "@/components/chat/chat-area"
import type { ChatConversation, ChatMessage } from "@/types/ChatMessage"
import { connectWebSocket, sendMessage } from "@/utils/websocket"
import { toast } from "sonner"
import {fetchMessages} from "@/services/message";

export default function ChatPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
    const selectedConversationRef = useRef<ChatConversation | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("")
    const router = useRouter()

    useEffect(() => {
        const jwt = localStorage.getItem("jwt")
        const email = localStorage.getItem("email")

        if (!jwt || !email) {
            router.push("/login")
            return
        }

        setCurrentUserEmail(email)
        fetchConversations(jwt)

        // Conectar WebSocket
        connectWebSocket(jwt, email, handleNewMessage)
    }, [router]);

    useEffect(() => {
        selectedConversationRef.current = selectedConversation
    }, [selectedConversation])

    const fetchConversations = async (jwt: string) => {
        try {
            const response = await fetch("http://localhost:8080/chats", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                setConversations(data)
            } else {
                toast.error("Erro ao carregar conversas")
            }
        } catch (error) {
            toast.error("Erro de conexão ao carregar conversas")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewMessage = (message: ChatMessage) => {
        const selected = selectedConversationRef.current

        if(selected?.participants.includes(message.receiver) && selected?.participants.includes(message.sender)) {
            setMessages((prev) => [...prev, message])
        }

        // Atualizar última mensagem na conversa
        setConversations((prev) =>
            prev.map((conv) => {
                if (conv.participants.includes(message.sender) && conv.participants.includes(message.receiver)) {
                    return {
                        ...conv,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                        unreadCount: selected?.id === conv.id ? 0 : (conv.unreadCount || 0) + 1,
                    }
                }
                return conv
            }),
        )
    }

    const handleSelectConversation = (conversation: ChatConversation) => {
        const jwt = localStorage.getItem("jwt")
        setSelectedConversation(conversation)

        // Marcar como lida
        setConversations((prev) => prev.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv)));

        // fetchMessages
        fetchMessages(jwt, conversation.participants[0], conversation.participants[1], (data) => setMessages(data));
    }

    const handleSendMessage = (content: string) => {
        if (!selectedConversation || !currentUserEmail) return

        const receiver = selectedConversation.participants                                                                              .find((p) => p !== currentUserEmail)
        if (!receiver) return

        const message: ChatMessage = {
            content,
            sender: currentUserEmail,
            receiver,
            timestamp: new Date(),
        }

        sendMessage(message)
        setMessages((prev) => [...prev, message])
    }

    const handleLogout = () => {
        localStorage.removeItem("jwt")
        localStorage.removeItem("email")
        router.push("/login")
    }

    return (
        <div className="flex h-screen bg-background">
            <ChatSidebar
                conversations={conversations}
                selectedConversation={selectedConversation}
                currentUserEmail={currentUserEmail}
                onSelectConversation={handleSelectConversation}
                onLogout={handleLogout}
                isLoading={isLoading}
            />

            <ChatArea
                selectedConversation={selectedConversation}
                messages={messages}
                currentUserEmail={currentUserEmail}
                onSendMessage={handleSendMessage}
            />
        </div>
    )
}
