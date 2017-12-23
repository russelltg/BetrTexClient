import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, Select, MenuItem } from 'material-ui';
import DialogActions from 'material-ui/Dialog/DialogActions';
import Button from 'material-ui/Button/Button';

interface OptionsProps {
    open: boolean;
    onChange: (value: string) => void;
    onRequestClose: () => void;
}

export default (props: OptionsProps) => {
    return (
        <Dialog
            open={props.open}
        >
            <DialogTitle>
                Options
            </DialogTitle>
            <DialogContent>
                <Select
                    value="light"
                    onChange={event => {
                        props.onChange(event.target.value);
                    }}
                >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onRequestClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
