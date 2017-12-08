import * as React from 'react';
import Message from './Message';
import ContactInfo from './ContactInfo';
import WsConnection from './WsConnection';

interface MessageAreaParams {
    message: Message;
    connection: WsConnection;
}

interface MessageAreaState {
    info: ContactInfo;
}

export default class MessageArea extends React.Component<MessageAreaParams, MessageAreaState> {

    constructor(params: MessageAreaParams) {
        super(params);

        this.state = {info: {
            name: '',
            b64_image: '',
            number: '',
        }};

        this.props.connection.contactInfo(this.props.message.person, (info: ContactInfo) => {
            this.setState({info: info});
        });
    }

    render() {
        return (
        <div>
            <span>{new Date(this.props.message.timestamp).toString()}</span>;
            <span>{this.state.info.name}</span>
            <span>{this.props.message.message}</span>
        </div>);
    }

}
