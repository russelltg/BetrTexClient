import ConversationData from './Conversation';
import Message from './Message';
import ContactInfo from './ContactInfo';

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

class WsConnection {

    private socket: WebSocket;
    private waitingIDs: Map<number, (message: string) => void>;
    private nextID = 1;
    private messageQueue: string[];
    private contactCache: Map<number, ContactInfo>;

    constructor (ip: string, port: number, textHandler: (message: Message) => void) {
        this.waitingIDs = new Map<number, (message: string) => void>();
        this.messageQueue = [];
        this.contactCache = new Map<number, ContactInfo>();
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
            }

            // tslint:disable-next-line:no-any
            var req = message as RpcRequest<any>;
            if (req) {

                if (req.method === 'text-received') {
                    textHandler(req.params as Message);
                }
            }

        });
        
        this.socket.addEventListener('open', (ev: Event) => {
            // send message queue
            this.messageQueue.forEach(msg => {
                this.socket.send(msg);
            });
        });
    }

    listConversations(onreturn: (message: ConversationData[]) => void) {
        this.performRequest('list-conversations', {}, onreturn);
    }

    sendText(message: string, people: number[]) {
        this.performRequest('send-text', {
            to: people,
            message: message
        },                  (a: {}) => { return {}; });
    }

    contactInfo(canonAddr: number, onreturn: (info: ContactInfo) => void) {

        if (this.contactCache.has(canonAddr)) {
            const cachedEntry = this.contactCache.get(canonAddr);
            if (cachedEntry) {
                onreturn(cachedEntry);
            }
        }

        this.performRequest('contact-info', canonAddr, (info: ContactInfo) => {
            this.contactCache.set(canonAddr, info);

            onreturn(info);
        });
    }

    getMessages(threadID: number, onreturn: (info: Message[]) => void) {
        this.performRequest('get-messages', threadID, onreturn);
    }

    private performRequest<T, U>(method: string, params: U, onreturn: (message: T) => void) {
        
        const thisID = this.nextID++;

        this.waitingIDs.set(thisID, (result: string) => {
            let parsed = JSON.parse(result);
            if ((parsed as T) !== undefined) {
                onreturn(parsed as T);
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
    }

}

export default WsConnection;
