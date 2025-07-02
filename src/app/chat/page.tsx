'use client';

import { useEffect, useState } from 'react';
import { connectWebSocket, sendMessage } from '@/utils/websocket';
import { ChatMessage } from '@/types/ChatMessage';

export default function ChatPage() {
    const [receiver, setReceiver] = useState('');
    const [content, setContent] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    const currentUser = typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';

    useEffect(() => {
        if (jwt && currentUser) {
            connectWebSocket(jwt, currentUser, (msg) => {
                setMessages((prev) => [...prev, msg]);
            });
        }
    }, [jwt, currentUser]);

    const handleSend = () => {
        const msg: ChatMessage = {
            sender: currentUser,
            receiver,
            content,
        };
        sendMessage(msg);
        setMessages((prev) => [...prev, msg]);
        setContent('');
    };

    return (
        <div>
            <h1>Chat</h1>
            <input
                placeholder="Destinatário (email)"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
            />
            <br />
            <input
                placeholder="Mensagem"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handleSend}>Enviar</button>

            <hr />
            <h2>Mensagens</h2>
            <div>
                {messages.map((m, i) => (
                    <div key={i}>
                        <strong>{m.sender}</strong> ➜ <em>{m.receiver}</em>: {m.content}
                    </div>
                ))}
            </div>
        </div>
    );
}
