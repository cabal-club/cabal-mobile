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
      text => {
        const msg = {
          _id: 191023,
          text: text,
          createdAt: new Date(),
          system: true,
        };
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
      },
      this,
    );
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ],
    });
  }

  onSend(messages = []) {
    console.warn(messages);
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
