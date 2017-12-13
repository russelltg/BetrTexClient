import * as React from 'react';

import { WsConnection } from './WsConnection';
// import Conversation from './Conversation';
import { ConversationsList } from './ConversationsList';
import { ConversationArea } from './ConversationArea';
import { ConversationData } from './Conversation';
import { AppBar, Typography, Toolbar, Drawer } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';

const drawerWidth = 300;

interface AppState {
  conversations: ConversationData[];
  currentThread: number;
}

const styles = {
  drawerPaper: {
    height: 'calc(100% - 64px)',
    width: drawerWidth,
    top: 64
  }
};

// tslint:disable-next-line:no-any
@(withStyles as any)(styles)
// tslint:disable-next-line:no-any
export default class App extends React.Component<any, AppState> {

  connection: WsConnection;
  areas: Map<number, JSX.Element>;

// tslint:disable-next-line:no-any
  constructor(props: any) {
    super(props);

    this.areas = new Map<number, JSX.Element>();
    this.connection = new WsConnection('10.0.0.9', 14563);

    // fetch the conversations
    this.connection.listConversations((datas: ConversationData[]) => {
      this.setState({conversations: datas});
    });

    this.state = {conversations: [], currentThread: -1};

  }

  onSelectConversation = (threadID: number) => {
    const a = this.state.currentThread;

    this.setState({currentThread: threadID});

    return a;
  }

  conversationArea = (threadID: number) => {
    // if (this.areas.has(threadID)) {
    //   return this.areas.get(threadID);
    // }

    // get conversation data for state.currentThread
    var convData: ConversationData | undefined;
    this.state.conversations.forEach(element => {
      if (element.threadid === threadID) {
        convData = element;
        return;
      }
    });

    const areaStyles = {
      position: 'absolute',
      width: 'calc(100% - ' + drawerWidth + 'px)',
      height: 'calc(100% - 64px)',
      left: drawerWidth
// tslint:disable-next-line:no-any
    } as any as React.CSSProperties;

    const conversationArea = convData ?
      <ConversationArea style={areaStyles} connection={this.connection} conversation={convData} /> : <div />;

    this.areas.set(threadID, conversationArea);

    return conversationArea;

  }

  render() {

    const conversationArea = this.conversationArea(this.state.currentThread);

    return (
      <div>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography type="title" color="inherit">
              BetrText
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer type="permanent" classes={{paper: this.props.classes.drawerPaper}}>
          <ConversationsList
            connection={this.connection}
            conversations={this.state.conversations}
            onSelect={this.onSelectConversation}
          />
        </Drawer>
        {conversationArea}
      </div>
    );
  }
}
