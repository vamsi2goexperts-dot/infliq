// Suppress expo-av deprecation noise — still functional in SDK 54 with Expo Go
const _cw = console.warn;
console.warn = (...a) => {
    if (typeof a[0] === 'string' && a[0].includes('[expo-av]')) return;
    _cw(...a);
};

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
