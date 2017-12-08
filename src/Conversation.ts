import Message from './Message';

export default interface ConversationData {
    threadid: number;
    messagecount: number;
    snippet: string;
    addresses: Array<number>;
    read: Boolean;
}

export default interface Conversation {
    data: ConversationData;
    messages: Message[];
}
