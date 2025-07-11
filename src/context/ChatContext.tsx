"use client"

import {createContext, useContext, useState, useEffect, SetStateAction, Dispatch} from "react"
import type {ChatConversation, ChatMessage} from "@/types/ChatMessage"
import { fetchConversations } from "@/services/chat"
import {toast} from "sonner";
import {fetchMessages} from "@/services/message";

const ChatContext = createContext<{
    conversations: ChatConversation[]
    setConversations: Dispatch<SetStateAction<ChatConversation[]>>
    reloadConversations: () => Promise<void>
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
    email: string
    setEmail: Dispatch<SetStateAction<string>>
    handleNewMessage: (message: ChatMessage) => void
    handleSelectConversation: (conversation: ChatConversation) => void
    messages: ChatMessage[]
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>
    selectedConversation: ChatConversation
    setSelectedConversation: Dispatch<SetStateAction<ChatConversation>>
} | null>(null)

export const useChat = () => {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error("useChat must be used within a ChatProvider")
    return ctx
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation>({});
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState<string>("");

    const reloadConversations = async () => {
        const jwt = localStorage.getItem("jwt")
        if (!jwt) return
        const updated = await fetchConversations(jwt, () => setIsLoading(false), () => toast.error("Erro ao carregar conversas"))
        setConversations(updated)
    }

    const handleNewMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message])

        // Atualizar última mensagem na conversa
        setConversations((prev) =>
            prev.map((conv) => {
                if (conv.participants.includes(message.sender) && conv.participants.includes(message.receiver)) {
                    return {
                        ...conv,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                        unreadCount: selectedConversation?.id === conv.id ? 0 : (conv.unreadCount || 0) + 1,
                    }
                }
                return conv
            }),
        )
    }

    useEffect(() => {
        reloadConversations()
    }, [])

    return (
        <ChatContext.Provider value={{
            conversations,
            setConversations,
            reloadConversations,
            isLoading,
            setIsLoading,
            email,
            setEmail,
            handleNewMessage,
            handleSelectConversation,
            messages,
            setMessages,
            selectedConversation,
            setSelectedConversation
        }}>
            {children}
        </ChatContext.Provider>
    )
}
