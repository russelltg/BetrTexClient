import * as React from 'react';
import { Message, TextMessageData, ImageMessageData } from './Message';
import { ContactInfo, defaultContactInfo } from './ContactInfo';
import { WsConnection } from './WsConnection';
import PersonAvatar from './PersonAvatar';
import FetchedImage from './FetchedImage';
import { WithStyles, withStyles, Paper } from 'material-ui';
import Emojify from 'react-emojione';
import Typography from 'material-ui/Typography/Typography';
import { StyleRulesCallback, Theme, StyleRules } from 'material-ui/styles';

interface Props {
  message: Message;
  connection: WsConnection;
}

interface State {
  info: ContactInfo;
  showDate: boolean;
}

const height = 32;
const maxwidth = 400;
const spacing = 6;
const avatarMargin = 6;

const styles: StyleRulesCallback = (theme: Theme): StyleRules => {
  return {
    root: {
      display: 'flex',
      alignItems: 'center',
    } as React.CSSProperties,
    paper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: height / 2 + 4 + avatarMargin / 2,
      maxWidth: maxwidth,
      width: 'fit-content',
      marginBottom: spacing,
      padding: avatarMargin,
      paddingRight: 10,
      overflowWrap: 'break-word',
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
      whiteSpace: 'pre-wrap',
      overflowX: 'hidden',
    } as React.CSSProperties,
    date: {
      fontSize: 8,
      marginLeft: 5,
      color: theme.palette.text.secondary,
    } as React.CSSProperties,
  };
};

type AllProps = Props & WithStyles<'root' | 'paper' | 'avatar' | 'content' | 'date'>;

class MessageArea extends React.Component<AllProps, State> {

  dateString: string;

  constructor(params: AllProps) {
    super(params);

    this.state = {
      info: defaultContactInfo,
      showDate: false,
    };

    const date = new Date(this.props.message.timestamp);
    this.dateString =
      `${date.getHours()}:${date.getMinutes()} 
        ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(2)}`;

  }

  async componentDidMount() {
    const info = await this.props.connection.contactInfo(this.props.message.person.contactid);
    this.setState({ info });
  }

  onMouseOver = () => {
    this.setState({ showDate: true });
  }
  onMouseOut = () => {
    this.setState({ showDate: false });
  }

  render() {

    var content: JSX.Element = <span />;

    const data = this.props.message.data;

    switch (data.type) {
      case 'text':
        content = <Typography type="body1"><Emojify>{(data as TextMessageData).message}</Emojify></Typography>;

        break;
      case 'image':
        content = (
          <FetchedImage
            connection={this.props.connection}
            image={(data as ImageMessageData).image}
            height={300}
            type="img"
          />
        );
        break;
      default:
        break;
    }

    return (
      <div className={this.props.classes.root}>
        <Paper
          className={this.props.classes.paper}
          elevation={1}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
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
        </Paper>
        {this.state.showDate &&
          <div className={this.props.classes.date}>{this.dateString}</div>}
      </div>

    );
  }

}

export default withStyles(styles)<Props>(MessageArea);
