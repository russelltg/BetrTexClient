import * as React from 'react';
import {
  TextField, Button, CircularProgress, WithStyles,
  Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel
} from 'material-ui';
import { WsConnection } from './WsConnection';
import WarningIcon from 'material-ui-icons/Warning';
import { StyleRules, withStyles } from 'material-ui/styles';

const styles: StyleRules = {
  progress: {
    verticalAlign: 'middle',
    right: 0,
    position: 'relative'
  }
};

interface PassedProps {
  connected: (conn: WsConnection) => void;
}

interface State {
  state: currentState;
  failed: boolean;
}

enum currentState {
  enteringAddress,
  connecting,
  authenticating,
  using,
}

type Props = PassedProps & WithStyles<keyof typeof styles>;

const ConnectDialog = withStyles(styles, { name: 'ConnectDialog' })<PassedProps>(
  class ConnectDialogImpl extends React.Component<Props, State> {

    ip: string = '10.0.0.9';
    port: number = 14563;
    connection: WsConnection;

    constructor(props: Props) {
      super(props);

      this.state = {
        state: currentState.enteringAddress,
        failed: false,
      };
    }

    onIpChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      this.ip = evt.target.value;
    }

    onPortChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      this.port = +evt.target.value;
    }

    onConnectClick = () => {

      this.connection = new WsConnection(this.ip, this.port, true, (connection: boolean) => {
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
            this.props.connected(this.connection);
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

    render() {

      const failedMessage: JSX.Element = (
        <div>
          <WarningIcon color="red" />
          <Button onClick={this.onRestartConnect}>Restart</Button>
        </div>
      );

      var stepContent = <></>;
      switch (this.state.state) {
        case currentState.enteringAddress: {
          stepContent = (
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
          stepContent = (
            <div>
              Connecting to {this.ip}:{this.port}
              {this.state.failed ? failedMessage :
                <CircularProgress className={this.props.classes.progress} />}
            </div>
          );
          break;
        }
        case currentState.authenticating: {
          stepContent = (
            <div>
              Waiting for authentication. Go to your device and select <strong>Accept</strong>
              {this.state.failed ? failedMessage :
                <CircularProgress className={this.props.classes.progress} />}
            </div>
          );
          break;
        }
        default: {
          stepContent = <div>Internal error: weird connect state</div>;
        }
      }
      return (
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
            {stepContent}
          </DialogContent>
        </Dialog>
      );
    }
  });

export { ConnectDialog };
