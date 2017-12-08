import * as React from 'react';
import ConversationData from './Conversation';
import MessageArea from './MessageArea';
import Message from './Message';
import WsConnection from './WsConnection';
import ContactInfo from './ContactInfo';

interface ConversationAreaProps {
    conversation: ConversationData;
    connection: WsConnection;
}

interface ConversationAreaState {
    message: string;
    contactInfos: ContactInfo[];
    messages: Message[];
}

class ConversationArea extends React.Component<ConversationAreaProps, ConversationAreaState> {

    constructor(props: ConversationAreaProps) {
        super(props);

        this.state = {message: '', contactInfos: [], messages: []};

        // TODO: do more than the first one

        var running: ContactInfo[] = [];

        this.props.conversation.addresses.map((addr: number) => {
            this.props.connection.contactInfo(addr, (info: ContactInfo) => {
                running.push(info);

                if (running.length === this.props.conversation.addresses.length) {
                    this.setState({contactInfos: running});
                }
            });
        });

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

    render() {

        const unreadStle: React.CSSProperties = {
            fontWeight: 'bold'
        };
        const readStyle: React.CSSProperties = {
            fontWeight: 'normal'
        };

        return  (
          <div>
            <h2>{this.state.contactInfos.map((info: ContactInfo, id: number) => {
                return <div key={id}>
                    <div>{info.name}: {info.number}</div>
                    <img src={info.b64_image} />
                    </div>
                    ;
            })}</h2>
            <div style={this.props.conversation.read ? readStyle : unreadStle}>
                {this.props.conversation.snippet}
            </div>
            {this.state.messages.map((message: Message, i: number) => (
                <div>
                    <MessageArea 
                        key={i}
                        message={message}
                        connection={this.props.connection}
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
