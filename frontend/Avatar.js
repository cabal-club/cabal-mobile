import React from 'react';
import {View, StyleSheet} from 'react-native';
import strToColor from 'string-to-color';

const styles = StyleSheet.create({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 16,
    marginRight: 6,
  },
});

export default class Avatar extends React.Component {
  render() {
    const {isHidden, message} = this.props;
    const hiddenStyle = isHidden ? {height: 0} : null;
    const colorStyle = {backgroundColor: strToColor(message.author)};
    return <View style={[styles.avatar, colorStyle, hiddenStyle]} />;
  }
}
