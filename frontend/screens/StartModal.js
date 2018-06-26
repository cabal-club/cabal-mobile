import React from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  AsyncStorage
} from 'react-native'

export default class StartModal extends React.Component {
  constructor (props) {
    super(props)
    this.onPressEnter = this.onPressEnter.bind(this)
    this.onChangeNick = this.onChangeNick.bind(this)
    this.state = {
      nick: '',
      nickValid: true
    }
  }

  async componentDidMount () {
    const nick = await AsyncStorage.getItem('favorite-nick')
    this.setState(prev => ({...prev, nick: nick}))
  }

  onPressEnter () {
    const {nick} = this.state
    if (nick.length === 0) {
      this.setState(prev => ({...prev, nickValid: false}))
    } else {
      AsyncStorage.setItem('favorite-nick', nick)
      this.props.navigation.navigate('Channels', {key: '', nick})
    }
  }

  onChangeNick (nick) {
    this.setState(prev => ({...prev, nick, nickValid: true}))
  }

  render () {
    const {nickValid} = this.state
    return (
      <View style={styles.root}>
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
