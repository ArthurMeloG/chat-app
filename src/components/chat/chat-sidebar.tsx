"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ChatConversation } from "@/types/ChatMessage"
import { LogOut, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
    conversations: ChatConversation[]
    selectedConversation: ChatConversation | null
    currentUserEmail: string
    onSelectConversation: (conversation: ChatConversation) => void
    onLogout: () => void
    isLoading: boolean
}

export function ChatSidebar({
                                conversations,
                                selectedConversation,
                                currentUserEmail,
                                onSelectConversation,
                                onLogout,
                                isLoading,
                            }: ChatSidebarProps) {
    const getOtherParticipant = (conversation: ChatConversation) => {
        return conversation.participants.find((p) => p !== currentUserEmail) || ""
    }

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase()
    }

    const formatTime = (date?: Date) => {
        if (!date) return ""
        const now = new Date()
        const messageDate = new Date(date)

        if (now.toDateString() === messageDate.toDateString()) {
            return messageDate.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        }

        return messageDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        })
    }

    return (
        <div className="w-80 bg-card border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {getInitials(currentUserEmail)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-foreground">Conversas</h2>
                            <p className="text-sm text-muted-foreground truncate max-w-32">{currentUserEmail}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                                <div className="h-12 w-12 bg-muted rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium text-foreground mb-2">Nenhuma conversa</h3>
                        <p className="text-sm text-muted-foreground">Suas conversas aparecerão aqui</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {conversations.map((conversation) => {
                            const otherParticipant = getOtherParticipant(conversation)
                            const isSelected = selectedConversation?.id === conversation.id

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        isSelected && "bg-primary/10 text-primary border border-primary/20",
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 bg-secondary">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                                                {getInitials(otherParticipant)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conversation?.unreadCount > 0 && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                            >
                                                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium truncate">{otherParticipant}</h4>
                                            <span className="text-xs text-muted-foreground">{formatTime(conversation.lastMessageTime)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {conversation.lastMessage || "Nenhuma mensagem"}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
