import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Day, utils } from 'react-native-gifted-chat'
import Bubble from './Bubble'
import Avatar from './Avatar'

const { isSameUser, isSameDay } = utils

export default class Message extends React.Component {
  getInnerComponentProps () {
    const { containerStyle, ...props } = this.props
    return {
      ...props,
      position: 'left',
      isSameUser,
      isSameDay
    }
  }

  renderDay () {
    if (this.props.currentMessage.createdAt) {
      const dayProps = this.getInnerComponentProps()
      return <Day {...dayProps} />
    }
    return null
  }

  renderBubble () {
    const bubbleProps = this.getInnerComponentProps()
    return <Bubble {...bubbleProps} />
  }

  renderAvatar () {
    const { currentMessage, previousMessage } = this.props
    const isHidden =
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)
    const message = this.props.currentMessage
    return <Avatar message={message} isHidden={isHidden} />
  }

  render () {
    const marginBottom = isSameUser(
      this.props.currentMessage,
      this.props.nextMessage
    ) ? 2 : 10

    return (
      <View>
        {this.renderDay()}
        <View style={[styles.container, { marginBottom }, this.props.containerStyle]}>
          {this.renderAvatar()}
          {this.renderBubble()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 8,
    marginRight: 0
  }
})

Message.defaultProps = {
  currentMessage: {},
  nextMessage: {},
  previousMessage: {},
  user: {},
  containerStyle: {}
}
