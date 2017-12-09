import * as React from 'react';
import WsConnection from './WsConnection';
import ConversationData from './Conversation';
import { ListItem, Avatar, ListItemText } from 'material-ui';
import ContactInfo from './ContactInfo';

interface ConversationListItemProps {
    connection: WsConnection;
    data: ConversationData;
    onSelect: (threadID: number) => void;
}

interface ConversationListItemState {
    infos: ContactInfo[];
}

export default class ConversationListItem extends 
    React.Component<ConversationListItemProps, ConversationListItemState> {

    constructor(props: ConversationListItemProps) {
        super(props);

        this.state = {infos: []};

        for (const num of this.props.data.addresses) {
            this.props.connection.contactInfo(num, (info: ContactInfo) => {
                this.setState({infos: [...this.state.infos, info]});
            });
        }

    }

    initials = (name: string) => {
        if (name.length === 0) {
            return '';
        }

        var initals = name[0];

        var idx = name.indexOf(' ');
        if (idx !== -1 && idx + 1 < name.length) {
            initals += name[idx + 1];
        }
        return initals;
    }

    avatar = (info: ContactInfo) => {
        if (info.b64_image !== '') {
            return <Avatar alt={this.initials(info.name)} src={info.b64_image} />;
        } else {
            return <Avatar>{this.initials(info.name)}</Avatar>;
        }
    }

    onClickCallback = () => {
        this.props.onSelect(this.props.data.threadid);
    }

    render() {

        // TODO: figure out what avatar to show when multiple
        var avatarElement = <div />;

        if (this.state.infos.length !== 0) {
            avatarElement = this.avatar(this.state.infos[0]);
        }

        // get comma separated names
        var names = '';
        this.state.infos.forEach(element => {
            names += (element.name === '' ? element.number : element.name) + ', ';
        });
        names = names.substr(0, names.length - 2); // remove last ', '

        return (
            <ListItem button={true} onClick={this.onClickCallback}>
                {avatarElement}
                <ListItemText 
                    primary={names} 
                    secondary={this.props.data.snippet}
                />
            </ListItem>
        );
    }

}
