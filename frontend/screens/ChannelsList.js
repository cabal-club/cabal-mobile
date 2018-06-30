import React from 'react';
import {
  AsyncStorage,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  Button,
  StyleSheet,
  Clipboard,
} from 'react-native';
import backend from 'nodejs-mobile-react-native';

class HomeHeader extends React.Component {
  constructor(props) {
    super(props);
    this.onPressCopy = this.onPressCopy.bind(this);
  }

  onPressCopy() {
    Clipboard.setString(this.props.value);
    alert('Copied to the clipboard!');
  }

  render() {
    return (
      <View style={styles.header}>
        <Text
          style={styles.headerKey}
          numberOfLines={1}
          ellipsizeMode={'middle'}
        >
          {this.props.value || ''}
        </Text>
        {this.props.value ? (
          <View style={styles.headerCopyClipboard}>
            <Button title={'Copy'} onPress={this.onPressCopy} />
          </View>
        ) : null}
      </View>
    );
  }
}

export default class HomeScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: <HomeHeader value={navigation.getParam('key', '')} />,
  });

  constructor(props) {
    super(props);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderChannel = this.renderChannel.bind(this);
    this.state = {
      key: this.props.navigation.getParam('key', ''),
      nick: this.props.navigation.getParam(
        'nick',
        '0x' + Math.floor(Math.random() * 65536).toString(16),
      ),
      channels: [],
    };
    this._initialLoad = true
  }

  componentWillMount() {
    backend.start('main.js');
    this.listenerRef = raw => {
      const msg = JSON.parse(raw);
      if (msg.type === 'ready') this.updateKey(msg.key);
      if (msg.type === 'channels') this.updateChannels(msg.channels);
    };
    backend.channel.addListener('message', this.listenerRef, this);
    this.startOrJoinInstance();
  }

  componentWillUnmount() {
    if (this.listenerRef) {
      backend.channel.removeListener('message', this.listenerRef);
    }
  }

  startOrJoinInstance() {
    const key = this.props.navigation.getParam('key', '');
    const nick = this.state.nick;
    var msg = {type: 'join', key, nick};
    var raw = JSON.stringify(msg);
    backend.channel.send(raw);
  }

  async updateKey(key) {
    this.props.navigation.setParams({key, nick: this.state.nick});
    this.setState(prev => ({...prev, key}));

    if (this._initialLoad) {
      this._initialLoad = false
      const channel = await AsyncStorage.getItem('favorite-channel')
      if (channel) {
        this.enterChannel(channel)
      }
    }
  }

  updateChannels(channels) {
    this.setState(prev => ({...prev, channels}));
  }

  enterChannel(channel) {
    AsyncStorage.setItem('favorite-channel', channel)
    const nick = this.state.nick;
    this.props.navigation.navigate('Chat', {channel, nick});
  }

  renderHeader() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {this.state.channels.length > 0 ? 'Pick a channel' : 'Loading...'}
        </Text>
      </View>
    );
  }

  renderChannel(x) {
    const channel = x.item;
    return (
      <TouchableOpacity onPress={() => this.enterChannel(channel)}>
        <View style={styles.item} key={channel}>
          <Text style={styles.itemText}>{channel}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={styles.root}>
        <FlatList
          ListHeaderComponent={this.renderHeader}
          data={this.state.channels}
          renderItem={this.renderChannel}
          keyExtractor={item => item}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerKey: {
    fontSize: 18,
    color: '#232323',
    fontWeight: 'bold',
    maxWidth: 210,
  },

  headerCopyClipboard: {
    marginRight: 20,
    marginLeft: 12,
  },

  item: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  itemText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232323',
  },

  listHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  listHeaderText: {
    fontSize: 14,
    color: '#888888',
  },
});
