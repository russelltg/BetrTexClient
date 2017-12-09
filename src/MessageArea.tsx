import * as React from 'react';
import Message from './Message';
import ContactInfo from './ContactInfo';
import WsConnection from './WsConnection';
import { Chip, Avatar } from 'material-ui';

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
            <Chip 
                avatar={<Avatar>{this.state.info.name === undefined || this.state.info.name.length === 0 ? ' ' : this.state.info.name[0]}</Avatar>}
                label={this.props.message.message}
            />
        </div>);
    }

}
