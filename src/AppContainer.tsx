import * as React from 'react';

import App from './App';
import { Dialog, DialogTitle, TextField, DialogContent, DialogContentText, DialogActions, Button } from 'material-ui';

interface State {
    ip: string;
    port: number;

}

class AppContainer extends React.Component<{}, State> {

    ip: string;
    port: number;

    constructor(props: {}) {
        super(props);

        this.state = {
            ip: '',
            port: -1
        };
    }

    accept = () => {
        this.setState({
            ip: this.ip,
            port: this.port
        });
    }

    onIpChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.ip = evt.target.value;
    }

    onPortChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.port = +evt.target.value;
    }

    render() {

        var app: JSX.Element;

        if (this.state.ip !== '') {
            app = <App ip={this.state.ip} port={this.state.port} />;
        } else {
            app = <div />;
        }

        return (
            <div>
                {app}
                <Dialog open={this.state.ip === '' && this.state.port === -1}>
                    <DialogTitle>
                        Configure Connection
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>Enter Port and IP of phone as shown on app</DialogContentText>
                        <TextField
                            autoFocus={true}
                            margin="dense"
                            label="IP"
                            fullWidth={true}
                            onChange={this.onIpChange}
                        />
                        <TextField
                            margin="dense"
                            label="Port"
                            fullWidth={true}
                            onChange={this.onPortChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.accept}
                        >
                            Connect
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

}

export default AppContainer;
