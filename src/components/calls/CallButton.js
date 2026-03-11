import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { callService } from '../../services/api';

export default function CallButton({ userId, userName, type = 'video', size = 32, color = COLORS.royalBlue }) {
    const handleCall = async () => {
        try {
            Alert.alert(
                `${type === 'video' ? 'Video' : 'Audio'} Call`,
                `Call ${userName}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Call',
                        onPress: async () => {
                            try {
                                const response = await callService.initiateCall(userId, type);
                                console.log('Call initiated:', response);
                                Alert.alert('Calling...', `Calling ${userName}`);

                                // TODO: Navigate to video call screen
                                // For now, just show alert
                                setTimeout(() => {
                                    Alert.alert('Note', 'Video call screen coming soon! Backend is ready.');
                                }, 1000);

                            } catch (error) {
                                console.error('Failed to initiate call:', error);
                                Alert.alert('Error', 'Failed to initiate call');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Call error:', error);
        }
    };

    return (
        <TouchableOpacity onPress={handleCall} style={styles.button}>
            <Ionicons
                name={type === 'video' ? 'videocam' : 'call'}
                size={size}
                color={color}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8
    }
});
