import * as React from 'react';

import WsConnection from './WsConnection';
// import Conversation from './Conversation';
import ConversationArea from './ConversationArea';
import Message from './Message';
import ConversationData from './Conversation';

interface AppState {
  conversations: ConversationData[];
}

class App extends React.Component<{}, AppState> {

  connection: WsConnection;

  constructor(props: {}) {
    super(props);

    this.connection = new WsConnection('10.0.0.9', 14563, (message: Message) => { return {}; });

    // fetch the conversations
    this.connection.listConversations((datas: ConversationData[]) => {
      this.setState({conversations: datas});
    });

    this.state = {conversations: []};

  }

  render() {

    return (
      <div className="appFrame">
        <h1>BetrTxt</h1>
        {this.state.conversations.map((conversation: ConversationData, i: number) => (
          <ConversationArea key={i} conversation={conversation} connection={this.connection} />
        ))}
      </div>
    );
  }
}

export default App;
