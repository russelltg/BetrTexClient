import * as React from 'react';
import { Message, MmsData, SmsData } from './Message';
import { ContactInfo } from './ContactInfo';
import { WsConnection } from './WsConnection';
import { Card, CardContent, Typography } from 'material-ui';
import PersonAvatar from './PersonAvatar';

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
            b64_image: ''
        }};

        this.props.connection.contactInfo(
            this.props.message.person.contactid, (info: ContactInfo) => {
            this.setState({info: info});
        });
    }

    render() {

        var content: JSX.Element = <span />;

        const data = this.props.message.data;

        const sms = data as SmsData;
        if (sms !== undefined) {
            content = <Typography type="body1">{sms.message}</Typography>;
        }

        const mms = data as MmsData;
        if (mms !== undefined) {
            if (mms.type === 'IMAGE') {
                content = <img src={mms.data} width="300" />;
            } else if (mms.type === 'TEXT') {
                content = <Typography type="body1">{mms.data}</Typography>;
            }
        }

        return (
            <div style={{ paddingBottom: 20 }}>
                <Card>
                    <CardContent>
                        <PersonAvatar info={this.state.info} />
                        {content}
                    </CardContent>
                </Card>
            </div>);
    }

}
