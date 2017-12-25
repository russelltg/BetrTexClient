import * as React from 'react';

import { WsConnection } from './WsConnection';
import { ConversationsList } from './ConversationsList';
import { ConversationArea } from './ConversationArea';
import { ConversationData } from './Conversation';
import Options from './Options';
import {
  AppBar, Typography, Toolbar, Drawer, Dialog,
  DialogTitle, TextField, Stepper, StepLabel, Button, Step,
  DialogContent, withStyles, CircularProgress, MenuItem, createMuiTheme
} from 'material-ui';
import WarningIcon from 'material-ui-icons/Warning';
import { WithStyles } from 'material-ui/styles/withStyles';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Menu from 'material-ui/Menu/Menu';
import { MouseEvent } from 'react';
import { Theme, MuiThemeProvider, StyleRules } from 'material-ui/styles';

const drawerWidth = '25%';

enum currentState {
  enteringAddress,
  connecting,
  authenticating,
  using,
}

interface AppState {
  conversations: ConversationData[];
  currentThread: number;
  state: currentState;
  failed: boolean;
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
  progress: {
    verticalAlign: 'middle',
    right: 0,
    position: 'relative'
  } as React.CSSProperties
};

type Props = WithStyles<keyof typeof styles>;

class App extends React.Component<Props, AppState> {

  connection: WsConnection;
  areas: Map<number, JSX.Element>;

  ip: string = '10.0.0.9';
  port: number = 14563;

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
      state: currentState.enteringAddress,
      failed: false,
      theme: this.lightTheme,
      optionsOpen: false,
    };

  }

  onSelectConversation = (threadID: number) => {
    const a = this.state.currentThread;

    this.setState({ currentThread: threadID });

    return a;
  }

  onIpChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.ip = evt.target.value;
  }

  onPortChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.port = +evt.target.value;
  }

  onConnectClick = () => {

    this.connection = new WsConnection(this.ip, this.port, (connection: boolean) => {
      if (this.state.state === currentState.connecting) {
        if (connection === true) {
          this.setState({ state: currentState.authenticating });
        } else {
          this.setState({ failed: true });
        }
      }
    }, (state: boolean) => {
      if (this.state.state === currentState.authenticating) {
        if (state === true) {
          this.setState({ state: currentState.using });

          // fetch the conversations
          this.connection.listConversations((datas: ConversationData[]) => {
            this.setState({ conversations: datas });
          });

        } else {
          this.setState({ failed: true });
        }
      }
    });

    this.setState({ state: currentState.connecting });
  }

  onRestartConnect = () => {
    this.setState({ failed: false, state: currentState.enteringAddress });
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

  conversationArea = (threadID: number) => {
    // if (this.areas.has(threadID)) {
    //   return this.areas.get(threadID);
    // }

    // get conversation data for state.currentThread
    var convData: ConversationData | undefined;
    this.state.conversations.forEach(element => {
      if (element.threadid === threadID) {
        convData = element;
        return;
      }
    });

    const conversationArea = convData ?
      (
        <div className={this.props.classes.area}>
          <ConversationArea
            connection={this.connection}
            conversation={convData}
          />
        </div>
      ) : <></>;

    this.areas.set(threadID, conversationArea);

    return conversationArea;

  }

  render() {

    const conversationArea =
      this.state.state === currentState.using ? this.conversationArea(this.state.currentThread) : <></>;

    var stepperContent = <></>;
    switch (this.state.state) {
      case currentState.enteringAddress: {
        stepperContent = (
          <div>
            <TextField
              autoFocus={true}
              margin="dense"
              label="IP"
              fullWidth={true}
              defaultValue={this.ip}
              onChange={this.onIpChange}
            />
            <TextField
              margin="dense"
              label="Port"
              fullWidth={true}
              defaultValue={this.port.toString()}
              onChange={this.onPortChange}
            />
            <Button onClick={this.onConnectClick}>
              Connect
            </Button>
          </div>
        );
        break;
      }
      case currentState.connecting: {
        stepperContent = (
          <div>
            Connecting to {this.ip}:{this.port}
            {this.state.failed ?
              <>
              <WarningIcon color="red" />
              <Button onClick={this.onRestartConnect}>Restart</Button>
              </>
              :
              <CircularProgress className={this.props.classes.progress} />
            }
          </div>
        );
        break;
      }
      case currentState.authenticating: {
        stepperContent = (
          <div>
            Waiting for authentication. Go to your device and select <strong>Accept</strong>
            {this.state.failed ?
              <>
              <WarningIcon color="red" />
              <Button onClick={this.onRestartConnect}>Restart</Button>
              </> :
              <CircularProgress className={this.props.classes.progress} />
            }
          </div>
        );
        break;
      }
      default: break;
    }

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
        <Dialog open={this.state.state !== currentState.using}>
          <DialogTitle>
            Acquiring connection...
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={this.state.state}>
              <Step key={currentState.enteringAddress}>
                <StepLabel>Enter IP and port</StepLabel>
              </Step>
              <Step key={currentState.connecting} >
                <StepLabel>Connect</StepLabel>
              </Step>
              <Step key={currentState.authenticating}>
                <StepLabel>Authenticate</StepLabel>
              </Step>
            </Stepper>
            {stepperContent}
          </DialogContent>
        </Dialog>
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
          {this.state.state === currentState.using ? <ConversationsList
            connection={this.connection}
            conversations={this.state.conversations}
            onSelect={this.onSelectConversation}
          /> : <></>
          }
        </Drawer>
        {conversationArea}
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)<{}>(App);
