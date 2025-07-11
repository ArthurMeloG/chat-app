"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatConversation, ChatMessage } from "@/types/ChatMessage"
import { Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateMessagessRead } from "@/services/message"

interface ChatAreaProps {
    selectedConversation: ChatConversation | null
    messages: ChatMessage[]
    currentUserEmail: string
    onSendMessage: (content: string) => void
}

export function ChatArea({ selectedConversation, messages, currentUserEmail, onSendMessage }: ChatAreaProps) {
    const [newMessage, setNewMessage] = useState("")
    const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set())
    const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())
    const [previousMessageCount, setPreviousMessageCount] = useState(0)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }

    useEffect(() => {
        if (messages.length > previousMessageCount) {
            // Identificar mensagens novas
            const newMessages = messages.slice(previousMessageCount)
            const newIds = new Set(newMessageIds)

            newMessages.forEach((msg) => {
                if (msg.id && msg.sender !== currentUserEmail) {
                    newIds.add(msg.id)
                }
            })

            setNewMessageIds(newIds)
            setPreviousMessageCount(messages.length)

            // Auto-scroll para o final
            setTimeout(scrollToBottom, 100)
        }
    }, [messages.length, previousMessageCount, currentUserEmail, newMessageIds])

    // Reset quando muda de conversa
    useEffect(() => {
        setReadMessageIds(new Set())
        setNewMessageIds(new Set())
        setPreviousMessageCount(messages.length)
        setTimeout(scrollToBottom, 100)
    }, [selectedConversation?.id, messages.length])

    const handleSendMessage = () => {
        if (!newMessage.trim()) return

        onSendMessage(newMessage.trim())
        setNewMessage("")

        // Auto-scroll após enviar mensagem
        setTimeout(scrollToBottom, 100)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase()
    }

    const getOtherParticipant = () => {
        if (!selectedConversation) return ""
        return selectedConversation.participants.find((p) => p !== currentUserEmail) || ""
    }

    const formatMessageTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const markMessagesAsRead = async () => {
        const jwt = localStorage.getItem("jwt")
        if (!jwt) return

        const unreadMessages = messages.filter(
            (message) => message.receiver === currentUserEmail && message.id && !readMessageIds.has(message.id),
        )

        if (unreadMessages.length === 0) return

        try {
            await Promise.all(unreadMessages.map((message) => updateMessagessRead(jwt, message.id!)))

            // Adicionar IDs das mensagens lidas ao Set
            setReadMessageIds((prev) => {
                const newSet = new Set(prev)
                unreadMessages.forEach((msg) => {
                    if (msg.id) newSet.add(msg.id)
                })
                return newSet
            })

            // Remover destaque de mensagens novas quando marcadas como lidas
            setNewMessageIds(new Set())
        } catch (error) {
            console.error("Erro ao marcar mensagens como lidas:", error)
        }
    }

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Selecione uma conversa</h3>
                    <p className="text-muted-foreground">Escolha uma conversa da sidebar para começar a conversar</p>
                </div>
            </div>
        )
    }

    const otherParticipant = getOtherParticipant()

    return (
        <div className="flex-1 flex flex-col bg-background h-screen">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-secondary">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                            {getInitials(otherParticipant)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-foreground">{otherParticipant}</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full p-4" onClick={markMessagesAsRead}>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p>Nenhuma mensagem ainda. Comece a conversar!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const isCurrentUser = message.sender === currentUserEmail
                                const isNewMessage = message.id && newMessageIds.has(message.id)
                                const key = message.id ? message.id : `${Date.now()}-${index}`

                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            "flex gap-3 max-w-[80%]",
                                            isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto",
                                            isNewMessage && !isCurrentUser && "bg-yellow-100 border-2 border-yellow-300 p-3 rounded-xl animate-bounce"
                                        )}
                                        // className={cn(
                                        //     "flex gap-3 max-w-[80%] p-2 rounded-lg transition-colors duration-300",
                                        //     isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto",
                                        //     isNewMessage && !isCurrentUser && "bg-muted/30 border border-muted animate-pulse",
                                        // )}
                                    >
                                        <Avatar className="h-8 w-8 bg-secondary flex-shrink-0">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                                {getInitials(message.sender)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div
                                            className={cn(
                                                "rounded-lg px-4 py-2 max-w-full",
                                                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                            )}
                                        >
                                            <p className="text-sm break-words">{message.content}</p>
                                            <p
                                                className={cn(
                                                    "text-xs mt-1",
                                                    isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70",
                                                )}
                                            >
                                                {formatMessageTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
