import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Platform,
    StatusBar,
    Dimensions,
    Animated,
    ScrollView
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { postService, userService, chatService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/Skeleton';

const { width } = Dimensions.get('window');

// --- Mock Data for Stories ---
const MOCK_STORIES = [
    { id: 'me', name: 'Your Story', image: 'https://randomuser.me/api/portraits/women/44.jpg', isUser: true },
    { id: 's1', name: 'elonmusk', image: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg', verified: true, hasStory: true },
    { id: 's2', name: 'aoc', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Alexandria_Ocasio-Cortez_Official_Portrait.jpg/800px-Alexandria_Ocasio-Cortez_Official_Portrait.jpg', verified: true, hasStory: true },
    { id: 's3', name: 'timcook', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Tim_Cook_2009_headshot.jpg', verified: true, hasStory: true },
    { id: 's4', name: 'oprah', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Oprah_Winfrey_in_2014.jpg', verified: true, hasStory: true },
    { id: 's5', name: 'billgates', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg', verified: true, hasStory: true }
];

// --- Mock Data for Feed Posts ---
const STATIC_POSTS = [
    {
        _id: 'post-1',
        userId: {
            _id: 'u1',
            name: 'Aarav Mehta',
            profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
            location: 'Mumbai, India'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        content: 'Sunset sessions, city lights, and a little bit of chaos in between.',
        likes: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'],
        comments: [{}, {}, {}],
        createdAt: '2026-03-31T17:30:00.000Z'
    },
    {
        _id: 'post-2',
        userId: {
            _id: 'u2',
            name: 'Maya Kapoor',
            profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
            location: 'Bengaluru, India'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        content: 'Working on fresh campaign concepts for creator launches this week.',
        likes: ['u1', 'u3', 'u4', 'u10', 'u11', 'u12'],
        comments: [{}, {}],
        createdAt: '2026-03-31T11:15:00.000Z'
    },
    {
        _id: 'post-3',
        userId: {
            _id: 'u3',
            name: 'Rohan Verma',
            profilePicture: 'https://randomuser.me/api/portraits/men/75.jpg',
            location: 'Hyderabad, India'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        content: 'Weekend ride with the crew. Good roads, better stories.',
        likes: ['u1', 'u2', 'u4', 'u5', 'u6'],
        comments: [{}],
        createdAt: '2026-03-30T08:45:00.000Z'
    }
];

const ResilientImage = ({ uri, style, fallbackIcon = 'person', fallbackLabel = null, imageMode = 'cover' }) => {
    const [failed, setFailed] = useState(false);
    const flattenedStyle = StyleSheet.flatten(style) || {};
    const fallbackSize = typeof flattenedStyle.width === 'number'
        ? Math.min(flattenedStyle.width * 0.45, 44)
        : 28;

    if (!uri || failed) {
        return (
            <View style={[style, styles.imageFallback]}>
                <Ionicons name={fallbackIcon} size={fallbackSize} color={COLORS.mediumGray} />
                {fallbackLabel ? <Text style={styles.imageFallbackLabel}>{fallbackLabel}</Text> : null}
            </View>
        );
    }

    return (
        <Image
            source={{ uri }}
            style={style}
            resizeMode={imageMode}
            onError={() => setFailed(true)}
        />
    );
};

const StoriesRail = () => {
    const { user } = useAuth();

    // Update "Your Story" with real user data
    const stories = [
        {
            id: 'me',
            name: 'Your Story',
            image: user?.profilePicture || 'https://via.placeholder.com/60',
            isUser: true
        },
        ...MOCK_STORIES.filter(s => !s.isUser)
    ];

    const renderStory = ({ item }) => (
        <TouchableOpacity style={styles.storyItem}>
            <View style={styles.storyRingContainer}>
                {item.isUser ? (
                    <View style={[styles.storyRing, { borderColor: COLORS.lightGray, borderWidth: 2 }]}>
                        <ResilientImage uri={item.image} style={styles.storyAvatar} fallbackIcon="person" />
                        <View style={styles.addStoryBadge}>
                            <Ionicons name="add" size={12} color={COLORS.white} />
                        </View>
                    </View>
                ) : (
                    <LinearGradient
                        colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']} // Insta-like gradient
                        style={styles.storyGradient}
                    >
                        <View style={styles.storyRingInner}>
                            <ResilientImage uri={item.image} style={styles.storyAvatar} fallbackIcon="person" />
                        </View>
                    </LinearGradient>
                )}
            </View>
            <View style={styles.storyNameRow}>
                <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
                {item.verified && (
                    <Ionicons name="checkmark-circle" size={10} color={COLORS.royalBlue} style={{ marginLeft: 2 }} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.storiesContainer}>
            <FlatList
                horizontal
                data={stories}
                renderItem={renderStory}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesList}
            />
        </View>
    );
};

const FeedSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Stories Skeleton */}
            <View style={styles.storiesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesList}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <View key={i} style={styles.storyItem}>
                            <Skeleton width={68} height={68} borderRadius={34} />
                            <Skeleton width={50} height={10} style={{ marginTop: 8 }} />
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Post Skeleton */}
            {[1, 2].map((i) => (
                <View key={i} style={styles.postCard}>
                    <View style={styles.postHeader}>
                        <View style={styles.postUserRow}>
                            <Skeleton width={32} height={32} borderRadius={16} />
                            <View style={{ marginLeft: 10 }}>
                                <Skeleton width={100} height={12} />
                                <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
                            </View>
                        </View>
                    </View>
                    <Skeleton width={width} height={width * 1.25} borderRadius={0} />
                </View>
            ))}
        </View>
    );
};

const PostItem = ({ item, user, navigation, handleFollow, handleChat, isVisible }) => {
    const postUser = item.userId || {};
    const likesCount = item.likes ? item.likes.length : 0;
    const isFollowing = user?.following?.includes(postUser._id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(item.likes?.includes(user?._id));
    const heartOpacity = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(0.5)).current;
    const lastTapRef = useRef(null);
    const videoRef = useRef(null);

    // Auto-pause when scrolled out of view
    useEffect(() => {
        if (!isVisible && isPlaying) {
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pauseAsync();
            }
        }
    }, [isVisible]);

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
                handleLike(item._id);
            }
            animateHeart();
        } else {
            lastTapRef.current = now;
            // Toggle play on single tap if it's a video
            if (item.mediaType === 'video' || item.type === 'reel') {
                if (isPlaying) {
                    videoRef.current?.pauseAsync();
                    setIsPlaying(false);
                } else {
                    videoRef.current?.playAsync();
                    setIsPlaying(true);
                }
            }
        }
    };

    const handleLike = async (postId) => {
        try {
            await postService.likePost(postId);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    return (
        <View style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <TouchableOpacity
                    style={styles.postUserRow}
                    onPress={() => {
                        if (postUser._id === user?._id) {
                            navigation.navigate('Main', { screen: 'Profile' });
                        } else {
                            navigation.navigate('UserProfile', { userId: postUser._id });
                        }
                    }}
                >
                    <ResilientImage
                        uri={postUser.profilePicture}
                        style={styles.postAvatar}
                        fallbackIcon="person"
                    />
                    <View>
                        <Text style={styles.postUsername}>{postUser.name || 'Unknown User'}</Text>
                        {postUser.location && (
                            <Text style={styles.postLocation}>
                                {typeof postUser.location === 'string' ? postUser.location : 'Global'}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Follow and Chat Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {user?._id !== postUser._id && (
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                isFollowing && styles.followingButton
                            ]}
                            onPress={() => handleFollow(postUser._id)}
                            disabled={isFollowing}
                        >
                            <Text style={[
                                styles.followButtonText,
                                isFollowing && styles.followingButtonText
                            ]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Post Media */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleDoubleTap}
                style={styles.mediaContainer}
            >
                {(item.mediaType === 'video' || item.type === 'reel') ? (
                    <>
                        <Video
                            ref={videoRef}
                            source={{ uri: item.mediaUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                            isMuted={false}
                            isLooping
                            initialStatus={{ positionMillis: 100 }} // Preview frame
                            onPlaybackStatusUpdate={(status) => {
                                if (status.didJustFinish && !status.isLooping) {
                                    setIsPlaying(false);
                                }
                            }}
                        />
                        {/* Play Button Overlay */}
                        {!isPlaying && (
                            <View style={styles.playIconOverlay}>
                                <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
                            </View>
                        )}
                    </>
                ) : (
                    <ResilientImage
                        uri={item.mediaUrl}
                        style={styles.postImage}
                        fallbackIcon="image-outline"
                        fallbackLabel="Image unavailable"
                    />
                )}

                {/* Animated Heart Overlay */}
                <Animated.View style={[
                    styles.heartOverlay,
                    {
                        opacity: heartOpacity,
                        transform: [{ scale: heartScale }]
                    }
                ]}>
                    <Ionicons name="heart" size={80} color={COLORS.white} />
                </Animated.View>

                {/* Location Tag Overlay */}
                <TouchableOpacity style={styles.locationTag}>
                    <Ionicons name="location-sharp" size={12} color={COLORS.white} />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionRow}>
                <View style={styles.actionLeft}>
                    <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => {
                            setIsLiked(!isLiked);
                            handleLike(item._id);
                        }}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? "#FF3B30" : COLORS.black}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="chatbubble-outline" size={26} color={COLORS.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="paper-plane-outline" size={26} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
                {/* Bookmark */}
                <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={26} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            {/* Likes count */}
            <View style={styles.likesContainer}>
                <Text style={styles.likesText}>{likesCount} likes</Text>
            </View>

            {/* Caption */}
            {
                item.content && (
                    <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                        <Text numberOfLines={2}>
                            <Text style={{ fontWeight: 'bold' }}>{postUser.name} </Text>
                            <Text>{item.content}</Text>
                        </Text>
                    </View>
                )
            }
        </View >
    );
};

export default function FeedScreen({ navigation }) {
    const { user, setAuthSession, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [viewableItems, setViewableItems] = useState([]);
    const viewabilityConfigCallbackPairs = useRef([
        {
            viewabilityConfig: { itemVisiblePercentThreshold: 50 },
            onViewableItemsChanged: ({ viewableItems }) => {
                setViewableItems(viewableItems.map(item => item.item._id));
            }
        }
    ]);

    const handleFollow = async (userId) => {
        try {
            await userService.followUser(userId);

            // Optimistically update local user state
            const currentFollowing = user.following || [];
            if (!currentFollowing.includes(userId)) {
                const updatedUser = {
                    ...user,
                    following: [...currentFollowing, userId]
                };
                setAuthSession(updatedUser, token);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (pageToLoad = 1, isRefreshing = false) => {
        if (pageToLoad > 1) setLoadingMore(true);
        try {
            const data = await postService.getFeed(pageToLoad, 10);
            const newPosts = data.posts || [];
            const postsToUse = newPosts.length > 0 ? newPosts : STATIC_POSTS;

            if (isRefreshing || pageToLoad === 1) {
                setPosts(postsToUse);
            } else {
                setPosts(prev => [...prev, ...postsToUse]);
            }

            setHasMore(newPosts.length > 0 ? (data.hasMore || false) : false);
            setPage(pageToLoad);
        } catch (error) {
            console.error('Error fetching feed:', error);
            if (pageToLoad === 1) {
                setPosts(STATIC_POSTS);
                setHasMore(false);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore && !loading) {
            fetchPosts(page + 1);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setHasMore(true);
        await fetchPosts(1, true);
    };

    const handleChat = async (targetUser) => {
        try {
            // Check for existing chat
            const chats = await chatService.getChats();
            const existingChat = chats.find(c =>
                c.participants.some(p => p._id === targetUser._id)
            );

            if (existingChat) {
                navigation.navigate('ChatDetail', {
                    chatId: existingChat._id,
                    otherUser: targetUser
                });
            } else {
                // Create new chat
                const newChat = await chatService.createChat('chat', [targetUser._id]);
                navigation.navigate('ChatDetail', {
                    chatId: newChat._id,
                    otherUser: targetUser
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            // Alert.alert('Error', 'Failed to open chat');
        }
    };

    const renderPost = ({ item }) => {
        return (
            <PostItem
                item={item}
                user={user}
                navigation={navigation}
                handleFollow={handleFollow}
                handleChat={handleChat}
                isVisible={viewableItems.includes(item._id)}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('Messages')}
                >
                    <Ionicons name="chatbubbles-outline" size={24} color={COLORS.royalBlue} />
                </TouchableOpacity>

                <Text style={styles.logo}>INFLIQ</Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, styles.searchButton]}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Ionicons name="search" size={20} color={COLORS.royalBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <ResilientImage
                            uri={user?.profilePicture}
                            style={styles.headerAvatar}
                            fallbackIcon="person"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Feed List */}
            {loading ? (
                <FeedSkeleton />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={<StoriesRail />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                    ListFooterComponent={loadingMore ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={COLORS.royalBlue} />
                        </View>
                    ) : null}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.darkGray }}>No posts yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto' // Simple bold sans
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0
    },
    searchButton: {
        marginRight: 10
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    // Stories
    storiesContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    storiesList: {
        paddingHorizontal: 16
    },
    storyItem: {
        alignItems: 'center',
        marginRight: 16,
        width: 70
    },
    storyRingContainer: {
        marginBottom: 4
    },
    storyGradient: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    storyRingInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center'
    },
    storyAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    imageFallback: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    imageFallbackLabel: {
        marginTop: 6,
        fontSize: 11,
        color: COLORS.darkGray,
        fontWeight: '600',
        textAlign: 'center'
    },
    addStoryBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.royalBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white
    },
    storyNameRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    storyName: {
        fontSize: 11,
        color: COLORS.black,
        marginTop: 2,
        maxWidth: 60,
        textAlign: 'center'
    },
    // Post
    postCard: {
        marginBottom: 10
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10
    },
    postUserRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    followButton: {
        backgroundColor: COLORS.royalBlue,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#dbdbdb'
    },
    followButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold'
    },
    followingButtonText: {
        color: COLORS.black
    },
    postAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        backgroundColor: '#eee'
    },
    postUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black
    },
    postLocation: {
        fontSize: 11,
        color: COLORS.darkGray
    },
    mediaContainer: {
        width: width,
        height: width * 1.25, // 4:5 aspect ratio
        backgroundColor: '#f0f0f0',
        position: 'relative'
    },
    postImage: {
        width: '100%',
        height: '100%'
    },
    locationTag: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionIcon: {
        marginRight: 16
    },
    likesContainer: {
        paddingHorizontal: 12,
        paddingBottom: 10
    },
    likesText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black
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
    },
    playIconOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -32,
        marginLeft: -32,
        zIndex: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
