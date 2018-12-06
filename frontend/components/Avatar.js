import React from 'react'
import {View, StyleSheet} from 'react-native'
import Blockies from 'blockies-bmp/react-native-component'
global.Buffer = require('buffer').Buffer // Import Buffer globally for the Blockies component

const styles = StyleSheet.create({
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 3,
    marginRight: 8
  },
  avatarImage: {
    borderRadius: 3
  }
})

export default class Avatar extends React.Component {
  render () {
    const {isHidden, message} = this.props
    const hiddenStyle = isHidden ? {height: 0} : null
    return (
      <View style={[styles.avatar, hiddenStyle]}>
        <Blockies
          opts={{seed: message.author}}
          size={40}
          style={styles.avatarImage}
          bgColor='#fff'
        />
      </View>
    )
  }
}
