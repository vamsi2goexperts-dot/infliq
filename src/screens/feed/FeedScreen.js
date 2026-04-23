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
    Alert,
    Platform,
    Dimensions,
    Animated,
    ScrollView
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { postService, userService, chatService, storyService, mediaService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import Skeleton from '../../components/Skeleton';
import StoryViewer from '../../components/StoryViewer';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

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

const StoriesRail = ({ user, storyGroups = [], onAddStory, onViewStory }) => {
    const stories = [
        { id: 'me', isMe: true },
        ...storyGroups.map((g, i) => ({ ...g, id: g.user._id, groupIndex: i }))
    ];

    const renderStory = ({ item }) => {
        if (item.isMe) {
            return (
                <TouchableOpacity style={styles.storyItem} onPress={onAddStory}>
                    <View style={styles.storyRingContainer}>
                        <View style={[styles.storyRing, { borderColor: '#dbdbdb', borderWidth: 2 }]}>
                            <ResilientImage uri={user?.profilePicture} style={styles.storyAvatar} fallbackIcon="person" />
                            <View style={styles.addStoryBadge}>
                                <Ionicons name="add" size={12} color={COLORS.white} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.storyNameRow}>
                        <Text style={styles.storyName} numberOfLines={1}>Your Story</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        const hasUnviewed = item.hasUnviewed !== false;
        return (
            <TouchableOpacity style={styles.storyItem} onPress={() => onViewStory(item.groupIndex)}>
                <View style={styles.storyRingContainer}>
                    {hasUnviewed ? (
                        <LinearGradient
                            colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
                            style={styles.storyGradient}
                        >
                            <View style={styles.storyRingInner}>
                                <ResilientImage uri={item.user?.profilePicture} style={styles.storyAvatar} fallbackIcon="person" />
                            </View>
                        </LinearGradient>
                    ) : (
                        <View style={[styles.storyGradient, { backgroundColor: '#dbdbdb' }]}>
                            <View style={styles.storyRingInner}>
                                <ResilientImage uri={item.user?.profilePicture} style={styles.storyAvatar} fallbackIcon="person" />
                            </View>
                        </View>
                    )}
                </View>
                <View style={styles.storyNameRow}>
                    <Text style={styles.storyName} numberOfLines={1}>{item.user?.name || 'User'}</Text>
                    {item.user?.verified && (
                        <Ionicons name="checkmark-circle" size={10} color={COLORS.royalBlue} style={{ marginLeft: 2 }} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

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

const PostItem = ({ item, user, navigation, handleFollow, handleChat, isVisible, onOpenModerationMenu }) => {
    const postUser = item.userId || {};
    const likesCount = item.likes ? item.likes.length : 0;
    const isFollowing = user?.following?.includes(postUser._id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(item.likes?.includes(user?._id));
    const heartOpacity = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(0.5)).current;
    const lastTapRef = useRef(null);

    const isFocused = useIsFocused();
    const isVideo = item.mediaType === 'video' || item.type === 'reel';
    const videoRef = useRef(null);
    const shouldRenderVideo = isVideo && isFocused && isVisible;

    useEffect(() => {
        if (!isVisible && isPlaying) {
            setIsPlaying(false);
            videoRef.current?.pauseAsync();
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
            if (shouldRenderVideo) {
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

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {user?._id !== postUser._id && (
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing && styles.followingButton]}
                            onPress={() => handleFollow(postUser._id)}
                            disabled={isFollowing}
                        >
                            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {user?._id !== postUser._id && (
                        <TouchableOpacity
                            onPress={() => onOpenModerationMenu?.(item)}
                            style={styles.moreButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.black} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity
                activeOpacity={1}
                onPress={handleDoubleTap}
                style={styles.mediaContainer}
            >
                {isVideo ? (
                    shouldRenderVideo ? (
                        <>
                            <Video
                                ref={videoRef}
                                source={{ uri: item.mediaUrl }}
                                style={styles.postImage}
                                resizeMode="cover"
                                isMuted={false}
                                shouldPlay={isVisible && isFocused}
                                isLooping={false}
                                usePoster
                                posterSource={{ uri: item.mediaUrl }}
                                posterStyle={styles.postImage}
                                initialStatus={{ positionMillis: 0 }}
                                onError={(error) => {
                                    console.warn('Feed video error:', error);
                                }}
                            />
                            {(!isPlaying && !shouldRenderVideo) && (
                                <View style={styles.playIconOverlay}>
                                    <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={[styles.postImage, styles.videoFallback]}>
                            <Ionicons name="videocam-outline" size={52} color="rgba(255,255,255,0.45)" />
                            <Text style={styles.videoFallbackText}>Video preview</Text>
                        </View>
                    )
                ) : (
                    <ResilientImage
                        uri={item.mediaUrl}
                        style={styles.postImage}
                        fallbackIcon="image"
                    />
                )}

                <Animated.View style={[
                    styles.heartOverlay,
                    { opacity: heartOpacity, transform: [{ scale: heartScale }] }
                ]}>
                    <Ionicons name="heart" size={80} color={COLORS.white} />
                </Animated.View>

                <TouchableOpacity style={styles.locationTag}>
                    <Ionicons name="location-sharp" size={12} color={COLORS.white} />
                </TouchableOpacity>
            </TouchableOpacity>

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
                <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={26} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <View style={styles.likesContainer}>
                <Text style={styles.likesText}>{likesCount} likes</Text>
            </View>

            {item.content && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                    <Text numberOfLines={2}>
                        <Text style={{ fontWeight: 'bold' }}>{postUser.name} </Text>
                        <Text>{item.content}</Text>
                    </Text>
                </View>
            )}
        </View>
    );
};

export default function FeedScreen({ navigation }) {
    const { user, setAuthSession, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [storyGroups, setStoryGroups] = useState([]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerStartGroup, setViewerStartGroup] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isScreenFocused = useIsFocused();

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
            const currentFollowing = user.following || [];
            if (!currentFollowing.includes(userId)) {
                const updatedUser = { ...user, following: [...currentFollowing, userId] };
                setAuthSession(updatedUser, token);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const handleReportPost = async (post) => {
        try {
            await postService.reportPost(post._id, {
                reason: 'inappropriate_content',
                details: 'Reported from feed'
            });
            Alert.alert('Reported', 'Thanks. We will review this post.');
        } catch (error) {
            console.error('Report post error:', error);
            Alert.alert('Error', 'Failed to report post.');
        }
    };

    const handleBlockUser = async (post) => {
        const targetUserId = post.userId?._id;
        if (!targetUserId) return;

        Alert.alert(
            'Block User',
            'Blocking this user will remove their content from your feed immediately.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.blockUser(targetUserId, {
                                reason: 'abusive_user',
                                details: 'Blocked from feed'
                            });
                            setPosts(prev => prev.filter(p => p.userId?._id !== targetUserId));
                            setStoryGroups(prev => prev.filter(g => g.user?._id !== targetUserId));
                            Alert.alert('Blocked', 'Their content has been removed from your feed.');
                        } catch (error) {
                            console.error('Block user error:', error);
                            Alert.alert('Error', 'Failed to block user.');
                        }
                    }
                }
            ]
        );
    };

    const openModerationMenu = (post) => {
        Alert.alert(
            'Post Options',
            'Choose an action',
            [
                { text: 'Report Post', onPress: () => handleReportPost(post) },
                { text: 'Block User', style: 'destructive', onPress: () => handleBlockUser(post) },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    useEffect(() => {
        if (isScreenFocused) {
            fetchPosts(1, true);
            fetchStories();
        }
    }, [isScreenFocused]);

    const fetchStories = async () => {
        try {
            const data = await storyService.getFeed();
            setStoryGroups(data.groups || []);
        } catch (e) {
            // silently ignore — stories are not critical
        }
    };

    const handleAddStory = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photo library to add a story.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 0.85,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];
            const mediaType = asset.type === 'video' ? 'video' : 'image';

            const uploaded = await mediaService.uploadMedia({
                uri: asset.uri,
                type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
                fileName: asset.fileName || (mediaType === 'video' ? 'story.mp4' : 'story.jpg'),
            });

            await storyService.createStory(uploaded.url, mediaType);
            await fetchStories();
        } catch (e) {
            Alert.alert('Error', 'Failed to add story. Please try again.');
        }
    };

    const handleViewStory = (groupIndex) => {
        setViewerStartGroup(groupIndex);
        setViewerVisible(true);
    };

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
        await Promise.all([fetchPosts(1, true), fetchStories()]);
    };

    const handleChat = async (targetUser) => {
        try {
            const chats = await chatService.getChats();
            const existingChat = chats.find(c =>
                c.participants.some(p => p._id === targetUser._id)
            );

            if (existingChat) {
                navigation.navigate('ChatDetail', { chatId: existingChat._id, otherUser: targetUser });
            } else {
                const newChat = await chatService.createChat('chat', [targetUser._id]);
                navigation.navigate('ChatDetail', { chatId: newChat._id, otherUser: targetUser });
            }
        } catch (error) {
            console.error('Chat error:', error);
        }
    };

    const renderPost = ({ item }) => (
        <PostItem
            item={item}
            user={user}
            navigation={navigation}
            handleFollow={handleFollow}
            handleChat={handleChat}
            isVisible={viewableItems.includes(item._id)}
            onOpenModerationMenu={openModerationMenu}
        />
    );

    return (
        <View style={styles.container}>
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

            {loading ? (
                <FeedSkeleton />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={
                        <StoriesRail
                            user={user}
                            storyGroups={storyGroups}
                            onAddStory={handleAddStory}
                            onViewStory={handleViewStory}
                        />
                    }
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

            {viewerVisible && storyGroups.length > 0 && (
                <StoryViewer
                    groups={storyGroups}
                    startGroupIndex={viewerStartGroup}
                    onClose={() => {
                        setViewerVisible(false);
                        fetchStories();
                    }}
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
        fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto'
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
    moreButton: {
        padding: 6,
        borderRadius: 16
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
        height: width * 1.25,
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
    },
    videoFallback: {
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoFallbackText: {
        marginTop: 10,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600'
    }
});
