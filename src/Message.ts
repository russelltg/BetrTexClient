import { PendingImage } from './PendingImage';

interface TextMessageData {
    type: 'text';
    message: string;
}

interface ImageMessageData {
    type: 'image';
    image: PendingImage;
}

interface Person {
    contactid: number;
    number: string;
}

interface Message {
    person: Person;
    threadid: number;
    timestamp: number;
    read: boolean;
    data: TextMessageData | ImageMessageData;
}

export { TextMessageData, ImageMessageData, Person, Message};
