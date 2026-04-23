import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['[expo-av]', 'Expo AV has been deprecated']);

const _warn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[expo-av]')) return;
    _warn(...args);
};
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/components/navigation/AppNavigator';
import CallManager from './src/components/calls/CallManager';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <AuthProvider>
          <CallManager>
            <AppNavigator />
          </CallManager>
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
