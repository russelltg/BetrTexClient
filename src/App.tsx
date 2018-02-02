import * as React from 'react';

import { WsConnection } from './WsConnection';
import { ConversationsList } from './ConversationsList';
import { ConversationArea } from './ConversationArea';
import { ConnectDialog } from './ConnectDialog';
import { ConversationData } from './Conversation';
import Options from './Options';
import {
  AppBar, Typography, Toolbar, Drawer, 
  withStyles, MenuItem, createMuiTheme
} from 'material-ui';
import { WithStyles } from 'material-ui/styles/withStyles';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Menu from 'material-ui/Menu/Menu';
import { MouseEvent } from 'react';
import { Theme, MuiThemeProvider, StyleRules } from 'material-ui/styles';

const drawerWidth = '400px';

interface AppState {
  conversations: ConversationData[];
  currentThread: number;
  anchorEl?: HTMLElement;
  theme: Theme;
  optionsOpen: boolean;
}

const styles: StyleRules = {
  drawerPaper: {
    height: 'calc(100% - 64px)',
    width: drawerWidth,
    top: 64
  },
  area: {
    position: 'absolute',
    width: 'calc(100% - ' + drawerWidth + ')',
    height: 'calc(100% - 64px)',
    left: drawerWidth
  },
};

type Props = WithStyles<keyof typeof styles>;

class App extends React.Component<Props, AppState> {

  connection: WsConnection;
  areas: Map<number, JSX.Element>;

  darkTheme: Theme;
  lightTheme: Theme;

  constructor(props: Props) {
    super(props);

    this.areas = new Map<number, JSX.Element>();

    this.darkTheme = createMuiTheme({
      palette: {
        type: 'dark'
      }
    });

    this.lightTheme = createMuiTheme({
      palette: {
        type: 'light'
      }
    });
    // initialzie state
    this.state = {
      conversations: [],
      currentThread: -1,
      theme: this.lightTheme,
      optionsOpen: false,
    };

  }

  onConnected = async (conn: WsConnection) => {
    this.connection = conn;

    // fetch the conversations
    this.setState({ conversations: await this.connection.listConversations() });
  }

  onSelectConversation = (threadID: number) => {
    const a = this.state.currentThread;

    this.setState({ currentThread: threadID });

    return a;
  }

  onMenuClick = (action: MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: action.target as HTMLElement });
  }

  onClose = () => {
    this.setState({ anchorEl: undefined });
  }

  onThemeChange = (name: string) => {
    this.setState({ theme: name === 'dark' ? this.darkTheme : this.lightTheme });
  }

  onRequestOptionsClose = () => {
    this.setState({ optionsOpen: false });
  }

  onRequestOptionsOpen = () => {
    this.setState({ optionsOpen: true });
  }

  render() {

    var convData: ConversationData | undefined;
    this.state.conversations.forEach(element => {
      if (element.threadid === this.state.currentThread) {
        convData = element;
        return;
      }
    });
    
    const conversation = convData === undefined ? <></> : (
      <div className={this.props.classes.area}>
        <ConversationArea
          connection={this.connection}
          conversation={convData}
        />
      </div>
    );

    const open = this.state.anchorEl !== undefined;

    return (
      <MuiThemeProvider
        theme={this.state.theme}
      >
        <Options
          open={this.state.optionsOpen}
          onRequestClose={this.onRequestOptionsClose}
          onChange={this.onThemeChange}
        />
        <ConnectDialog connected={this.onConnected}/>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography type="title" color="inherit">
              Bridge
            </Typography>
            <IconButton
              onClick={this.onMenuClick}
              aria-owns={open ? 'menu-appbar' : null}
              color="contrast"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={this.state.anchorEl}
              open={open}
              onRequestClose={this.onClose}
            >
              <MenuItem onClick={this.onRequestOptionsOpen}>
                Options
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer type="permanent" classes={{ paper: this.props.classes.drawerPaper }}>
          {this.connection !== null ? <ConversationsList
            connection={this.connection}
            conversations={this.state.conversations}
            onSelect={this.onSelectConversation}
          /> : <></>
          }
        </Drawer>
        {conversation}
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)<{}>(App);
