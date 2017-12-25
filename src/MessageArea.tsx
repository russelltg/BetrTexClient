import * as React from 'react';
import { Message, MmsData, SmsData } from './Message';
import { ContactInfo, defaultContactInfo } from './ContactInfo';
import { WsConnection } from './WsConnection';
import PersonAvatar from './PersonAvatar';
import FetchedImage from './FetchedImage';
import { WithStyles, withStyles, Paper } from 'material-ui';
import Emojify from 'react-emojione';
import Typography from 'material-ui/Typography/Typography';

interface MessageAreaParams {
    message: Message;
    connection: WsConnection;
}

interface MessageAreaState {
    info: ContactInfo;
}

const height = 32;
const maxwidth = 400;
const spacing = 6;
const avatarMargin = 6;

const styles = {
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: height / 2 + 4 + avatarMargin / 2,
        maxWidth: maxwidth,
        width: 'fit-content',
        marginBottom: spacing,
        padding: avatarMargin,
        paddingRight: 10
    } as React.CSSProperties,
    avatar: {
        top: '0%',
        alignSelf: 'flex-start',
        width: height,
        height: height,
    } as React.CSSProperties,
    content: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        whiteSpace: 'pre-wrap'
    } as React.CSSProperties
};

class MessageArea extends React.Component<MessageAreaParams & WithStyles<keyof typeof styles>, MessageAreaState> {

    constructor(params: MessageAreaParams & WithStyles<keyof typeof styles>) {
        super(params);

        this.state = {
            info: defaultContactInfo
        };

    }

    componentDidMount() {
        this.props.connection.contactInfo(
            this.props.message.person.contactid, (info: ContactInfo) => {
                this.setState({ info: info });
            }
        );
    }

    render() {

        var content: JSX.Element = <span />;

        const data = this.props.message.data;

        const sms = data as SmsData;
        if (sms !== undefined) {
            content = <Typography type="body1"><Emojify>{sms.message}</Emojify></Typography>;
        }

        const mms = data as MmsData;
        if (mms !== undefined) {
            if (mms.type === 'IMAGE') {
                content = (
                    <FetchedImage
                        connection={this.props.connection}
                        image={mms.data}
                        height={300}
                        type="img"
                    />
                );
            } else if (mms.type === 'TEXT') {
                content = <Typography type="body1"><Emojify>{mms.data}</Emojify></Typography>;
            }
        }

        return (
            <Paper
                className={this.props.classes.root}
                elevation={1}
            >
                <PersonAvatar
                    phoneNumber={this.props.message.person.number}
                    className={this.props.classes.avatar}
                    info={this.state.info}
                    connection={this.props.connection}
                />
                <div className={this.props.classes.content}>
                    {content}
                </div>
            </Paper>);
    }

}

export default withStyles(styles)<MessageAreaParams>(MessageArea);
