import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    Animated,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

export default function IncomingCallModal({ visible, call, onAccept, onReject }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();

            // Pulsing animation for profile image
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true
                    })
                ])
            ).start();
        }
    }, [visible]);

    if (!call) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.container}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Call Type Label */}
                    <View style={styles.callTypeContainer}>
                        <Ionicons
                            name={call.type === 'video' ? 'videocam' : 'call'}
                            size={20}
                            color={COLORS.white}
                        />
                        <Text style={styles.callTypeText}>
                            {call.type === 'video' ? 'Incoming Video Call' : 'Incoming Voice Call'}
                        </Text>
                    </View>

                    {/* Caller Profile Image with Pulse */}
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{
                                    uri: call.caller?.profilePicture || 'https://via.placeholder.com/150'
                                }}
                                style={styles.callerImage}
                            />
                            <View style={styles.imageRing} />
                        </View>
                    </Animated.View>

                    {/* Caller Name */}
                    <Text style={styles.callerName}>
                        {call.caller?.name || 'Unknown'}
                    </Text>

                    {/* Calling Status */}
                    <Text style={styles.callingText}>Calling...</Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        {/* Decline Button */}
                        <TouchableOpacity
                            style={styles.actionButtonContainer}
                            onPress={onReject}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionButton, styles.declineButton]}>
                                <Ionicons name="close" size={36} color={COLORS.white} />
                            </View>
                            <Text style={styles.buttonLabel}>Decline</Text>
                        </TouchableOpacity>

                        {/* Accept Button */}
                        <TouchableOpacity
                            style={styles.actionButtonContainer}
                            onPress={onAccept}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionButton, styles.acceptButton]}>
                                <Ionicons name="call" size={36} color={COLORS.white} />
                            </View>
                            <Text style={styles.buttonLabel}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    content: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 60
    },
    callTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8
    },
    callTypeText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5
    },
    imageContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    callerImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: COLORS.white,
        backgroundColor: COLORS.mediumGray
    },
    imageRing: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderStyle: 'dashed'
    },
    callerName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginTop: 24,
        letterSpacing: 0.5
    },
    callingText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
        fontWeight: '500'
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 60,
        marginTop: 40
    },
    actionButtonContainer: {
        alignItems: 'center',
        gap: 12
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    declineButton: {
        backgroundColor: '#ff3b30'
    },
    acceptButton: {
        backgroundColor: '#34c759'
    },
    buttonLabel: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3
    }
});

