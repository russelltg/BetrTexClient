import * as React from 'react';
import ConversationData from './Conversation';
import MessageArea from './MessageArea';
import Message from './Message';
import WsConnection from './WsConnection';
import { Input, IconButton, Divider, FormControl } from 'material-ui';
import SendIcon from 'material-ui-icons/Send';

interface ConversationAreaProps {
    conversation: ConversationData;
    connection: WsConnection;
}

interface ConversationAreaState {
    message: string;
    messages: Message[];
}

class ConversationArea extends React.Component<ConversationAreaProps, ConversationAreaState> {

    bottom: HTMLDivElement;

    constructor(props: ConversationAreaProps) {
        super(props);

        this.state = {message: '',  messages: []};

        this.props.connection.getMessages(this.props.conversation.threadid, (messages: Message[]) => {
            this.setState({messages: messages});
        });

    }

    sendMessage = () => {
        this.props.connection.sendText(this.state.message, this.props.conversation.addresses);
    }

    handleTextChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({message: evt.target.value});
    }

    componentDidMount() {
        this.bottom.scrollIntoView();
    }

    render() {

        return  (
          <div>
            <div style={{overflowY: 'scroll', height: 'calc(100% - 50px)', width: '100%', position: 'absolute'}}>
                {this.state.messages.map((message: Message, i: number) => (
                    <div key={i}>
                        <MessageArea 
                            message={message}
                            connection={this.props.connection}
                        />
                    </div>
                ))}
                <div ref={(e1) => { if (e1) {this.bottom = e1; } }} />
            </div>
            <Divider light={true} />
            <FormControl fullWidth={true} style={{position: 'absolute', bottom: 0}}>
                <Input
                    placeholder="Type a message..."
                    onChange={this.handleTextChange}
                    endAdornment={
                        <IconButton onClick={this.sendMessage}>
                            <SendIcon />
                        </IconButton>}
                />
                
            </FormControl>
        </div>
        );
    }
}

export default ConversationArea;
