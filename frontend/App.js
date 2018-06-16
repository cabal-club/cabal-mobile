import React from 'react';
import {View, StyleSheet} from 'react-native';
import {GiftedChat, SystemMessage} from 'react-native-gifted-chat';
import nodejs from 'nodejs-mobile-react-native';
import Message from './Message';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.renderMessage = this.renderMessage.bind(this);
  }

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

  renderMessage(props) {
    if (props.currentMessage.type === 'system') {
      return <SystemMessage {...props} />;
    } else {
      return <Message {...props} />;
    }
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        placeholder={'Message'}
        renderMessage={this.renderMessage}
        user={{_id: 1}}
      />
    );
  }
}
