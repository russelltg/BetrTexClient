import * as React from 'react';
import { ConversationData } from './Conversation';
import MessageArea from './MessageArea';
import { Message } from './Message';
import { WsConnection } from './WsConnection';
import { IconButton, withStyles, Input } from 'material-ui';
import SendIcon from 'material-ui-icons/Send';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import { StyleRulesCallback, WithStyles } from 'material-ui/styles/withStyles';
import { Theme, StyleRules } from 'material-ui/styles';
import FormControl from 'material-ui/Form/FormControl';
import { ClipboardEvent } from 'react';

const styles: StyleRulesCallback = (theme: Theme): StyleRules => {
    return {
        root: {
            display: 'flex'
        },
        messageArea: {
            position: 'absolute',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.contentFrame,
            paddingLeft: 20,
            overflowY: 'scroll',
            height: '100%',
            width: '100%',
        },
        form: {
            position: 'absolute',
            boxSizing: 'border-box',
            width: '100%',
            backgroundColor: theme.palette.background.default,
            bottom: 0,
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
type StyleProps = WithStyles<'messageArea' | 'form' | 'root'>;

const ConversationArea = withStyles(styles)<ConversationAreaProps>(
    class extends React.Component<ConversationAreaProps & StyleProps, ConversationAreaState> {

        scrollingdiv: HTMLDivElement;
        textAreaDiv: HTMLDivElement;

        constructor(props: ConversationAreaProps & StyleProps) {
            super(props);

            this.state = { message: '', messages: [], loaded: false };

        }

        componentWillMount() {

            this.props.connection.getMessages(
                this.props.conversation.threadid,
                Math.max(0, this.props.conversation.messagecount - 20), // get last 10 messages
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

            this.props.connection.sendText({
                threadid: this.props.conversation.threadid,
                message: {
                    message: this.state.message
                },
                numbers: this.props.conversation.people.map((it) => {
                    return it.number;
                }),
            });
        }

        onPaste = (e: ClipboardEvent<any>) => {
            e.clipboardData.getData('image');
        }

        handleTextChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
            // the height could've changed
            this.scrollingdiv.style.height = 'calc(100% - ' + this.textAreaDiv.clientHeight + 'px)';

            this.setState({ message: evt.target.value });
        }

        handleKeyUp = (evt: React.KeyboardEvent<HTMLInputElement>) => {
            if (evt.key === 'Enter' && !evt.ctrlKey && !evt.shiftKey && this.state.message !== '') {
                this.sendMessage();
            }
        }

        scrollToBottom() {
            this.scrollingdiv.scroll({ top: this.scrollingdiv.scrollHeight });
        }

        componentDidMount() {

            // scroll to bottom
            this.scrollToBottom();

            this.scrollingdiv.style.height = 'calc(100% - ' + this.textAreaDiv.clientHeight + 'px)';
        }

        render() {
            return (
                <div className={this.props.classes.root}>
                    <div
                        className={this.props.classes.messageArea}
                        ref={(e1) => { if (e1) { this.scrollingdiv = e1; } }}
                    >
                        {!this.state.loaded ?
                            <CircularProgress /> : <></>}

                        {this.state.messages.map((message: Message, i: number) => (
                            <div key={i}>
                                <MessageArea
                                    message={message}
                                    connection={this.props.connection}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={this.props.classes.form} ref={e1 => { if (e1) { this.textAreaDiv = e1; } }} >
                        <FormControl fullWidth={true}>
                            <Input
                                multiline={true}
                                onKeyUp={this.handleKeyUp}
                                placeholder="Type a message..."
                                onChange={this.handleTextChange}
                                onPaste={this.onPaste}
                                endAdornment={
                                    <IconButton onClick={this.sendMessage}>
                                        <SendIcon />
                                    </IconButton>}
                            />
                        </FormControl>
                    </div>
                </div>
            );
        }
    }
);

export { ConversationArea };
