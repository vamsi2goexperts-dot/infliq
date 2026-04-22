import { StatusBar } from 'expo-status-bar';
import React from 'react';
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
