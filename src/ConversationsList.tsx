import * as React from 'react';
import { List, Divider } from 'material-ui';
import { ConversationData } from './Conversation';
import { WsConnection } from './WsConnection';
import ConversationListItem from './ConversationListItem';

interface ConversationsListProps {
    conversations: ConversationData[];
    connection: WsConnection;
    onSelect: (threadID: number) => void;
}

class ConversationsList extends React.Component<ConversationsListProps, {}> {

    constructor(props: ConversationsListProps) {
        super(props);

        this.state = { name: '' };

    }

    render() {
        return (
            <List style={{ overflowX: 'hidden' }}>
                {this.props.conversations.map((info: ConversationData, i: number) => {
                    return (
                        <span key={i}>
                            <ConversationListItem
                                onSelect={this.props.onSelect}
                                connection={this.props.connection}
                                data={info}
                            />
                            <Divider light={true} />
                        </span>
                    );
                })}
            </List>
        );
    }

}

export { ConversationsList };
