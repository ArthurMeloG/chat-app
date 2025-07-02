'use client';

import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { ChatMessage } from '@/types/ChatMessage';

let stompClient: Client;

export function connectWebSocket(
    jwt: string,
    currentUserEmail: string,
    onMessage: (msg: ChatMessage) => void
) {
    const socket = new SockJS(`http://localhost:8080/ws?token=${jwt}`);

    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('WebSocket conectado');

            stompClient.subscribe(`/topic/user.${currentUserEmail}`, (message: IMessage) => {
                const parsed = JSON.parse(message.body);
                console.log("PARSED")
                console.log(parsed)
                onMessage(parsed);
            });
        },
        onStompError: (frame) => {
            console.error('Erro STOMP', frame);
        },
    });

    stompClient.activate();
}

export function sendMessage(message: ChatMessage) {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/chat',
            body: JSON.stringify(message),
        });
    }
}
