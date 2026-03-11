import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/components/navigation/AppNavigator';
import CallManager from './src/components/calls/CallManager';

export default function App() {
  return (
    <AuthProvider>
      <CallManager>
        <AppNavigator />
      </CallManager>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
