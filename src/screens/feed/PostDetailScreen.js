import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { COLORS } from '../../utils/constants';
import { postService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PostDetailScreen({ route, navigation }) {
    const { post: initialPost } = route.params;
    const [post, setPost] = useState(initialPost);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadUserId();
    }, []);

    const loadUserId = async () => {
        const userId = await AsyncStorage.getItem('userId');
        setCurrentUserId(userId);
    };

    const handleLike = async () => {
        try {
            await postService.likePost(post._id);
            const isLiked = post.likes.includes(currentUserId);
            const newLikes = isLiked
                ? post.likes.filter(id => id !== currentUserId)
                : [...post.likes, currentUserId];

            setPost({ ...post, likes: newLikes });
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await postService.deletePost(post._id);
                            Alert.alert('Success', 'Post deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete post');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const showOptions = () => {
        const isOwner = post.userId?._id === currentUserId || post.userId === currentUserId;

        if (isOwner) {
            Alert.alert(
                'Post Options',
                null,
                [
                    { text: 'Delete', style: 'destructive', onPress: handleDelete },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } else {
            Alert.alert(
                'Post Options',
                null,
                [
                    { text: 'Report', onPress: () => Alert.alert('Reported', 'Post has been reported') },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const isLiked = post.likes?.includes(currentUserId);
    const isVideo = post.mediaType === 'video' || post.type === 'reel';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={{ zIndex: 10, padding: 5 }}
                >
                    <Ionicons name="arrow-back" size={28} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView>
                {/* User Info */}
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: post.userId?.profilePicture || 'https://via.placeholder.com/40' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userMeta}>
                        <Text style={styles.username}>{post.userId?.name || 'User'}</Text>
                        <Text style={styles.timestamp}>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={showOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                {/* Media Section */}
                <View style={styles.mediaContainer}>
                    {isVideo ? (
                        <Video
                            source={{ uri: post.mediaUrl }}
                            style={styles.media}
                            useNativeControls
                            resizeMode="contain"
                            isLooping
                            shouldPlay
                            onError={(error) => {
                                console.log('Post video load error:', error);
                            }}
                        />
                    ) : (
                        <Image
                            source={{ uri: post.mediaUrl || 'https://via.placeholder.com/600' }}
                            style={styles.media}
                            resizeMode="contain"
                        />
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={28}
                            color={isLiked ? COLORS.red : COLORS.black}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={26} color={COLORS.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="paper-plane-outline" size={26} color={COLORS.black} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="bookmark-outline" size={26} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.likeCount}>{post.likes?.length || 0} likes</Text>
                    {post.content && (
                        <View style={styles.captionContainer}>
                            <Text style={styles.captionUsername}>{post.userId?.name} </Text>
                            <Text style={styles.captionText}>{post.content}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.commentBtn}>
                        <Text style={styles.commentText}>
                            View all {post.comments?.length || 0} comments
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.lightGray,
    },
    userMeta: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    timestamp: {
        fontSize: 11,
        color: COLORS.darkGray,
    },
    mediaContainer: {
        width: width,
        height: width, // Square aspect ratio for simplicity, adjust for video if needed
        backgroundColor: '#000',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionButton: {
        marginRight: 16,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    likeCount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    captionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    captionUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    captionText: {
        fontSize: 14,
        color: COLORS.black,
    },
    commentBtn: {
        marginTop: 8,
    },
    commentText: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
});
