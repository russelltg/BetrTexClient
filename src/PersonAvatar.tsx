import * as React from 'react';
import { ContactInfo } from './ContactInfo';
import { Avatar } from 'material-ui';
import { Person } from 'material-ui-icons';
import FetchedImage from './FetchedImage';
import { WsConnection } from './WsConnection';
import {
    amber, blue, cyan, deepOrange, deepPurple,
    green, indigo, lightBlue, lightGreen, lime, orange, pink,
    purple, red, teal, yellow
} from 'material-ui/colors';
import stringHash from 'string-hash';

const colors = [
    amber, blue, cyan, deepOrange, deepPurple,
    green, indigo, lightBlue, lightGreen, lime, orange, pink,
    purple, red, teal, yellow
];

const generatePersonColor = (phoneNumber: string) => {
    return colors[stringHash(phoneNumber) % colors.length][500];
};

interface Props {
    info: ContactInfo;
    phoneNumber: string; // to base hash off of
    connection: WsConnection;
    className?: string;
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
    if (props.info.image !== '') {
        return (
            <FetchedImage
                className={props.className}
                alt={initials(props.info.name)}
                connection={props.connection}
                image={props.info.image}
                type="avatar"
            />
        );
    } else if (props.info.name !== '') {
        return (
            <Avatar
                className={props.className}
                style={{ backgroundColor: generatePersonColor(props.phoneNumber) }}
            >
                {initials(props.info.name)}
            </Avatar>
        );
    } else {
        return (
            <Avatar
                className={props.className}
                style={{ backgroundColor: generatePersonColor(props.phoneNumber) }}
            >
                <Person />
            </Avatar>
        );
    }
};
