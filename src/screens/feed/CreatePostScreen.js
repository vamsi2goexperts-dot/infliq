import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StatusBar,
    Image,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../utils/constants';
import api, { postService, mediaService } from '../../services/api';
import Toast from '../../components/Toast';

export default function CreatePostScreen({ navigation, route }) {
    const { type = 'post' } = route.params || {};
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isReel = type === 'reel';

    React.useEffect(() => {
        if (isReel && !selectedMedia) {
            pickMedia('video');
        }
    }, [isReel]);

    const pickMedia = async (mediaType) => {
        // Force video for reels
        const finalType = isReel ? 'video' : mediaType;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: finalType === 'image' ? ['images'] : ['videos'],
            allowsEditing: true,
            aspect: type === 'image' ? [4, 3] : undefined,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setSelectedMedia({
                uri: asset.uri,
                type: finalType,
                mimeType: asset.mimeType || (finalType === 'image' ? 'image/jpeg' : 'video/mp4')
            });
        }
    };

    const handleCreatePost = async () => {
        if (!content.trim() && !selectedMedia) {
            Alert.alert('Error', 'Please enter some content or add media for your post.');
            return;
        }

        setLoading(true);
        try {
            let mediaUrl = null;
            let mediaType = null;

            if (selectedMedia) {
                console.log(`🚀 Starting media upload for post: ${selectedMedia.uri}`);
                const uploadResult = await mediaService.uploadMedia({
                    uri: selectedMedia.uri,
                    type: selectedMedia.mimeType,
                    fileName: selectedMedia.type === 'image' ? 'post_image.jpg' : 'post_video.mp4'
                });
                mediaUrl = uploadResult.url;
                mediaType = selectedMedia.type;
                console.log(`✅ Media uploaded for post: ${mediaUrl}`);
            }

            await postService.createPost({
                content: content.trim(),
                type: type,
                mediaUrl,
                mediaType
            });

            setToastMessage('Post created successfully!');
            setShowToast(true);

            // Wait for toast to show briefly before navigating back
            setTimeout(() => {
                navigation.goBack();
            }, 1000);
        } catch (error) {
            console.error('Create post error:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.title}>{isReel ? 'New Reel' : 'New Post'}</Text>
                <TouchableOpacity
                    onPress={handleCreatePost}
                    disabled={loading || (!content.trim() && !selectedMedia)}
                    style={[styles.postButton, (!content.trim() && !selectedMedia || loading) && styles.postButtonDisabled]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.postButtonText}>{isReel ? 'Share' : 'Post'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Input Area */}
            <ScrollView style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={isReel ? "Add a caption for your reel..." : "What's on your mind?"}
                    placeholderTextColor={COLORS.mediumGray}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    autoFocus
                />

                {selectedMedia && (
                    <View style={styles.previewContainer}>
                        {selectedMedia.type === 'image' ? (
                            <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.videoPreviewPlaceholder}>
                                <Ionicons name="videocam" size={40} color={COLORS.royalBlue} />
                                <Text style={styles.videoPreviewText}>Video Selected</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={() => setSelectedMedia(null)}
                        >
                            <Ionicons name="close-circle" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Footer - Media Attachments */}
            <View style={styles.footer}>
                {!isReel && (
                    <TouchableOpacity
                        style={styles.footerAction}
                        onPress={() => pickMedia('image')}
                    >
                        <Ionicons name="image-outline" size={24} color={COLORS.royalBlue} />
                        <Text style={styles.footerActionText}>Add Image</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.footerAction}
                    onPress={() => pickMedia('video')}
                >
                    <Ionicons name="videocam-outline" size={24} color={COLORS.royalBlue} />
                    <Text style={styles.footerActionText}>{isReel ? 'Change Video' : 'Add Video'}</Text>
                </TouchableOpacity>
            </View>

            <Toast
                visible={showToast}
                message={toastMessage}
                onHide={() => setShowToast(false)}
            />
        </KeyboardAvoidingView>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    postButton: {
        backgroundColor: COLORS.royalBlue,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    postButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
    },
    postButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    inputContainer: {
        flex: 1,
        padding: 20,
    },
    input: {
        fontSize: 18,
        color: COLORS.black,
        textAlignVertical: 'top',
        minHeight: 100,
        marginBottom: 20,
    },
    previewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: COLORS.lightGray,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
    },
    videoPreviewPlaceholder: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
    },
    videoPreviewText: {
        marginTop: 10,
        color: COLORS.royalBlue,
        fontWeight: '600',
    },
    removeMediaButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        padding: 15,
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25,
    },
    footerActionText: {
        marginLeft: 8,
        color: COLORS.royalBlue,
        fontWeight: '600',
    }
});
