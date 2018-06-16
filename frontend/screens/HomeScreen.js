import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Cabal',
  };

  constructor(props) {
    super(props);
    this.onPressStart = this.onPressStart.bind(this);
    this.onPressJoin = this.onPressJoin.bind(this);
  }

  onPressStart() {
    this.props.navigation.navigate('StartModal');
  }

  onPressJoin() {
    this.props.navigation.navigate('JoinModal');
  }

  render() {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Welcome to Cabal, a p2p chat system</Text>
        <Text style={styles.emoji}>{String.fromCharCode(0xd83d, 0xdc53)}</Text>
        <Text style={styles.text}>Choose below to start a new instance</Text>
        <Text style={styles.text}>or join an existing one</Text>
        <View style={styles.choices}>
          <Button title="Start" onPress={this.onPressStart} />
          <View style={styles.spacer} />
          <Button title="Join" onPress={this.onPressJoin} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  emoji: {
    fontSize: 50,
  },

  title: {
    fontSize: 18,
    color: '#232323',
  },

  text: {
    fontSize: 14,
    color: '#232323',
  },

  choices: {
    flexDirection: 'row',
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spacer: {
    width: 40,
  },
});
