import * as React from 'react';
import { WsConnection } from './WsConnection';
import { ConversationData } from './Conversation';
import { ListItem, ListItemText } from 'material-ui';
import PersonAvatar from './PersonAvatar';
import { ContactInfo } from './ContactInfo';
import { defaultPendingImage } from './PendingImage';

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

        this.state = {
            infos: this.props.data.people.map(num => {
                return {
                    name: num.number,
                    image: defaultPendingImage
                };
            })
        };
    }

    componentDidMount() {

        this.props.data.people.forEach((person, id) => {
            this.props.connection.contactInfo(person.contactid, info => {
                var infos = this.state.infos.slice();

                infos[id] = info;

                this.setState({ infos: infos });

            });
        });
    }

    onClickCallback = () => {
        this.props.onSelect(this.props.data.threadid);
    }

    render() {

        // TODO: figure out what avatar to show when multiple
        // get comma separated names
        var names = '';
        this.state.infos.forEach((info, i) => {
            names += (info.name === '' ? this.props.data.people[i].number : info.name) + ', ';
        });
        names = names.substr(0, Math.max(0, names.length - 2)); // remove last ', '

        return (
            <ListItem button={true} onClick={this.onClickCallback}>
                <PersonAvatar
                    phoneNumber={this.props.data.people[0].number}
                    info={{ name: this.state.infos[0].name, image: this.state.infos[0].image }}
                    connection={this.props.connection}
                />
                <ListItemText
                    primary={names}
                    secondary={this.props.data.snippet}
                />
            </ListItem>
        );
    }

}
