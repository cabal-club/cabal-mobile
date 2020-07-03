// @flow
// setup bugsnag before anything else
import { AppRegistry } from "react-native";
import App from "./src/frontend/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
