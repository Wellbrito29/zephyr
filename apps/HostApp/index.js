/**
 * @format
 *
 * Registration is synchronous. The Module Federation metro plugin patches core
 * initialization (see the unstable_patch* flags in metro.config.js) so shared
 * deps are ready; the remote is loaded lazily at render time via React.lazy in
 * App.tsx.
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
