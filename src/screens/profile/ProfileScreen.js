import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Platform,
    StatusBar,
    Alert,
    Animated,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import { userService, postService, chatService } from '../../services/api';
import CallButton from '../../components/calls/CallButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import VideoThumbnail from '../../components/VideoThumbnail';

const safeUri = (uri) => {
    if (!uri) return null;
    // Production Android blocks http:// — upgrade to https:// for any Render/backend URLs
    if (uri.startsWith('http://')) return uri.replace('http://', 'https://');
    return uri;
};

const GridImage = ({ uri, style }) => {
    const [failed, setFailed] = useState(false);
    const safe = safeUri(uri);
    if (!safe || failed) {
        return (
            <View style={[style, styles.mediaFallback]}>
                <Ionicons name="image-outline" size={24} color={COLORS.mediumGray} />
            </View>
        );
    }
    return (
        <Image
            source={{ uri: safe }}
            style={style}
            onError={(e) => {
                console.warn('[GridImage] load failed:', safe, e.nativeEvent?.error);
                setFailed(true);
            }}
        />
    );
};

const STATIC_NOTIFICATIONS = [
    { id: 'n1', title: 'AOC liked your post', subtitle: '2m ago', action: 'profile' },
    { id: 'n2', title: '3 new message requests', subtitle: 'Open inbox', action: 'messages' },
    { id: 'n3', title: 'Trending: #AICreators', subtitle: 'Tap to explore', action: 'search' },
];

