import * as React from 'react';

import { WsConnection } from './WsConnection';
import { ConversationsList } from './ConversationsList';
import { ConversationArea } from './ConversationArea';
import { ConversationData } from './Conversation';
import { AppBar, Typography, Toolbar, Drawer, Dialog, DialogTitle, TextField } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';
import DialogContent from 'material-ui/Dialog/DialogContent';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import Stepper from 'material-ui/Stepper/Stepper';
import StepLabel from 'material-ui/Stepper/StepLabel';
import Step from 'material-ui/Stepper/Step';
import Button from 'material-ui/Button/Button';
import WarningIcon from 'material-ui-icons/Warning';

const drawerWidth = 300;

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
}

const styles = {
  drawerPaper: {
    height: 'calc(100% - 64px)',
    width: drawerWidth,
    top: 64
  }
};

// tslint:disable-next-line:no-any
@(withStyles as any)(styles)
// tslint:disable-next-line:no-any
export default class App extends React.Component<any, AppState> {

  connection: WsConnection;
  areas: Map<number, JSX.Element>;

  ip: string = '10.0.0.9';
  port: number = 14563;

  // tslint:disable-next-line:no-any
  constructor(props: any) {
    super(props);

    this.areas = new Map<number, JSX.Element>();

    // initialzie state
    this.state = {
      conversations: [],
      currentThread: -1,
      state: currentState.enteringAddress,
      failed: false
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

    const areaStyles = {
      position: 'absolute',
      width: 'calc(100% - ' + drawerWidth + 'px)',
      height: 'calc(100% - 64px)',
      left: drawerWidth
      // tslint:disable-next-line:no-any
    } as any as React.CSSProperties;

    const conversationArea = convData ?
      <ConversationArea style={areaStyles} connection={this.connection} conversation={convData} /> : <div />;

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
              defaultValue="10.0.0.9"
              onChange={this.onIpChange}
            />
            <TextField
              margin="dense"
              label="Port"
              fullWidth={true}
              defaultValue="14563"
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
              <WarningIcon color="red" />
              :
              <CircularProgress style={{ alignContent: 'center' }} />
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
              <WarningIcon color="red" /> :
              <CircularProgress />
            }
          </div>
        );
        break;
      }
      default: break;
    }

    // TODO: there is currently a bug in tslint https://github.com/palantir/tslint-react/pull/130
    // tslint:disable:jsx-wrap-multiline
    return (<>
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
              <StepLabel>Authenticating</StepLabel>
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
      </>);
    // tslint:enable:jsx-wrap-multiline
  }
}
