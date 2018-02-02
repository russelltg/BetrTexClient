import { ConversationData } from './Conversation';
import { Message } from './Message';
import { ContactInfo, defaultContactInfo } from './ContactInfo';
import { Base64Image } from './Base64Image';
import { defaultPendingImage } from './PendingImage';

interface NewTextMessage {
    message: string;
}

interface NewImageMessage {
    base64_image: string;
    mime_type: string;
}

interface SendTextParams {
    threadid: number;
    numbers: Array<string>;
    message: NewTextMessage | NewImageMessage;
}

interface RpcMessage {
    id: number;
    jsonrpc: number;
}

interface RpcRequest<T> extends RpcMessage {
    method: string;
    params: T;
}

interface RpcResponse<T> extends RpcMessage {
    result: T;
}

/**
 * A connection to a Bridge app
 */
class WsConnection {

    private socket: WebSocket;
    private waitingIDs: Map<number, (message: string) => void>;
    private nextID = 1;
    private messageQueue: string[];

    private messageHandler: Map<number, (message: Message) => void>;

    private cache: boolean;

    /**
     *
     * @param ip The IP address to connect to
     * @param port The port the ws server is being hosted on. Default is 14563
     * @param connect Function to call when the connection is established or times out
     * @param accept Function to call when the connection is either accepted or rejected by the user
     */
    constructor(ip: string, port: number, cache: boolean, connect: (c: boolean) => void, accept: (a: boolean) => void) {
        this.cache = cache;
        this.waitingIDs = new Map<number, (message: string) => void>();
        this.messageQueue = [];
        this.messageHandler = new Map<number, (message: Message) => void>();
        this.socket = new WebSocket('ws://' + ip + ':' + String(port));

        this.socket.addEventListener('message', (evt: MessageEvent) => {
            const message = JSON.parse(String(evt.data)) as RpcMessage;

            // tslint:disable-next-line:no-any
            var resp = message as RpcResponse<any>;
            if (resp && this.waitingIDs.has(message.id)) {

                var callback = this.waitingIDs.get(message.id);
                if (callback) {
                    callback(JSON.stringify(resp.result));
                }
                this.waitingIDs.delete(message.id);

                return;
            }

            // tslint:disable-next-line:no-any
            var req = message as RpcRequest<any>;
            if (req) {

                // test for accepted
                if (req.method === 'connectionaccepted') {
                    accept(true);

                    return;
                }

                // test for rejected
                if (req.method === 'connectionrejected') {
                    accept(false);

                    return;
                }

                if (req.method === 'text-received') {
                    const msg = req.params as Message;
                    const handler = this.messageHandler.get(msg.threadid);
                    if (handler) {
                        handler(msg);
                    }

                }
            }

        });

        this.socket.addEventListener('open', (ev: Event) => {
            // send message queue
            this.messageQueue.forEach(msg => {
                this.socket.send(msg);
            });

            connect(true);
        });

        this.socket.addEventListener('error', (ev: Event) => {
            connect(false);
        });
    }

    registerThreadID(threadid: number, onnewmessage: (msg: Message) => void) {
        this.messageHandler.set(threadid, onnewmessage);
    }

    async listConversations(): Promise<ConversationData[]> {
        return this.performRequest<ConversationData[]>('list-conversations', {});
    }

    sendText(params: SendTextParams) {
        return this.performRequest('send-text', params);
    }

    /**
     *
     * @param imageUri The URI of the image to get. Given by `getContactInfo` or `getMessages`
     */
    async getImage(imageUri: string): Promise<Base64Image> {

        if (imageUri === undefined || imageUri === '') {
            throw TypeError('getImage called with invalid uri');
        }

        const key = 'bridge/image(' + encodeURIComponent(imageUri) + '):' + this.socket.url;
        
        if (this.cache) {
            // see if it's in the cache
            // TODO: somehow identify the phone instead of IP as IP can change
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(value);
            }
        }
        // cache entry not found

        // request
        const picture = await this.performRequest<Base64Image>('get-image', imageUri);

        // save to cache
        if (this.cache) {
            try {
                localStorage[key] = JSON.stringify(picture);
                // tslint:disable-next-line:no-empty
            } catch (e) { }
        }

        return picture;
    }

    async contactInfo(contactID: number): Promise<ContactInfo> {

        // zero means the sender is the owner of the phone
        if (contactID === 0) {
            return {
                name: 'Me',
                image: defaultPendingImage
            };
        }

        // -1 means unknown
        if (contactID === -1) {
            return defaultContactInfo;
        }
        const key = 'bridge/contact(' + contactID.toString() + '):' + this.socket.url;
        
        if (this.cache) {
            // see if it's in the cache
            // TODO: somehow identify the phone instead of IP as IP can change
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(value) as ContactInfo;
            }
            // cache entry not found
        }

        // request
        const contact = await this.performRequest<ContactInfo>('contact-info', contactID);

        if (this.cache) {
            // save to cache
            try {    
                localStorage[key] = JSON.stringify(contact);
            // tslint:disable-next-line:no-empty
            } catch (e) { }
        }
        return contact;
    }

    async getMessages(threadID: number, from: number, to: number): Promise<Message[]> {
        return this.performRequest<Message[]>('get-messages', {
            threadid: threadID,
            from: from,
            to: to
        });
    }

    private async performRequest<T>(method: string, params: any): Promise<T> {

        const thisID = this.nextID++;

        return new Promise<T>((resolve, reject) => {

            this.waitingIDs.set(thisID, (result: string) => {
                let parsed = JSON.parse(result);
                if ((parsed as T) !== undefined) {
                    resolve(parsed as T);
                }
            });
    
            // start the request
            var messageObject = {
                jsonrpc: 2,
                id: thisID,
                method: method,
                params: params
            };
    
            const stringMessage = JSON.stringify(messageObject);
            if (this.socket.readyState !== WebSocket.OPEN) {
                this.messageQueue.push(stringMessage);
            } else {
                this.socket.send(stringMessage);
            }
        });

    }

}

export { WsConnection };
