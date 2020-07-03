// @flow
import * as React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Layout component to fill screen with centered children/text
 */
const CenteredView = ({ children }: { children: React.Node }) => (
  <View style={styles.container}>{children}</View>
);

export default CenteredView;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20
  }
});
