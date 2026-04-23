import React, { useState, useEffect, useRef } from 'react';
import {
    Modal, View, Text, Image, TouchableOpacity,
    StyleSheet, Dimensions, StatusBar, Animated, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { storyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width: SW, height: SH } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewer({ groups, startGroupIndex = 0, onClose }) {
    const { user } = useAuth();
    const [groupIndex, setGroupIndex] = useState(startGroupIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const progress = useRef(new Animated.Value(0)).current;
    const animation = useRef(null);
    const timerRef = useRef(null);


    const currentGroup = groups[groupIndex];
    const currentStory = currentGroup?.stories[storyIndex];
    const isOwn = currentGroup?.user._id === user?._id;

    useEffect(() => {
        startProgress();
        if (currentStory) storyService.viewStory(currentStory._id).catch(() => {});
        return () => stopProgress();
    }, [groupIndex, storyIndex]);

    useEffect(() => {
        if (paused) stopProgress();
        else startProgress();
    }, [paused]);

    const startProgress = () => {
        stopProgress();
        progress.setValue(0);
        const duration = currentStory?.mediaType === 'video' ? 15000 : STORY_DURATION;
        animation.current = Animated.timing(progress, {
            toValue: 1,
            duration,
            useNativeDriver: false,
        });
        animation.current.start(({ finished }) => {
            if (finished) advance();
        });
    };

    const stopProgress = () => {
        animation.current?.stop();
        clearTimeout(timerRef.current);
    };

    const advance = () => {
        const group = groups[groupIndex];
        if (storyIndex < group.stories.length - 1) {
            setStoryIndex(i => i + 1);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex(g => g + 1);
            setStoryIndex(0);
        } else {
            onClose();
        }
    };

    const goBack = () => {
        if (storyIndex > 0) {
            setStoryIndex(i => i - 1);
        } else if (groupIndex > 0) {
            setGroupIndex(g => g - 1);
            setStoryIndex(groups[groupIndex - 1].stories.length - 1);
        }
    };

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
        onPanResponderGrant: () => setPaused(true),
        onPanResponderMove: () => {},
        onPanResponderRelease: (_, g) => {
            if (g.dy > 60) { onClose(); return; }
            setPaused(false);
        },
    })).current;

    if (!currentGroup || !currentStory) return null;

    const safeUri = (u) => {
        if (!u) return null;
        return u.startsWith('http://') ? u.replace('http://', 'https://') : u;
    };

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <StatusBar hidden />
            <View style={styles.container} {...panResponder.panHandlers}>
                {/* Background media */}
                {currentStory.mediaType === 'video' && safeUri(currentStory.mediaUrl) ? (
                    <Video
                        source={{ uri: safeUri(currentStory.mediaUrl) }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                        shouldPlay={!paused}
                        isLooping={false}
                    />
                ) : (
                    <Image
                        source={{ uri: safeUri(currentStory.mediaUrl) }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />
                )}

                {/* Dark gradient overlay */}
                <View style={styles.overlay} />

                {/* Progress bars */}
                <View style={styles.progressRow}>
                    {currentGroup.stories.map((_, i) => (
                        <View key={i} style={styles.progressTrack}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: i < storyIndex ? '100%'
                                            : i === storyIndex
                                                ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                                                : '0%'
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: safeUri(currentGroup.user.profilePicture) || 'https://via.placeholder.com/40' }}
                        style={styles.avatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.username}>{currentGroup.user.name}</Text>
                        <Text style={styles.timeAgo}>
                            {getTimeAgo(currentStory.createdAt)}
                        </Text>
                    </View>
                    {isOwn && (
                        <TouchableOpacity
                            onPress={() => {
                                storyService.deleteStory(currentStory._id).catch(() => {});
                                advance();
                            }}
                            style={styles.deleteBtn}
                        >
                            <Ionicons name="trash-outline" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={26} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tap zones */}
                <View style={styles.tapZones}>
                    <TouchableOpacity
                        style={styles.tapLeft}
                        onPress={goBack}
                        onLongPress={() => setPaused(true)}
                        onPressOut={() => setPaused(false)}
                        delayLongPress={150}
                    />
                    <TouchableOpacity
                        style={styles.tapRight}
                        onPress={advance}
                        onLongPress={() => setPaused(true)}
                        onPressOut={() => setPaused(false)}
                        delayLongPress={150}
                    />
                </View>
            </View>
        </Modal>
    );
}

const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    return `${h}h ago`;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    progressRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 50,
        gap: 4,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    progressTrack: {
        flex: 1,
        height: 2.5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 62,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        zIndex: 10,
    },
    avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
    username: { color: '#fff', fontWeight: '700', fontSize: 14 },
    timeAgo: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
    closeBtn: { padding: 6 },
    deleteBtn: { padding: 6, marginRight: 4 },
    tapZones: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        top: 120,
        zIndex: 5,
    },
    tapLeft: { flex: 1 },
    tapRight: { flex: 1 },
});
