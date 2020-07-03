import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { View, Text } from 'react-native'

function HomeScreen () {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  )
}

const Stack = createStackNavigator()

function AppContainer () {
  return (
    <HomeScreen />
  )
}

export default AppContainer
