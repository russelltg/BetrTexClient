class WsConnection {

    socket: WebSocket;

    constructor (ip: string, port: number, textHandler: (msg: string, phoneNumber: string) => void) {
        this.socket = new WebSocket('ws://' + ip + ':' + String(port));
        this.socket.addEventListener('message', (evt: MessageEvent) => {
            const message = JSON.parse(String(evt.data));
            
            if (message.type === 'sms.sent') {
                textHandler(message.message, message.number);
            }
        });
    }

    sendText(phoneNumber: string, message: string) {
        
        var messageObject = {
            type: 'send-text',
            to: phoneNumber,
            message: message
        };

        this.socket.send(JSON.stringify(messageObject));
    }
}

export default WsConnection;
