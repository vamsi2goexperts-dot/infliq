import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import socketService from '../../services/socket.service';
import { callService } from '../../services/api';
import twilioService from '../../services/twilioService';
import { useAuth } from '../../context/AuthContext';

import { TwilioVideoLocalView, TwilioVideoParticipantView, TwilioVideo } from '../../components/calls/TwilioViews';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CallScreen({ route, navigation }) {
    const { otherUser, callType, callId, isIncoming } = route.params;
    const { user } = useAuth();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const twilioVideo = useRef(null);

    const [status, setStatus] = useState('connecting');
    const [participants, setParticipants] = useState(new Map());
    const [videoTracks, setVideoTracks] = useState(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');

    useEffect(() => {
        // Continuous pulsing animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        );
        pulse.start();

        // Connect to Twilio Room - Only if native
        if (Platform.OS !== 'web') {
            connectToTwilio();
        } else {
            console.warn('Twilio Video Calling is not supported in web browsers.');
            setStatus('connected');
        }

        return () => {
            pulse.stop();
            if (Platform.OS !== 'web' && twilioVideo.current) {
                twilioVideo.current.disconnect();
            }
        };
    }, []);

    const connectToTwilio = async () => {
        try {
            console.log('🔌 Requesting Twilio token for room:', callId);
            setStatus('connecting');

            console.log('⚡ DEBUG: About to call twilioService.getToken');
            const token = await twilioService.getToken(callId);
            console.log('⚡ DEBUG: Token received in CallScreen:', token ? 'YES' : 'NO');

            console.log('🚀 Connecting via TwilioVideo component...');

            if (twilioVideo.current) {
                twilioVideo.current.connect({
                    accessToken: token,
                    roomName: callId,
                    enableAudio: true,
                    enableVideo: callType === 'video'
                });
            } else {
                throw new Error('TwilioVideo component not ready');
            }

        } catch (error) {
            console.error('❌ Twilio Connection Error:', error);
            setStatus('failed');
            Alert.alert('Connection Error', error.message || 'Failed to connect');
            setTimeout(() => navigation.goBack(), 2000);
        }
    };

    const _onRoomDidConnect = ({ roomName, roomSid, participants, localParticipant }) => {
        console.log('✅ Connected to Twilio room:', roomName);
        console.log('⚡ DEBUG: roomSid:', roomSid);
        setStatus('connected');
        const newParticipants = new Map();
        participants.forEach(p => newParticipants.set(p.sid, p));
        setParticipants(newParticipants);
    };

    const _onRoomDidFailToConnect = (error) => {
        console.error('❌ Room failed to connect:', error);
        console.log('⚡ DEBUG: Error detail:', JSON.stringify(error));
        setStatus('failed');
        Alert.alert('Call Error', error.error || 'Failed to connect to room');
        navigation.goBack();
    };

    const _onRoomDidDisconnect = ({ roomName, error }) => {
        console.log('📴 Disconnected from room:', roomName, error);
        console.log('⚡ DEBUG: Disconnect error:', error);
        setStatus('disconnected');
        navigation.goBack();
    };

    const _onParticipantConnected = ({ participant }) => {
        console.log('👤 Participant connected:', participant.identity);
        setParticipants(prev => new Map(prev).set(participant.sid, participant));
    };

    const _onParticipantDisconnected = ({ participant }) => {
        console.log('👤 Participant disconnected:', participant.identity);
        setParticipants(prev => {
            const next = new Map(prev);
            next.delete(participant.sid);
            return next;
        });
        setVideoTracks(prev => {
            const next = new Map(prev);
            next.delete(participant.sid);
            return next;
        });
    };

    const _onParticipantAddedVideoTrack = ({ participant, track }) => {
        console.log('📹 Added video track for:', participant.identity);
        setVideoTracks(prev => new Map(prev).set(participant.sid, track));
    };

    const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
        console.log('📹 Removed video track for:', participant.identity);
        setVideoTracks(prev => {
            const next = new Map(prev);
            next.delete(participant.sid);
            return next;
        });
    };

    useEffect(() => {
        if (!user || !callId) return;
        const handleCallEnded = (data) => {
            console.log('📴 Call ended by other user:', data);
            if (twilioVideo.current) twilioVideo.current.disconnect();
            navigation.goBack();
        };
        socketService.on(`call-ended-${user._id}`, handleCallEnded);
        return () => socketService.off(`call-ended-${user._id}`, handleCallEnded);
    }, [user, callId]);

    const handleEndCall = async () => {
        try {
            if (twilioVideo.current) {
                twilioVideo.current.disconnect();
            }
            if (callId) {
                console.log('📴 Ending call via API:', callId);
                await callService.endCall(callId);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error ending call:', error);
            navigation.goBack();
        }
    };

    const toggleAudio = () => {
        if (Platform.OS === 'web') return;
        const newState = !isAudioEnabled;
        if (twilioVideo.current) {
            twilioVideo.current.setLocalAudioEnabled(newState);
            setIsAudioEnabled(newState);
        }
    };

    const toggleVideo = () => {
        if (Platform.OS === 'web') return;
        const newState = !isVideoEnabled;
        if (twilioVideo.current) {
            twilioVideo.current.setLocalVideoEnabled(newState);
            setIsVideoEnabled(newState);
        }
    };

    const flipCamera = () => {
        if (Platform.OS === 'web') return;
        if (twilioVideo.current) {
            twilioVideo.current.flipCamera();
        }
    };

    const remoteParticipantSid = Array.from(videoTracks.keys())[0];
    const remoteVideoTrack = videoTracks.get(remoteParticipantSid);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.mainContent}>
                {/* Remote Video (Fullscreen) */}
                {callType === 'video' && remoteVideoTrack && Platform.OS !== 'web' ? (
                    <TwilioVideoParticipantView
                        style={styles.remoteVideo}
                        key={remoteVideoTrack.sid}
                        trackIdentifier={remoteVideoTrack}
                    />
                ) : (
                    <View style={styles.userInfo}>
                        <Animated.View style={[
                            styles.avatarContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}>
                            <Image
                                source={otherUser.profilePicture ? { uri: otherUser.profilePicture } : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random` }}
                                style={styles.avatar}
                            />
                        </Animated.View>
                        <Text style={styles.userName}>{otherUser.name}</Text>
                        <Text style={styles.callStatus}>
                            {status === 'connecting' ? 'Connecting...' :
                                status === 'connected' ? (callType === 'video' ? 'Video calling...' : 'Audio calling...') :
                                    'Call Ended'}
                        </Text>
                        {Platform.OS === 'web' && (
                            <Text style={styles.webWarning}>Video calling is only available on Mobile App</Text>
                        )}
                    </View>
                )}

                {/* Local Video (Small Overlay) */}
                {callType === 'video' && isVideoEnabled && Platform.OS !== 'web' && (
                    <View style={styles.localVideoContainer}>
                        <TwilioVideoLocalView
                            enabled={true}
                            style={styles.localVideo}
                        />
                    </View>
                )}

                {/* Controls Overlay */}
                <View style={styles.controlsOverlay}>
                    <View style={styles.topInfo}>
                        {callType === 'video' && remoteVideoTrack && (
                            <Text style={styles.videoUserNameOverlay}>{otherUser.name}</Text>
                        )}
                    </View>

                    <View style={styles.bottomControls}>
                        <View style={styles.controlsRow}>
                            <TouchableOpacity
                                style={[styles.controlBtn, !isAudioEnabled && styles.controlBtnActive]}
                                onPress={toggleAudio}
                                disabled={Platform.OS === 'web'}
                            >
                                <Ionicons
                                    name={isAudioEnabled ? "mic-outline" : "mic-off-outline"}
                                    size={28}
                                    color={isAudioEnabled ? COLORS.white : COLORS.royalBlue}
                                />
                            </TouchableOpacity>

                            {callType === 'video' && (
                                <TouchableOpacity
                                    style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnActive]}
                                    onPress={toggleVideo}
                                    disabled={Platform.OS === 'web'}
                                >
                                    <Ionicons
                                        name={isVideoEnabled ? "videocam-outline" : "videocam-off-outline"}
                                        size={28}
                                        color={isVideoEnabled ? COLORS.white : COLORS.royalBlue}
                                    />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.controlBtn, styles.endCallBtn]}
                                onPress={handleEndCall}
                            >
                                <Ionicons name="call" size={32} color={COLORS.white} />
                            </TouchableOpacity>

                            {callType === 'video' && (
                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={flipCamera}
                                    disabled={Platform.OS === 'web'}
                                >
                                    <Ionicons name="camera-reverse-outline" size={28} color={COLORS.white} />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.controlBtn} disabled={Platform.OS === 'web'}>
                                <Ionicons name="volume-medium-outline" size={28} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Twilio Video Engine Component */}
                {Platform.OS !== 'web' && (
                    <TwilioVideo
                        ref={twilioVideo}
                        onRoomDidConnect={_onRoomDidConnect}
                        onRoomDidDisconnect={_onRoomDidDisconnect}
                        onRoomDidFailToConnect={_onRoomDidFailToConnect}
                        onParticipantConnected={_onParticipantConnected}
                        onParticipantDisconnected={_onParticipantDisconnected}
                        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
                        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainContent: {
        flex: 1,
    },
    remoteVideo: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
    },
    localVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 120,
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: '#333',
        zIndex: 10,
    },
    localVideo: {
        flex: 1,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: COLORS.royalBlue + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.mediumGray,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 8,
    },
    callStatus: {
        fontSize: 16,
        color: COLORS.mediumGray,
        letterSpacing: 1,
    },
    webWarning: {
        color: '#ff3b30',
        marginTop: 20,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    topInfo: {
        alignItems: 'center',
        marginTop: 20,
    },
    videoUserNameOverlay: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.white,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    bottomControls: {
        width: '100%',
        alignItems: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 20,
        borderRadius: 30,
    },
    controlBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtnActive: {
        backgroundColor: COLORS.white,
    },
    endCallBtn: {
        backgroundColor: '#ff3b30',
        width: 64,
        height: 64,
        borderRadius: 32,
        transform: [{ rotate: '135deg' }],
    },
});
