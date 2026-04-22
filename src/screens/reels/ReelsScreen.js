import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import { postService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const safeVideoUri = (uri) => {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') return null;
    return uri.startsWith('http://') ? uri.replace('http://', 'https://') : uri;
};

const ReelItem = ({ item, isVisible, nearVisible, index }) => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});
    const [videoError, setVideoError] = useState(false);
    const [isLiked, setIsLiked] = useState(item.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = useState(item.likes?.length || 0);
    const lastTapRef = useRef(null);
    const videoUri = safeVideoUri(item.mediaUrl);

    // Animation states
    const heartScale = useRef(new Animated.Value(0)).current;
    const heartOpacity = useRef(new Animated.Value(0)).current;
    const isFocused = useIsFocused();

    // Imperative Playback Control
    useEffect(() => {
        const itemActive = isVisible && isFocused && !!videoUri && !videoError;
        if (videoRef.current) {
            if (itemActive) {
                console.log(`▶️ PLAY request for Index ${index}`);
                videoRef.current.setIsMutedAsync(false).catch(() => { });
                videoRef.current.playAsync().catch(e => {
                    if (e.message && (e.message.includes('interrupted') || e.message.includes('removed'))) return;
                    console.log('Play error:', e);
                });
            } else {
                videoRef.current.pauseAsync().catch(() => { });
            }
        }

        return () => {
            if (videoRef.current) {
                console.log(`Cleanup for Index ${index}`);
                videoRef.current.pauseAsync().catch(() => { });
            }
        };
    }, [isVisible, isFocused, index, videoUri, videoError]);

    const animateHeart = () => {
        heartScale.setValue(0.5);
        heartOpacity.setValue(1);
        Animated.parallel([
            Animated.spring(heartScale, {
                toValue: 1.2,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(500),
                Animated.timing(heartOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
            if (!isLiked) {
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
                handleLikeAction();
            }
            animateHeart();
        } else {
            lastTapRef.current = now;
        }
    };

    const handleLikeAction = async () => {
        try {
            await postService.likePost(item._id);
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setIsLiked(prev => !prev);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const toggleLike = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        handleLikeAction();
    };

    return (
        <View style={styles.reelContainer}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleDoubleTap}
                style={StyleSheet.absoluteFill}
            >
                {nearVisible ? (
                    videoUri && !videoError ? (
                        <Video
                            ref={videoRef}
                            style={styles.video}
                            source={{ uri: videoUri }}
                            resizeMode="cover"
                            isLooping
                            shouldPlay={false}
                            isMuted={false}
                            onPlaybackStatusUpdate={s => {
                                if (s.error && !videoError) {
                                    console.warn(`[ReelItem ${index}] Playback error:`, s.error);
                                    setVideoError(true);
                                }
                                setStatus(() => s);
                            }}
                        />
                    ) : (
                        <View style={[styles.video, styles.videoFallback]}>
                            <Ionicons name="videocam-off-outline" size={48} color="rgba(255,255,255,0.4)" />
                        </View>
                    )
                ) : (
                    <View style={[styles.video, { backgroundColor: '#000' }]} />
                )}
            </TouchableOpacity>

            {/* Pulsing Heart Animation Overlay */}
            <Animated.View style={[
                styles.heartOverlay,
                {
                    opacity: heartOpacity,
                    transform: [{ scale: heartScale }]
                }
            ]}>
                <Ionicons name="heart" size={80} color={COLORS.white} />
            </Animated.View>

            {/* Overlays */}
            <View style={styles.overlay} pointerEvents="box-none">
                <View style={styles.leftColumn}>
                    <View style={styles.userRow}>
                        <Image
                            source={{ uri: item.userId?.profilePicture || 'https://via.placeholder.com/40' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.username}>{item.userId?.name || 'User'}</Text>
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followText}>Follow</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.caption} numberOfLines={2}>
                        {item.content || 'Video from Infliq...'}
                    </Text>
                </View>

                <View style={styles.rightColumn}>
                    <TouchableOpacity style={styles.sideButton} onPress={toggleLike}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={35}
                            color={isLiked ? '#FF3131' : COLORS.white}
                        />
                        <Text style={styles.sideText}>{likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sideButton}>
                        <Ionicons name="chatbubble-outline" size={30} color={COLORS.white} />
                        <Text style={styles.sideText}>{item.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sideButton}>
                        <Ionicons name="share-social-outline" size={30} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


export default function ReelsScreen() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [visibleIndex, setVisibleIndex] = useState(0);
    const [layoutHeight, setLayoutHeight] = useState(SCREEN_HEIGHT - 60);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadReels();
    }, []);

    const loadReels = async (pageToLoad = 1) => {
        if (pageToLoad > 1) setLoadingMore(true);
        try {
            const response = await postService.getReels(pageToLoad, 10);
            const newReels = response.reels || [];

            if (pageToLoad === 1) {
                setReels(newReels);
            } else {
                setReels(prev => [...prev, ...newReels]);
            }

            setHasMore(response.hasMore || false);
            setPage(pageToLoad);
        } catch (error) {
            console.error('Failed to load reels:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore && !loading) {
            loadReels(page + 1);
        }
    };

    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0) {
            console.log('📏 Reels layout height:', height);
            setLayoutHeight(height);
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.white} />
            </View>
        );
    }

    return (
        <View style={styles.container} onLayout={onLayout}>
            <FlatList
                data={reels.length > 0 ? reels : [{ _id: 'dummy', content: 'Sample Reel' }]}
                renderItem={({ item, index }) => (
                    <View style={{ height: layoutHeight }}>
                        <ReelItem
                            item={item}
                            isVisible={index === visibleIndex}
                            nearVisible={Math.abs(index - visibleIndex) <= 1}
                            index={index}
                        />
                    </View>
                )}
                keyExtractor={item => item._id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={layoutHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / layoutHeight);
                    if (index !== visibleIndex && index >= 0 && index < reels.length) {
                        console.log('🔄 Index change:', index);
                        setVisibleIndex(index);
                    }
                }}
                scrollEventThrottle={16}
                extraData={visibleIndex}
                removeClippedSubviews={false}
                windowSize={3}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={3}
                ListFooterComponent={loadingMore ? (
                    <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={COLORS.white} />
                    </View>
                ) : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reelContainer: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    videoFallback: {
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 24,
        flexDirection: 'row',
    },
    leftColumn: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    username: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    followButton: {
        marginLeft: 15,
        borderWidth: 1,
        borderColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    followText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    caption: {
        color: COLORS.white,
        fontSize: 14,
    },
    rightColumn: {
        width: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sideButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sideText: {
        color: COLORS.white,
        fontSize: 14,
        marginTop: 5,
        fontWeight: '600',
    },
    heartOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -40,
        zIndex: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
        pointerEvents: 'none' // Ensure touches pass through
    }
});
