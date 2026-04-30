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
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import { postService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Animated } from 'react-native';
import ManagedVideoView from '../../components/ManagedVideoView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const safeVideoUri = (uri) => {
    if (!uri || typeof uri !== 'string' || uri.trim() === '') return null;
    return uri.startsWith('http://') ? uri.replace('http://', 'https://') : uri;
};

const ReelItem = ({ item, isVisible, nearVisible, onUserBlocked }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(item.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = useState(item.likes?.length || 0);
    const lastTapRef = useRef(null);
    const videoUri = safeVideoUri(item.mediaUrl);
    const isOwnReel = item.userId?._id === user?._id;

    const handleReportReel = async () => {
        if (!item?._id || item._id === 'dummy') return;

        try {
            await postService.reportPost(item._id, {
                reason: 'inappropriate_content',
                details: 'Reported from reels'
            });
            Alert.alert('Reported', 'Thanks. We will review this content within 24 hours.');
        } catch (error) {
            console.error('Report reel error:', error);
            Alert.alert('Error', 'Failed to report this reel.');
        }
    };

    const handleBlockReelUser = () => {
        const targetUserId = item.userId?._id;
        if (!targetUserId) return;

        Alert.alert(
            'Block User',
            'Blocking this user will hide their content and prevent further interaction.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.blockUser(targetUserId, {
                                reason: 'abusive_user',
                                details: 'Blocked from reels'
                            });
                            onUserBlocked?.(targetUserId);
                            Alert.alert('Blocked', 'This user has been blocked.');
                        } catch (error) {
                            console.error('Block reel user error:', error);
                            Alert.alert('Error', 'Failed to block this user.');
                        }
                    }
                }
            ]
        );
    };

    const openReelMenu = () => {
        Alert.alert('Options', '', [
            { text: 'Report', onPress: handleReportReel },
            { text: 'Block User', style: 'destructive', onPress: handleBlockReelUser },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const heartScale = useRef(new Animated.Value(0)).current;
    const heartOpacity = useRef(new Animated.Value(0)).current;
    const isFocused = useIsFocused();


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
                {nearVisible && isFocused ? (
                    videoUri ? (
                        <ManagedVideoView
                            style={styles.video}
                            uri={videoUri}
                            contentFit="cover"
                            loop={false}
                            shouldPlay={isVisible}
                            isMuted={false}
                            nativeControls={false}
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
                        {item.userId?.profilePicture ? (
                            <Image source={{ uri: item.userId.profilePicture }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#555', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={18} color="#fff" />
                            </View>
                        )}
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
                    {!isOwnReel && (
                        <TouchableOpacity style={styles.sideButton} onPress={openReelMenu}>
                            <Ionicons name="ellipsis-horizontal" size={26} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};


export default function ReelsScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
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

    useEffect(() => {
        const defaultTabBarStyle = {
            backgroundColor: COLORS.white,
            borderTopWidth: 0,
            height: 62,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            position: 'absolute',
            bottom: 0,
        };

        navigation.setOptions({
            tabBarStyle: isFocused
                ? { ...defaultTabBarStyle, display: 'none' }
                : defaultTabBarStyle
        });
    }, [isFocused, navigation]);

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

    const handleUserBlocked = (blockedUserId) => {
        setReels(prev => prev.filter(reel => reel.userId?._id !== blockedUserId));
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Feed')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
                <Ionicons name="chevron-back" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <FlatList
                data={reels.length > 0 ? reels : [{ _id: 'dummy', content: 'Sample Reel' }]}
                renderItem={({ item, index }) => (
                    <View style={{ height: layoutHeight }}>
                        <ReelItem
                            item={item}
                            isVisible={index === visibleIndex}
                            nearVisible={index === visibleIndex}
                            onUserBlocked={handleUserBlocked}
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
                removeClippedSubviews={true}
                windowSize={2}
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
    backButton: {
        position: 'absolute',
        top: 14,
        left: 12,
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
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
