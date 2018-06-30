import React from 'react'
import {AsyncStorage, View, Text, Button, StatusBar, StyleSheet} from 'react-native'

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Cabal'
  }

  onPressStart = () => {
    this.props.navigation.navigate('StartModal')
  }

  onPressJoin = () => {
    this.props.navigation.navigate('JoinModal')
  }

  render() {
    return (
      <View style={styles.root}>
        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
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
    )
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
  }
})
