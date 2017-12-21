import * as React from 'react';
import { ConversationData } from './Conversation';
import MessageArea from './MessageArea';
import { Message } from './Message';
import { WsConnection } from './WsConnection';
import { Input, IconButton, Divider, FormControl } from 'material-ui';
import SendIcon from 'material-ui-icons/Send';
import CircularProgress from 'material-ui/Progress/CircularProgress';

interface ConversationAreaProps {
    conversation: ConversationData;
    connection: WsConnection;
    style: React.CSSProperties;
}

interface ConversationAreaState {
    message: string;
    messages: Message[];
    loaded: boolean;
}

class ConversationArea extends React.Component<ConversationAreaProps, ConversationAreaState> {

    bottom: HTMLDivElement;

    constructor(props: ConversationAreaProps) {
        super(props);

        this.state = { message: '', messages: [], loaded: false };

        this.props.connection.getMessages(this.props.conversation.threadid, (messages: Message[]) => {
            this.setState({ messages: messages, loaded: true });

            this.bottom.scrollIntoView();
        });

        this.props.connection.registerThreadID(this.props.conversation.threadid, (message: Message) => {
            this.setState({ messages: [...this.state.messages, message] });

            this.bottom.scrollIntoView();
        });

    }

    sendMessage = () => {
        // clear box
        this.setState({ message: '' });

        this.props.connection.sendText(this.state.message, this.props.conversation.people.map((it) => {
            return it.number;
        }), this.props.conversation.threadid);
    }

    handleTextChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ message: evt.target.value });
    }

    handleKeyUp = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === 'Enter') {
            this.sendMessage();
        }
    }

    componentDidMount() {
        this.bottom.scrollIntoView();
    }

    render() {

        const messagesStyling: React.CSSProperties = {
            boxSizing: 'border-box',
            paddingLeft: 20,
            overflowY: 'scroll',
            position: 'absolute',
            height: 'calc(100% - 50px)',
            width: 'calc(100%)',
        };

        return (
            <div style={this.props.style}>
                {!this.state.loaded ?
                    <CircularProgress /> : <></>}
                <div style={messagesStyling}>
                    {this.state.messages.map((message: Message, i: number) => (
                        <div key={i}>
                            <MessageArea
                                message={message}
                                connection={this.props.connection}
                            />
                        </div>
                    ))}
                    <div style={{ float: 'left', clear: 'both' }} ref={(e1) => { if (e1) { this.bottom = e1; } }} />
                </div>
                <Divider light={true} />
                <FormControl
                    fullWidth={true}
                    style={{
                        position: 'absolute', bottom: 0, boxSizing: 'border-box', paddingLeft: 20, paddingBottom: 5
                    }}
                >
                    <Input
                        onKeyUp={this.handleKeyUp}
                        placeholder="Type a message..."
                        onChange={this.handleTextChange}
                        value={this.state.message}
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

export { ConversationArea };
