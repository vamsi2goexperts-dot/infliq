import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Alert,
    Platform,
    StatusBar,
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../utils/constants';
import { userService, mediaService } from '../../services/api';

export default function EditProfileScreen({ route, navigation }) {
    const { profile } = route.params;
    const [name, setName] = useState(profile.name || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [profilePicture, setProfilePicture] = useState(profile.profilePicture || '');
    const [localImageUri, setLocalImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLocalImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = profilePicture;

            // Perform upload only now if a new local image was picked
            if (localImageUri) {
                console.log('🚀 Uploading new profile picture...');
                const response = await mediaService.uploadMedia({
                    uri: localImageUri,
                    type: 'image/jpeg',
                    fileName: 'profile.jpg'
                });
                finalImageUrl = response.url;
                console.log('✅ Upload successful:', finalImageUrl);
            }

            await userService.updateProfile(profile._id, {
                name,
                bio,
                profilePicture: finalImageUrl
            });

            if (Platform.OS === 'web') {
                navigation.navigate('Profile');
                return;
            }

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.royalBlue} />
                        ) : (
                            <Text style={styles.doneText}>Done</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={{ uri: localImageUri || profilePicture || 'https://via.placeholder.com/150' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraBadge}>
                                    <Ionicons name="camera" size={18} color={COLORS.white} />
                                </View>
                                {loading && localImageUri && (
                                    <View style={styles.uploadOverlay}>
                                        <ActivityIndicator color={COLORS.white} />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage}>
                            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor={COLORS.mediumGray}
                                />
                            </View>
                        </View>

                        {/* Username Input (Disabled) */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Username</Text>
                            <View style={[styles.inputContainer, styles.disabledInput]}>
                                <Ionicons name="at" size={20} color={COLORS.mediumGray} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: COLORS.darkGray }]}
                                    value={profile.phone} // Assuming phone is used as identifier/username
                                    editable={false}
                                />
                            </View>
                            <Text style={styles.helperText}>Username cannot be changed.</Text>
                        </View>

                        {/* Bio Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Bio</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="Write a short bio..."
                                    placeholderTextColor={COLORS.mediumGray}
                                    multiline
                                    maxLength={150}
                                />
                            </View>
                            <Text style={styles.charCount}>{bio.length}/150</Text>
                        </View>

                        {/* Additional Settings Link */}
                        <TouchableOpacity style={styles.settingsLink}>
                            <Text style={styles.settingsLinkText}>Personal information settings</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.royalBlue} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
        // Removed borderBottom to make it cleaner
    },
    cancelText: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '400',
    },
    doneText: {
        fontSize: 16,
        color: COLORS.royalBlue,
        fontWeight: '700',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.black,
    },
    content: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 25,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.royalBlue,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoText: {
        color: COLORS.royalBlue,
        fontSize: 15,
        fontWeight: '600',
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA', // Light gray background
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#EFEFEF', // Subtle border
        height: 50,
    },
    textAreaContainer: {
        height: 100,
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    disabledInput: {
        backgroundColor: '#F0F0F0',
        borderColor: 'transparent',
    },
    textArea: {
        textAlignVertical: 'top',
        height: '100%',
    },
    helperText: {
        fontSize: 12,
        color: COLORS.mediumGray,
        marginTop: 6,
        marginLeft: 4,
    },
    charCount: {
        fontSize: 12,
        color: COLORS.mediumGray,
        alignSelf: 'flex-end',
        marginTop: 6,
        marginRight: 4,
    },
    settingsLink: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        marginTop: 10,
    },
    settingsLinkText: {
        fontSize: 15,
        color: COLORS.royalBlue,
        fontWeight: '600',
    },
});
