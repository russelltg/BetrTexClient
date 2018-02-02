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
  image: string;
  image_mime: string;
  messages: Message[];
  loaded: boolean;
}

type StyleProps = WithStyles<'messageArea' | 'form' | 'root'>;

const ConversationArea = withStyles(styles, {name: 'ConversationArea'})<ConversationAreaProps>(
  class extends React.Component<ConversationAreaProps & StyleProps, ConversationAreaState> {

    scrollingdiv: HTMLDivElement;
    textAreaDiv: HTMLDivElement;

    constructor(props: ConversationAreaProps & StyleProps) {
      super(props);

      this.state = { message: '', image: '', image_mime: '', messages: [], loaded: false };

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

      const numbers = this.props.conversation.people.map((it) => {
        return it.number;
      });

      if (this.state.message !== '') {
        this.props.connection.sendText({
          threadid: this.props.conversation.threadid,
          message: {
            message: this.state.message
          },
          numbers
        });
      }

      if (this.state.image !== '') {
        this.props.connection.sendText({
          threadid: this.props.conversation.threadid,
          message: {
            base64_image: this.state.image,
            mime_type: this.state.image_mime
          },
          numbers
        });
      }

      // clear box
      this.setState({ message: '', image: '' });

    }

    onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData.items;

      for (var index = 0; index < items.length; index++) {
        const item = items[index];

        if (item.kind === 'file' && (
          item.type === 'image/png' || 
          item.type === 'image/jpeg' || 
          item.type === 'image/jpg' || 
          item.type === 'image/bmp'
        )) {

          const blob = item.getAsFile();
          if (blob === null) {
            continue;
          }
          const reader = new FileReader();

          reader.onload = (ev: Event) => {
            const data = reader.result as string;
            
            const base64Data = btoa(data);

            this.setState({'image': base64Data, image_mime: item.type});
          };

          reader.readAsBinaryString(blob as File);
        }
      }
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
              <CircularProgress /> : <div />}

            {this.state.messages.map((message: Message, i: number) => (
              <MessageArea
                key={this.props.conversation.threadid + '.' + i}
                message={message}
                connection={this.props.connection}
              />
            ))}
          </div>
          <div className={this.props.classes.form} ref={e1 => { if (e1) { this.textAreaDiv = e1; } }} >
            <FormControl fullWidth={true}>
              {this.state.image !== '' && 
                <img 
                  src={'data:' + this.state.image_mime + ';base64, ' + this.state.image} 
                  width="400" 
                />}
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
