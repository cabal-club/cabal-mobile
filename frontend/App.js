import {createStackNavigator} from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import StartModal from './screens/StartModal';
import JoinModal from './screens/JoinModal';
import ChannelsList from './screens/ChannelsList';
import ChatScreen from './screens/ChatScreen';

const MainStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Channels: {
      screen: ChannelsList,
    },
    Chat: {
      screen: ChatScreen,
    },
  },
  {
    initialRouteName: 'Home',
  },
);

export default createStackNavigator(
  {
    Main: {
      screen: MainStack,
    },
    StartModal: {
      screen: StartModal,
    },
    JoinModal: {
      screen: JoinModal,
    },
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center',
    },
    transitionConfig: () => ({
      screenInterpolator: props => ({
        transform: [{translateX: 0}, {translateY: 0}],
      }),
    }),
  },
);
