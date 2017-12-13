import { Message, Person } from './Message';

interface ConversationData {
    threadid: number;
    messagecount: number;
    snippet: string;
    people: Array<Person>;
    read: Boolean;
}

interface Conversation {
    data: ConversationData;
    messages: Message[];
}

export { ConversationData, Conversation };
