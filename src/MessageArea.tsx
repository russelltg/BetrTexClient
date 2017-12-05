import * as React from 'react';
import Message from './Message';

interface MessageAreaParams {
    message: Message;
}

const MessageArea = (params: MessageAreaParams) => (
    <div>
        <span>{params.message.time.toString()}</span>
        <span>{params.message.message}</span>
    </div>
);

export default MessageArea;
