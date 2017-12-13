import * as React from 'react';
import { ContactInfo } from './ContactInfo';
import { Avatar } from 'material-ui';
import { Person } from 'material-ui-icons';

interface Props {
    info: ContactInfo;
}

const initials = (name: string) => {
    if (name.length === 0) {
        return '';
    }

    var initals = name[0];

    var idx = name.indexOf(' ');
    if (idx !== -1 && idx + 1 < name.length) {
        initals += name[idx + 1];
    }
    return initals;
};

export default (props: Props) => {
    if (props.info.b64_image !== '') {
        return <Avatar alt={initials(props.info.name)} src={props.info.b64_image} />;
    } else if (props.info.name !== '') {
        return <Avatar>{initials(props.info.name)}</Avatar>;
    } else {
        return <Avatar><Person /></Avatar>;
    }
};
