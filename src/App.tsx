import * as React from 'react';

import WsConnection from './WsConnection';
import Conversation from './Conversation';
import ConversationArea from './ConversationArea';

interface AppState {
  conversations: Conversation[];
}

class App extends React.Component<{}, AppState> {

  connection: WsConnection;

  constructor(props: {}) {
    super(props);

    this.state = {conversations: []};
    this.connection = new WsConnection('10.0.0.9', 9834, (message: string, phoneNumber: string) => {
        // find in conversations
        var inserted = false;

        var conversations = this.state.conversations.slice();
        conversations.forEach(value => {
            if (value.phoneNumber === phoneNumber) {
              inserted = true;
              value.messages.push({message: message, time: new Date()});
            }
        });

        if (inserted === false) {
          conversations.push({phoneNumber: phoneNumber, messages: [{message: message, time: new Date()}]});
        }
        this.setState({conversations: conversations});
    });
  }

  render() {

    return (
      <div className="appFrame">
        <h1>BetrTxt</h1>
        {this.state.conversations.map((conversation: Conversation, i: number) => (
          <ConversationArea key={i} conversation={conversation} connection={this.connection} />
        ))}
      </div>
    );
  }
}

export default App;
