import React from 'react'
import PropTypes from 'prop-types'
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform
} from 'react-native'
import { MessageText, MessageImage, Time, utils } from 'react-native-gifted-chat'

const { isSameUser, isSameDay } = utils

export default class Bubble extends React.Component {
  constructor (props) {
    super(props)
    this.onLongPress = this.onLongPress.bind(this)
  }

  onLongPress = () => {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context)
    } else if (this.props.currentMessage.text) {
      const options = ['Copy Text', 'Cancel']
      const cancelButtonIndex = options.length - 1
      this.context
        .actionSheet()
        .showActionSheetWithOptions(
          { options, cancelButtonIndex },
          buttonIndex => {
            if (buttonIndex === 0) {
              Clipboard.setString(this.props.currentMessage.text)
            }
          }
        )
    }
  }

  renderMessageText () {
    if (this.props.currentMessage.text) {
      const {
        containerStyle,
        wrapperStyle,
        messageTextStyle,
        ...messageTextProps
      } = this.props
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps)
      }
      return (
        <MessageText
          {...messageTextProps}
          textStyle={{
            left: [
              styles.standardFont,
              styles.messageText,
              messageTextProps.textStyle,
              messageTextStyle
            ]
          }}
        />
      )
    }
    return null
  }

  renderMessageImage () {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps)
      }
      return (
        <MessageImage
          {...messageImageProps}
          imageStyle={[styles.image, messageImageProps.imageStyle]}
        />
      )
    }
    return null
  }

  renderUsername () {
    const username = this.props.currentMessage.user.name
    if (username) {
      const { containerStyle, wrapperStyle, ...usernameProps } = this.props
      if (this.props.renderUsername) {
        return this.props.renderUsername(usernameProps)
      }
      return (
        <Text
          style={[
            styles.standardFont,
            styles.headerItem,
            styles.username,
            this.props.usernameStyle
          ]}
        >
          {username}
        </Text>
      )
    }
    return null
  }

  renderTime () {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps)
      }
      return (
        <Time
          {...timeProps}
          containerStyle={{ left: [styles.timeContainer] }}
          textStyle={{
            left: [
              styles.standardFont,
              styles.headerItem,
              styles.time,
              timeProps.textStyle
            ]
          }}
        />
      )
    }
    return null
  }

  renderCustomView () {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props)
    }
    return null
  }

  render () {
    const isSameThread =
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)

    const messageHeader = isSameThread ? null : (
      <View style={styles.headerView}>
        {this.renderUsername()}
        {this.renderTime()}
      </View>
    )

    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <TouchableOpacity
          onLongPress={this.onLongPress}
          accessibilityTraits='text'
          {...this.props.touchableProps}
        >
          <View style={[styles.wrapper, this.props.wrapperStyle]}>
            <View>
              {this.renderCustomView()}
              {messageHeader}
              {this.renderMessageImage()}
              {this.renderMessageText()}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

// Note: Everything is forced to be "left" positioned with this component.
// The "right" position is only used in the default Bubble.
const styles = StyleSheet.create({
  standardFont: {
    fontSize: 15
  },
  messageText: {
    marginLeft: 0,
    marginRight: 0
  },
  container: {
    flex: 1,
    alignItems: 'flex-start'
  },
  wrapper: {
    marginRight: 60,
    minHeight: 20,
    justifyContent: 'flex-end'
  },
  username: {
    fontWeight: 'bold',
    color: '#000'
  },
  time: {
    textAlign: 'left',
    fontSize: 14,
    color: '#111'
  },
  timeContainer: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0
  },
  headerItem: {
    marginRight: 10
  },
  headerView: {
    // Try to align it better with the avatar on Android.
    marginTop: Platform.OS === 'android' ? -2 : 0,
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  image: {
    borderRadius: 3,
    marginLeft: 0,
    marginRight: 0
  }
})

Bubble.contextTypes = {
  actionSheet: PropTypes.func
}

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  currentMessage: {
    text: null,
    createdAt: null,
    image: null
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {}
}
