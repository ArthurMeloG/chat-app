export interface ChatMessage {
    sender: string;
    receiver: string;
    content: string;
    timestamp?: string;
}