import {toast} from "sonner";

export const updateMessagessRead = async (jwt: string, messageId: string) => {
    try {
        const response = await fetch(`http://localhost:8080/messages/${messageId}/read`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            console.error("Falha ao marcar mensagem como lida:", response.status, response.statusText)
            throw new Error(`Falha ao marcar mensagem como lida: ${response.status}`)
        }

    } catch (error) {
        console.error("Erro ao marcar mensagem como lida:", error)
        throw error
    }
}

export const fetchMessages = async (jwt: string, emailSender: string, emailReceiver: string, onSuccess : Function) => {
    try {
        const response = await fetch(`http://localhost:8080/messages/history?user1=${emailSender}&user2=${emailReceiver}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
        })

        if (response.ok) {
            const data = await response.json()
            onSuccess(data)
        } else {
            toast.error("Erro ao carregar conversas")
        }
    } catch (error) {
        toast.error("Erro de conexão ao carregar conversas")
    }
}