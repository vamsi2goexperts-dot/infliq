import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateSheet({ visible, onClose, navigation }) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide Up
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Slide Down
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    const handlePress = (item) => {
        onClose();
        if (item.id === 'post' || item.id === 'reel') {
            navigation.navigate('CreatePost', { type: item.id === 'reel' ? 'reel' : 'post' });
        } else {
            Alert.alert(
                'Coming Soon',
                `${item.label} is currently in development and will be available soon!`,
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    if (!visible && slideAnim._value === SCREEN_HEIGHT) return null;

    const items = [
        { id: 'post', label: 'Create a post', icon: 'image-outline', status: 'active' },
        { id: 'reel', label: 'Create a short', icon: 'videocam-outline', status: 'active' },
        { id: 'story', label: 'Create a story', icon: 'camera-outline', status: 'coming_soon' },
        { id: 'live', label: 'Go live', icon: 'play-outline', status: 'coming_soon' },
        { id: 'voice', label: 'Verified voice', icon: 'filter-outline', status: 'coming_soon', locked: true },
        { id: 'debate', label: 'Start a debate', icon: 'create-outline', status: 'coming_soon', locked: true },
        { id: 'ghost', label: 'GhostNote', icon: 'happy-outline', status: 'coming_soon' },
    ];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim }]} />
            </Pressable>

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    { transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Header Handle */}
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => handlePress({ id: 'post' })}
                >
                    <View style={styles.headerTab}>
                        <Text style={styles.headerText}>+ New Post</Text>
                    </View>
                </TouchableOpacity>

                {/* List Items Wrapper for Styling */}
                <View style={styles.sheetContent}>
                    <ScrollView contentContainerStyle={styles.listContent}>
                        {items.map((item, index) => (
                            <View key={item.id}>
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        item.status === 'coming_soon' && styles.comingSoonItem
                                    ]}
                                    onPress={() => handlePress(item)}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name={item.icon}
                                            size={24}
                                            color={item.status === 'active' ? COLORS.black : COLORS.mediumGray}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.itemLabel,
                                        item.status === 'coming_soon' && styles.comingSoonLabel
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {item.locked && (
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={18}
                                            color={COLORS.mediumGray}
                                            style={styles.lockIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                                {index < items.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Spacer for Bottom Tabs */}
                <View style={{ height: 40 }} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: SCREEN_HEIGHT * 0.85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: -20,
        marginBottom: 10,
    },
    headerTab: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    sheetContent: {
        marginHorizontal: 20,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    listContent: {
        paddingVertical: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 15,
    },
    comingSoonItem: {
        opacity: 0.8,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 10,
    },
    itemLabel: {
        flex: 1,
        fontSize: 17,
        color: '#333',
        fontWeight: '500',
    },
    comingSoonLabel: {
        color: COLORS.mediumGray,
    },
    lockIcon: {
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 15,
    }
});
