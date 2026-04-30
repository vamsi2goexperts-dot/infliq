import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/components/navigation/AppNavigator';
import CallManager from './src/components/calls/CallManager';

LogBox.ignoreLogs(['[expo-av]', 'Expo AV has been deprecated']);

const _warn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[expo-av]')) return;
    _warn(...args);
};

// Keep the splash visible until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {});

// Inner component that knows when auth is resolved
function AppContent() {
    const { loading } = useAuth();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Ensure splash screen stays for at least 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutReady = useCallback(async () => {
        if (!loading && isReady) {
            await SplashScreen.hideAsync();
        }
    }, [loading, isReady]);

    if (loading || !isReady) return null; // Splash stays visible

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutReady}>
            <CallManager>
                <AppNavigator />
            </CallManager>
            <StatusBar style="auto" />
        </View>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
