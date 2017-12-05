import * as React from 'react';
import Conversation from './Conversation';
import MessageArea from './MessageArea';
import Message from './Message';
import WsConnection from './WsConnection';

interface ConversationAreaProps {
    conversation: Conversation;
    connection: WsConnection;
}

interface ConversationAreaState {
    message: string;
}

class ConversationArea extends React.Component<ConversationAreaProps, ConversationAreaState> {

    constructor(props: ConversationAreaProps) {
        super(props);

        this.state = {message: ''};
    }

    sendMessage = () => {
        this.props.connection.sendText(this.props.conversation.phoneNumber, this.state.message);
    }

    handleTextChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({message: evt.target.value});
    }

    render() {

        return  (
          <div>
            <h2>{this.props.conversation.phoneNumber}</h2>
            {this.props.conversation.messages.map((message: Message, i: number) => (
                <div>
                    <MessageArea 
                        key={i}
                        message={message}
                    />
                </div>
            ))}
            <input type="text" onChange={this.handleTextChange} />
            <button onClick={this.sendMessage} >Send</button>
        </div>
        );
    }
}

export default ConversationArea;
