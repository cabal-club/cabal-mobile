/* global __DEV__ */
// @flow
import * as React from 'react';
import { Platform } from 'react-native';
import debug from 'debug';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';
import { IntlProvider } from 'react-intl';
import { useAppState } from 'react-native-hooks';
import * as Localization from 'expo-localization';

import ErrorScreen from './screens/UncaughtError';
import AppLoading from './AppLoading';
import AppContainer from './AppContainer';

// Turn on logging if in debug mode
if (__DEV__) debug.enable('*');
const log = debug('App');

// WARNING: This needs to change if you change the navigation structure
const NAV_STORE_KEY = '@Navigation@1';

const persistNavigationState = async navState => {
  try {
    await AsyncStorage.setItem(NAV_STORE_KEY, JSON.stringify(navState));
  } catch (err) {
    log('Error saving navigation state', err);
  }
};
const loadNavigationState = async () => {
  const jsonString = await AsyncStorage.getItem(NAV_STORE_KEY);
  return JSON.parse(jsonString);
};

/**
 * Catches Javascript errors anywhere in the child component tree, logs the
 * errors and displays a fallback UI.
 */
class ErrorBoundary extends React.Component<
  {
    children: React.Node
  },
  {
    hasError: boolean
  }
> {
  state = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // This is rendered outside AppLoading, so SpashScreen could still be
    // showing if error occurs in AppLoading before it's hidden
    SplashScreen.hide();
    throw error
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <ErrorScreen />;
  }
}

const formats = {
  date: {
    long: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }
};

const App = () => {
  const [locale, setLocale] = React.useState(Localization.locale || 'en');
  const appState = useAppState();

  React.useEffect(() => {
    // Localization only changes in Android (in iOS the app is restarted) and
    // will only happen when the app comes back into the foreground
    if (Platform.OS !== 'android' || appState !== 'active') return;
    Localization.getLocalizationAsync()
      .then(({ locale }) => setLocale(locale || 'en'))
      .catch(() => {});
  }, [appState]);

  return (
    <ErrorBoundary>
      <IntlProvider
        locale={locale}
        formats={formats}
        onError={e => console.warn(e)}>
          <AppLoading>
            <AppContainer
              persistNavigationState={persistNavigationState}
              loadNavigationState={loadNavigationState}
            />
          </AppLoading>
      </IntlProvider>
    </ErrorBoundary>
  );
};


export default App;

