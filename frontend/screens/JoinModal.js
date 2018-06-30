import React from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  AsyncStorage
} from 'react-native'

export default class JoinModal extends React.Component {
  constructor (props) {
    super(props)
    this.onPressEnter = this.onPressEnter.bind(this)
    this.onChangeKey = this.onChangeKey.bind(this)
    this.onChangeNick = this.onChangeNick.bind(this)
    this.state = {
      key: '',
      keyValid: true,
      nick: '',
      nickValid: true
    }
  }

  async componentDidMount () {
    const key = (await AsyncStorage.getItem('favorite-key')) || ''
    const nick = (await AsyncStorage.getItem('favorite-nick')) || ''
    this.setState(prev => ({...prev, key, nick}))
  }

  onPressEnter () {
    const {key, nick} = this.state
    let valid = true
    if (key.length < 64) {
      this.setState(prev => ({...prev, keyValid: false}))
      valid = false
    }
    if (nick.length === 0) {
      this.setState(prev => ({...prev, nickValid: false}))
      valid = false
    }
    if (!valid) return
    AsyncStorage.setItem('favorite-key', key)
    AsyncStorage.setItem('favorite-nick', nick)
    this.props.navigation.navigate('Channels', {key, nick})
  }

  onChangeKey (key) {
    this.setState(prev => ({...prev, key, keyValid: true}))
  }

  onChangeNick (nick) {
    this.setState(prev => ({...prev, nick, nickValid: true}))
  }

  render () {
    const {keyValid, nickValid} = this.state
    return (
      <View style={styles.root}>
        <Text style={styles.label}>
          Enter the instance key you have received:
        </Text>
        <TextInput
          value={this.state.key}
          onChangeText={this.onChangeKey}
          placeholder={
            'dat://59813e3169b4b2a6d3741b077f80cce014d84d67b4a8f9fa4c19605b5cff637f'
          }
          placeholderTextColor={keyValid ? '#888888' : 'red'}
          underlineColorAndroid={keyValid ? '#888888' : 'red'}
          style={keyValid ? styles.inputValid : styles.inputInvalid}
        />

        <Text style={styles.label}>How do you want to be called?</Text>
        <TextInput
          value={this.state.nick}
          onChangeText={this.onChangeNick}
          placeholder={'Nickname'}
          placeholderTextColor={nickValid ? '#888888' : 'red'}
          underlineColorAndroid={nickValid ? '#888888' : 'red'}
          style={nickValid ? styles.inputValid : styles.inputInvalid}
        />

        <View style={styles.button}>
          <Button title={'Enter'} onPress={this.onPressEnter} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20
  },

  label: {
    fontSize: 14,
    color: '#232323'
  },

  inputValid: {
    marginBottom: 20,
    color: '#232323'
  },

  inputInvalid: {
    marginBottom: 20,
    color: 'red'
  },

  button: {
    alignSelf: 'flex-end'
  }
})
