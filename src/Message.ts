interface SmsData {
    message: string;
}

interface MmsData {
    type: string;
    data: string;
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
    data: MmsData | SmsData;
}

export { SmsData, MmsData, Person, Message};