export default function ProfileScreen({ route, navigation }) {
    const { user: currentUser, logout: authLogout, setAuthSession, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('grid');
    const [showNotifications, setShowNotifications] = useState(false);
    const userId = route?.params?.userId;
    const [imageError, setImageError] = useState(false);
    const isOwnProfile = !userId || userId === currentUserId;
    const blinkAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isOwnProfile) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: false,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    Animated.timing(blinkAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: false,
                        easing: Easing.inOut(Easing.ease)
                    })
                ])
            ).start();
        }
    }, [isOwnProfile]);

    const highlightColor = blinkAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0, 102, 255, 0)', 'rgba(0, 102, 255, 0.2)']
    });

    const borderColor = blinkAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', COLORS.royalBlue]
    });

    useFocusEffect(
        React.useCallback(() => {
            loadProfile();
            loadPosts();
        }, [userId])
    );

    const loadProfile = async () => {
        try {
            setLoading(true);
            setImageError(false);
            const myUserId = await AsyncStorage.getItem('userId');
            setCurrentUserId(myUserId);

            const targetUserId = userId || myUserId;
            const response = await userService.getProfile(targetUserId);
            // Handle both {user: ...} wrap and direct user object
            setProfile(response.user || response);
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPosts = async () => {
        try {
            const myUserId = await AsyncStorage.getItem('userId');
            const targetUserId = userId || myUserId;
            const response = await postService.getUserPosts(targetUserId);
            const posts = response.posts || [];
            setPosts(posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    };

    const onRefresh = async () => {
        await loadProfile();
        await loadPosts();
    };

    const handleBlockFromProfile = () => {
        Alert.alert(
            'Block User',
            `Block ${profile?.name}? Their content will no longer appear for you.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.blockUser(profile._id, { reason: 'Blocked from profile' });
                            Alert.alert('Blocked', 'User has been blocked.');
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to block user.');
                        }
                    }
                }
            ]
        );
    };

    const handleReportFromProfile = async () => {
        if (!profile?._id) return;

        try {
            await userService.reportUser(profile._id, {
                reason: 'abusive_user',
                details: 'Reported from profile'
            });
            Alert.alert('Reported', 'Thanks. We will review this account within 24 hours.');
        } catch (e) {
            Alert.alert('Error', 'Failed to report this user.');
        }
    };

    const openProfileMenu = () => {
        Alert.alert(
            profile?.name || 'User',
            '',
            [
                { text: 'Report User', onPress: handleReportFromProfile },
                { text: 'Block User', style: 'destructive', onPress: handleBlockFromProfile },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authLogout();
                            // AppNavigator will automatically handle navigation back to Login
                            // because it listens to the 'user' state in AuthContext
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.royalBlue} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Profile not found</Text>
            </View>
        );
    }

    const isFollowing = currentUser?.following?.includes(profile._id);
    const profileUri = imageError ? null : safeUri(profile.profilePicture);

    const handleFollow = async () => {
        try {
            await userService.followUser(profile._id);

            // Optimistic update for currentUser in Context
            const currentFollowing = currentUser.following || [];
            if (!currentFollowing.includes(profile._id)) {
                const updatedCurrentUser = {
                    ...currentUser,
                    following: [...currentFollowing, profile._id]
                };
                setAuthSession(updatedCurrentUser, token);
            }

            // Optimistic update for displayed profile followers count
            setProfile(prev => ({
                ...prev,
                followers: [...(prev.followers || []), currentUser._id]
            }));

        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const handleMessage = async () => {
        try {
            // Find existing chat or create new one
            const response = await chatService.createChat('chat', [profile._id]);
            // The response might be { chat: { ... } } or just the chat object
            const chatId = response.chat?._id || response._id;

            navigation.navigate('ChatDetail', {
                chatId,
                otherUser: profile
            });
        } catch (error) {
            console.error('Chat creation error:', error);
            Alert.alert('Error', 'Failed to start chat');
        }
    };

    const handleNotificationPress = (notification) => {
        setShowNotifications(false);

        if (notification.action === 'messages') {
            navigation.navigate('Messages');
            return;
        }

        if (notification.action === 'search') {
            navigation.navigate('Search');
            return;
        }
    };

    const renderGridItem = ({ item }) => {
        const isVideo = item.mediaType === 'video' || item.type === 'reel';
        const mediaUri = safeUri(item.mediaUrl);

        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => navigation.navigate('PostDetail', { post: item })}
            >
                {isVideo ? (
                    <VideoThumbnail uri={mediaUri} style={styles.gridImage} />
                ) : (
                    <GridImage uri={item.mediaUrl} style={styles.gridImage} />
                )}
                {item.type === 'reel' && (
                    <View style={styles.reelBadge}>
                        <Ionicons name="videocam" size={14} color={COLORS.white} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const filteredPosts = activeTab === 'grid'
        ? posts
        : activeTab === 'reels'
            ? posts.filter(p => p.type === 'reel')
            : [];

    return (
        <View style={styles.container}>
            {/* Real Header */}
            <View style={styles.topHeader}>
                <View style={styles.headerLeft}>
                    {!isOwnProfile && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={26} color={COLORS.black} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.usernameContainer}>
                        <Text style={styles.headerUsername}>{profile.name?.toLowerCase() || 'user'}</Text>
                        <Ionicons name="chevron-down" size={18} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={[styles.headerIcon, styles.notificationIcon]}
                        onPress={() => setShowNotifications(prev => !prev)}
                    >
                        <Ionicons name="notifications-outline" size={26} color={COLORS.black} />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>{STATIC_NOTIFICATIONS.length}</Text>
                        </View>
                    </TouchableOpacity>
                    {isOwnProfile ? (
                        <TouchableOpacity
                            style={styles.headerIcon}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={26} color={COLORS.black} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.headerIcon}
                            onPress={openProfileMenu}
                        >
                            <Ionicons name="ellipsis-horizontal" size={26} color={COLORS.black} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showNotifications && (
                <View style={styles.notificationsPanel}>
                    <View style={styles.notificationsHeader}>
                        <Text style={styles.notificationsTitle}>Notifications</Text>
                        <Text style={styles.notificationsCount}>{STATIC_NOTIFICATIONS.length} new</Text>
                    </View>
                    {STATIC_NOTIFICATIONS.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={styles.notificationItem}
                            onPress={() => handleNotificationPress(notification)}
                        >
                            <View style={styles.notificationIconWrap}>
                                <Ionicons name="sparkles-outline" size={18} color={COLORS.royalBlue} />
                            </View>
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationTitle}>{notification.title}</Text>
                                <Text style={styles.notificationSubtitle}>{notification.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.mediumGray} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <FlatList
                data={filteredPosts}
                renderItem={renderGridItem}
                keyExtractor={item => item._id}
                numColumns={3}
                onRefresh={onRefresh}
                refreshing={false}
                ListHeaderComponent={
                    <View>
                        {/* Profile Info Section */}
                        <View style={styles.profileInfoSection}>
                            <View style={styles.profileRow}>
                                <View style={styles.imageContainer}>
                                    {profileUri ? (
                                        <Image
                                            source={{ uri: profileUri }}
                                            style={styles.profileImage}
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <View style={[styles.profileImage, styles.profileImageFallback]}>
                                            <Ionicons name="person" size={34} color={COLORS.mediumGray} />
                                        </View>
                                    )}
                                    {isOwnProfile && (
                                        <TouchableOpacity style={styles.addIconSmall}>
                                            <Ionicons name="add" size={14} color={COLORS.white} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{posts.length}</Text>
                                        <Text style={styles.statLabel}>posts</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{profile.followers?.length || 0}</Text>
                                        <Text style={styles.statLabel}>followers</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{profile.following?.length || 0}</Text>
                                        <Text style={styles.statLabel}>following</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.bioContainer}>
                                <Text style={styles.profileName}>{profile.name}</Text>
                                <Text style={styles.bioText}>{profile.bio || 'Digital Creator'}</Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionRow}>
                                {isOwnProfile ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => navigation.navigate('EditProfile', { profile })}
                                        >
                                            <Text style={styles.buttonText}>Edit profile</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.editButton}>
                                            <Text style={styles.buttonText}>Share profile</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.editButton, { width: 40, flex: 0 }]}>
                                            <Ionicons name="person-add-outline" size={18} color={COLORS.black} />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[
                                                styles.followBtnLarge,
                                                isFollowing && styles.followingBtnLarge
                                            ]}
                                            onPress={handleFollow}
                                            disabled={isFollowing}
                                        >
                                            <Text style={[
                                                styles.followBtnText,
                                                isFollowing && styles.followingBtnText
                                            ]}>
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.profileChatBtn}
                                            onPress={handleMessage}
                                        >
                                            <Animated.View style={[
                                                StyleSheet.absoluteFill,
                                                {
                                                    backgroundColor: highlightColor,
                                                    borderRadius: 8,
                                                    borderWidth: 1.5,
                                                    borderColor: borderColor
                                                }
                                            ]} />
                                            <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.black} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                            {/* Highlights */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
                                <View style={styles.highlightItem}>
                                    <TouchableOpacity style={styles.newHighlight}>
                                        <Ionicons name="add" size={30} color={COLORS.darkGray} />
                                    </TouchableOpacity>
                                    <Text style={styles.highlightText}>New</Text>
                                </View>
                            </ScrollView>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabBar}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
                                onPress={() => setActiveTab('grid')}
                            >
                                <Ionicons
                                    name={activeTab === 'grid' ? "grid" : "grid-outline"}
                                    size={24}
                                    color={activeTab === 'grid' ? COLORS.black : COLORS.mediumGray}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
                                onPress={() => setActiveTab('reels')}
                            >
                                <Ionicons
                                    name={activeTab === 'reels' ? "play-circle" : "play-circle-outline"}
                                    size={26}
                                    color={activeTab === 'reels' ? COLORS.black : COLORS.mediumGray}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
                                onPress={() => setActiveTab('saved')}
                            >
                                <Ionicons
                                    name={activeTab === 'saved' ? "bookmark" : "bookmark-outline"}
                                    size={24}
                                    color={activeTab === 'saved' ? COLORS.black : COLORS.mediumGray}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyPosts}>
                        <Ionicons name="images-outline" size={48} color={COLORS.mediumGray} />
                        <Text style={styles.emptyText}>No content in this tab yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: COLORS.white,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        paddingRight: 4,
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerUsername: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    headerIcon: {
        padding: 4,
    },
    notificationIcon: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    notificationsPanel: {
        position: 'absolute',
        top: 52,
        right: 12,
        width: 280,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
        zIndex: 50,
    },
    notificationsHeader: {
        paddingHorizontal: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    notificationsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    notificationsCount: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    notificationIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EEF4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
    },
    notificationSubtitle: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    profileInfoSection: {
        paddingTop: 10,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    addIconSmall: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.royalBlue,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginLeft: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.black,
    },
    bioContainer: {
        paddingHorizontal: 16,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    bioText: {
        fontSize: 14,
        color: COLORS.black,
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 20,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#EFEFEF',
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
    },
    followBtnLarge: {
        flex: 1,
        backgroundColor: COLORS.royalBlue,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    followBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    followingBtnLarge: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#dbdbdb'
    },
    followingBtnText: {
        color: COLORS.black
    },
    profileChatBtn: {
        backgroundColor: '#EFEFEF',
        width: 44,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightsScroll: {
        paddingLeft: 16,
        marginBottom: 20,
    },
    highlightItem: {
        alignItems: 'center',
        marginRight: 18,
    },
    newHighlight: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    highlightText: {
        fontSize: 12,
        color: COLORS.black,
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.black,
    },
    gridItem: {
        flex: 1 / 3,
        aspectRatio: 1,
        margin: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.lightGray,
    },
    mediaFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
    },
    mediaFallbackText: {
        marginTop: 6,
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    videoPlaceholder: {
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reelBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    emptyPosts: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.mediumGray,
        marginTop: 12,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
});
