import React from 'react'
import {View, StyleSheet} from 'react-native'
import {GiftedChat, SystemMessage} from 'react-native-gifted-chat'
import backend from 'nodejs-mobile-react-native'
import Message from '../components/Message'

export default class ChatScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('channel', 'Chat')
    }
  };

  constructor (props) {
    super(props)
    this.renderMessage = this.renderMessage.bind(this)
    this.listenerRef = null
    this.state = {
      nick: this.props.navigation.getParam('nick', 'Me'),
      channel: this.props.navigation.getParam('channel', ''),
      messages: []
    }
  }

  componentWillMount () {
    backend.start('main.js')
    this.listenerRef = raw => {
      const msg = JSON.parse(raw)
      if (msg.type === 'many') this.includeMany(msg.payload)
    }
    backend.channel.addListener('message', this.listenerRef, this)
    this.onBackendReady()
  }

  componentWillUnmount () {
    var msg = {type: 'exit', channel: this.state.channel}
    var raw = JSON.stringify(msg)
    backend.channel.send(raw)
    if (this.listenerRef) {
      backend.channel.removeListener('message', this.listenerRef)
    }
  }

  onBackendReady () {
    const channel = this.props.navigation.getParam('channel', null)
    if (!channel) return console.error('Cannot enter, no channel given')
    var msg = {type: 'enter', channel}
    var raw = JSON.stringify(msg)
    backend.channel.send(raw)
  }

  includeMany (msgs) {
    msgs.forEach(msg => {
      if (msg.type === 'system') msg.system = true;
      if (msg.type !== 'chat/text' && msg.type !== 'system')
        msg.text = JSON.stringify(msg);
      if (msg.author) msg.user = {_id: msg.authorId, name: msg.author};
      if (!msg.createdAt) msg.createdAt = new Date();
    });
    console.log({msgs})
    msgs.reverse();
    // Remove duplicate messages
    msgs = msgs.filter((msg, index) => {
      return msgs.map(mapObj => mapObj._id).indexOf(msg._id) === index;
    })
    this.setState(prev => ({
      nick: prev.nick,
      channel: prev.channel,
      messages: GiftedChat.append(prev.messages, msgs)
    }))
  }

  onSend (messages = []) {
    if (messages.length === 0) return
    const msg = {
      type: 'publish',
      text: messages[0].text,
      channel: this.state.channel,
      nick: this.state.nick
    }
    const raw = JSON.stringify(msg)
    backend.channel.send(raw)
  }

  renderMessage (props) {
    if (props.currentMessage.type === 'system') {
      return <SystemMessage {...props} />
    } else {
      return <Message {...props} />
    }
  }

  render () {
    return (
      <View style={styles.root}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          placeholder={'Message'}
          renderMessage={this.renderMessage}
          user={{_id: 0, name: this.state.nick}}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
});
