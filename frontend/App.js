import {createSwitchNavigator, createStackNavigator} from 'react-navigation'
import ChannelsList from './screens/ChannelsList'
import ChatScreen from './screens/ChatScreen'
import HomeScreen from './screens/HomeScreen'
import JoinModal from './screens/JoinModal'
import SplashScreen from './screens/SplashScreen'
import StartModal from './screens/StartModal'

const MainStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    StartModal: {
      screen: StartModal
    },
    JoinModal: {
      screen: JoinModal
    },
    Channels: {
      screen: ChannelsList,
      path: ':key/channels'
    },
    Chat: {
      screen: ChatScreen,
      path: ':key/chat/:channel'
    }
  }, {
    initialRouteName: 'Home'
  }
)

export default createSwitchNavigator(
  {
    SplashScreen: {
      screen: SplashScreen
    },
    Main: {
      screen: MainStack
    }
  }, {
    initialRouteName: 'SplashScreen',
    mode: 'modal',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: '#fff',
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center'
    },
    transitionConfig: () => ({
      screenInterpolator: props => ({
        transform: [{translateX: 0}, {translateY: 0}]
      })
    })
  }
)
