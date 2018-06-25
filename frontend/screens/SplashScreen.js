import React from 'react'
import {
  ActivityIndicator,
  Animated,
  AsyncStorage,
  Image,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native'
import {NavigationActions} from 'react-navigation'

import backend from 'nodejs-mobile-react-native'

export default class SplashScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      logoAnimation: new Animated.Value(0)
    }
  }

  static navigationOptions = ({navigation}) => ({header: null})

  async componentDidMount () {
    Animated.timing(this.state.logoAnimation, { toValue: 1, duration: 2000 }).start()
    const key = await AsyncStorage.getItem('favorite-key')
    const nick = await AsyncStorage.getItem('favorite-nick')
    const channel = await AsyncStorage.getItem('favorite-channel')
    if (channel) {
      this.resumeLastCabal({key, nick, channel})
    } else {
      this.props.navigation.navigate('Main')
    }
  }

  componentWillUnmount () {
    if (this.backendListener) {
      backend.channel.removeListener('message', this.backendListener)
    }
  }

  resumeLastCabal = ({key, nick, channel}) => {
    backend.start('main.js')
    this.backendListener = (raw) => {
      const msg = JSON.parse(raw)
      if (msg.type === 'ready') {
        this.setState({stillLoading: true})
      }
      if (msg.type === 'channels') {
        this.props.navigation.navigate('Channels', {key, nick, channel})
      }
    }
    backend.channel.addListener('message', this.backendListener, this)
    backend.channel.send(JSON.stringify({type: 'join', key, nick}))
  }

  render () {
    return (
      <View style={styles.root}>
        <StatusBar backgroundColor='#000' barStyle='light-content' />
        <Animated.Image
          source={require('../images/logo.png')}
          style={[styles.logo, {opacity: this.state.logoAnimation}]}
        />
        {this.state.stillLoading &&
          <ActivityIndicator style={styles.activityIndicator} />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 20
  },
  logo: {
    width: '30%',
    height: '30%',
    resizeMode: 'contain'
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 40
  }
})
