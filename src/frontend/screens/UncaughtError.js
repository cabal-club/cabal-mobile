// @flow
import React from "react";
import { StyleSheet, Text } from "react-native";
import { defineMessages, FormattedMessage } from "react-intl";

import CenteredView from "../sharedComponents/CenteredView";

const m = defineMessages({
  errorTitle: {
    id: "screens.UncaughtError.errorTitle",
    defaultMessage: "Unexpected Error",
    description: "Title of message when there is an uncaught message in the app"
  },
  errorDesc: {
    id: "screens.UncaughtError.errorDesc",
    defaultMessage:
      "Really sorry about this, something unexpected went wrong, and it's our fault not yours. Try restarting the app to see if that fixes things.",
    description: "Description when there is an uncaught message in the app"
  }
});

/**
 * Fallback screen to show if there is an uncaught error in the app
 */
const UncaughtError = () => (
  <CenteredView>
    <Text style={styles.notice}>
      <FormattedMessage {...m.errorTitle} />
    </Text>
    <Text style={styles.description}>
      <FormattedMessage {...m.errorDesc} />
    </Text>
  </CenteredView>
);

export default UncaughtError;

const styles = StyleSheet.create({
  notice: {
    fontSize: 20,
    textAlign: "center",
    margin: 20
  },
  description: {
    textAlign: "center",
    color: "#333333",
    margin: 20
  }
});
