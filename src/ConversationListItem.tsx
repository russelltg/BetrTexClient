import * as React from 'react';
import { WsConnection } from './WsConnection';
import { ConversationData } from './Conversation';
import { ListItem, ListItemText } from 'material-ui';
import PersonAvatar from './PersonAvatar';

interface ConversationListItemProps {
    connection: WsConnection;
    data: ConversationData;
    onSelect: (threadID: number) => void;
}

interface ConversationListItemState {
    names: string[];
    images: string[];
}

export default class ConversationListItem extends
    React.Component<ConversationListItemProps, ConversationListItemState> {

    constructor(props: ConversationListItemProps) {
        super(props);

        this.state = {
            names: this.props.data.people.map(num => {
                return num.number;
            }),
            images: new Array<string>(this.props.data.people.length)
        };

        this.props.data.people.forEach((person, id) => {
            this.props.connection.contactInfo(person.contactid, info => {
                var names = this.state.names.slice();
                var images = this.state.images.slice();

                names[id] = info.name;
                images[id] = info.b64_image;

                this.setState({names: names, images: images});

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
        this.state.names.forEach((element, i) => {
            names += (element === '' ? this.props.data.people[i].number : element) + ', ';
        });
        names = names.substr(0, Math.max(0, names.length - 2)); // remove last ', '

        return (
            <ListItem button={true} onClick={this.onClickCallback}>
                <PersonAvatar info={{name: this.state.names[0], b64_image: this.state.images[0]}} />
                <ListItemText
                    primary={names}
                    secondary={this.props   .data.snippet}
                />
            </ListItem>
        );
    }

}
