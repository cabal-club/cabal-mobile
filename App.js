import React from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import nodejs from 'nodejs-mobile-react-native';

export default class App extends React.Component {
  state = {
    messages: [],
  };

  componentWillMount() {
    nodejs.start('main.js');
    nodejs.channel.addListener(
      'message',
      raw => {
        const msg = JSON.parse(raw);
        if (msg.type === 'system') msg.system = true;
        else if (msg.type === 'chat/text') {
          msg.user = {
            _id: 2,
            name: msg.author,
            avatar: 'https://placeimg.com/140/140/any',
          };
        } else {
          msg.text = JSON.stringify(msg);
        }
        msg.type;
        if (!msg._id) msg._id = Math.round(Math.random() * 100000);
        if (!msg.createdAt) msg.createdAt = new Date();
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
      },
      this,
    );
    this.setState({
      messages: [],
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    );
  }
}
