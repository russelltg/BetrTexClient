import * as React from 'react';
import { ConversationData } from './Conversation';
import MessageArea from './MessageArea';
import { Message } from './Message';
import { WsConnection } from './WsConnection';
import { Input, IconButton, Divider, FormControl, withStyles } from 'material-ui';
import SendIcon from 'material-ui-icons/Send';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import { StyleRulesCallback, WithStyles } from 'material-ui/styles/withStyles';
import { Theme, StyleRules } from 'material-ui/styles';

const styles: StyleRulesCallback = (theme: Theme): StyleRules => {
    return {
        messageArea: {
            backgroundColor: theme.palette.background.contentFrame,
            boxSizing: 'border-box',
            paddingLeft: 20,
            overflowY: 'scroll',
            position: 'absolute',
            height: 'calc(100% - 50px)',
            width: 'calc(100%)',
        },
        form: {
            backgroundColor: theme.palette.background.default,
            position: 'absolute',
            bottom: 0,
            boxSizing: 'border-box',
            paddingLeft: 20,
            paddingBottom: 5
        }
    };
};

interface ConversationAreaProps {
    conversation: ConversationData;
    connection: WsConnection;
}

interface ConversationAreaState {
    message: string;
    messages: Message[];
    loaded: boolean;
}
type StyleProps = WithStyles<'messageArea' | 'form'>;

const ConversationArea = withStyles(styles)<ConversationAreaProps>(
    class extends React.Component<ConversationAreaProps & StyleProps, ConversationAreaState> {

        scrollingdiv: HTMLDivElement;

        constructor(props: ConversationAreaProps & StyleProps) {
            super(props);

            this.state = { message: '', messages: [], loaded: false };

        }

        componentWillMount() {

            this.props.connection.getMessages(
                this.props.conversation.threadid,
                Math.max(0, this.props.conversation.messagecount - 40), // get last 10 messages
                this.props.conversation.messagecount,
                (messages: Message[]) => {
                    this.setState({ messages: messages, loaded: true });

                    this.scrollToBottom();
                });

            this.props.connection.registerThreadID(this.props.conversation.threadid, (message: Message) => {
                this.setState({ messages: [...this.state.messages, message] });

                this.scrollToBottom();
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

        scrollToBottom() {
            this.scrollingdiv.scroll({ top: this.scrollingdiv.scrollHeight });
        }

        componentDidMount() {

            // scroll to bottom
            this.scrollToBottom();

            // this.scrollingdiv.addEventListener('scroll', () => {

            // })
        }

        render() {

            // tslint:disable:jsx-wrap-multiline
            return (
                <>
                {!this.state.loaded ?
                    <CircularProgress /> : <></>}
                <div
                    className={this.props.classes.messageArea}
                    ref={(e1) => { if (e1) { this.scrollingdiv = e1; } }}
                >
                    {this.state.messages.map((message: Message, i: number) => (
                        <div key={i}>
                            <MessageArea
                                message={message}
                                connection={this.props.connection}
                            />
                        </div>
                    ))}
                </div>
                <Divider light={true} />
                <FormControl
                    fullWidth={true}
                    className={this.props.classes.form}
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
                </>
            );
            // tslint:enable:jsx-wrap-multiline
        }
    }
);

export { ConversationArea };
