import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationService from '../../services/navigationService';
import { COLORS } from '../../utils/constants';
import { callService } from '../../services/api';
import socketService from '../../services/socket.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IncomingCallModal from './IncomingCallModal';

import { useAuth } from '../../context/AuthContext';

export default function CallManager({ children }) {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState(null);
    const [showIncomingCall, setShowIncomingCall] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        if (user) {
            initializeCallManager();
        } else {
            // Optional: Disconnect if user logs out
            socketService.disconnect();
        }

        return () => {
            // Cleanup listeners
            if (currentUserId) {
                socketService.off(`incoming-call-${currentUserId}`);
                socketService.off(`call-accepted-${currentUserId}`);
                socketService.off(`call-rejected-${currentUserId}`);
                socketService.off(`call-ended-${currentUserId}`);
            }
        };
    }, [user]);

    const initializeCallManager = async () => {
        try {
            // Get user ID
            const userId = await AsyncStorage.getItem('userId');
            setCurrentUserId(userId);

            // Connect socket
            await socketService.connect();

            // Listen for incoming calls
            socketService.onIncomingCall(userId, (call) => {
                console.log('📞 Incoming call:', call);
                setIncomingCall(call);
                setShowIncomingCall(true);
            });

            // Listen for call accepted
            socketService.onCallAccepted(userId, (data) => {
                console.log('✅ Call accepted:', data);
                // Navigate to call screen for the caller
                NavigationService.navigate('CallScreen', {
                    callId: data.callId,
                    otherUser: data.receiver || {},
                    callType: data.type || 'audio',
                    isIncoming: false
                });
            });

            // Listen for call rejected
            socketService.onCallRejected(userId, (data) => {
                console.log('❌ Call rejected:', data);
                Alert.alert('Call Declined', 'The other person declined your call');
            });

            // Listen for call ended
            socketService.onCallEnded(userId, (data) => {
                console.log('📴 Call ended:', data);
                Alert.alert('Call Ended', `Call duration: ${data.duration || 0} seconds`);
                setShowIncomingCall(false);
                setIncomingCall(null);
            });

        } catch (error) {
            console.error('Failed to initialize call manager:', error);
        }
    };

    const handleAcceptCall = async () => {
        try {
            if (!incomingCall) return;

            console.log('📞 Accepting call:', incomingCall);
            await callService.acceptCall(incomingCall.callId);
            setShowIncomingCall(false);

            // Navigate to call screen
            NavigationService.navigate('CallScreen', {
                callId: incomingCall.callId,
                otherUser: incomingCall.caller || {},
                callType: incomingCall.type || 'audio',
                isIncoming: true
            });

        } catch (error) {
            console.error('Failed to accept call:', error);
            Alert.alert('Error', 'Failed to accept call');
        }
    };

    const handleRejectCall = async () => {
        try {
            if (!incomingCall) return;

            console.log('❌ Rejecting call:', incomingCall);
            await callService.rejectCall(incomingCall.callId);
            setShowIncomingCall(false);
            setIncomingCall(null);

        } catch (error) {
            console.error('Failed to reject call:', error);
            Alert.alert('Error', 'Failed to reject call');
        }
    };

    return (
        <>
            {children}
            <IncomingCallModal
                visible={showIncomingCall}
                call={incomingCall}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
            />
        </>
    );
}

const styles = StyleSheet.create({});
