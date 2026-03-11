import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
    { id: 'verified', label: 'Verified Voice', icon: 'checkmark-circle' },
    { id: 'global', label: 'Global Pulse', icon: 'globe' },
    { id: 'plant', label: 'Ghost Note', icon: 'leaf' },
];

// Mock Data with Pixel Coordinates (Top/Left) for Static Map
const MOCK_PROFILES = {
    verified: [
        {
            _id: 'v1',
            name: 'Katty Abrahams',
            role: 'Professional Model',
            bio: "I'm delighted to introduce my self as professional model",
            profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
            stats: { followers: '577K', following: '456', posts: '166' },
            location: { top: 150, left: 100 },
            badge: 'verified'
        },
        { _id: 'v2', name: 'Althears', role: 'Artist', bio: 'Creative explorer.', profilePicture: 'https://randomuser.me/api/portraits/women/32.jpg', stats: { followers: '12K', following: '500', posts: '45' }, location: { top: 120, left: 250 }, badge: 'online' },
        { _id: 'v3', name: 'John Doe', role: 'Musician', bio: 'Making noise.', profilePicture: 'https://randomuser.me/api/portraits/men/44.jpg', stats: { followers: '50K', following: '100', posts: '20' }, location: { top: 250, left: 180 }, badge: 'new' },
        { _id: 'v4', name: 'Sarah S.', role: 'Influencer', bio: 'Lifestyle.', profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg', stats: { followers: '80K', following: '200', posts: '150' }, location: { top: 80, left: 150 }, badge: 'online' },
        { _id: 'v5', name: 'Mike R.', role: 'Founder', bio: 'Startups.', profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg', stats: { followers: '15K', following: '300', posts: '10' }, location: { top: 200, left: 300 }, badge: 'verified' },
    ],
    global: [
        { _id: 'g1', name: 'Global User', role: 'Traveller', bio: 'Around the world.', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg', stats: { followers: '10K', following: '1k', posts: '200' }, location: { top: 300, left: 50 }, badge: 'online' },
    ],
    plant: [
        { _id: 'p1', name: 'Plant Lover', role: 'Environmentalist', bio: 'Greener earth.', profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg', stats: { followers: '5K', following: '200', posts: '100' }, location: { top: 400, left: 200 }, badge: 'new' },
    ],
    music: [],
    art: []
};

import { useAuth } from '../../context/AuthContext';

export default function MapDiscoveryScreen({ navigation }) {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('verified');
    const [users, setUsers] = useState(MOCK_PROFILES['verified']);
    const [selectedUser, setSelectedUser] = useState(MOCK_PROFILES['verified'][0]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        const categoryProfiles = MOCK_PROFILES[categoryId] || [];
        setUsers(categoryProfiles);
        if (categoryProfiles.length > 0) {
            setSelectedUser(categoryProfiles[0]);
        } else {
            setSelectedUser(null);
        }
    };

    const getBadgeColor = (badge) => {
        switch (badge) {
            case 'verified': return '#FFB300';
            case 'new': return '#FF5252';
            case 'online': return '#00E676';
            default: return '#00BFFF';
        }
    };

    const getBadgeIcon = (badge) => {
        switch (badge) {
            case 'verified': return 'star';
            case 'new': return 'flash';
            case 'online': return 'ellipse';
            default: return 'ellipse';
        }
    }

    const renderCategoryItem = (item) => {
        const isSelected = selectedCategory === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                onPress={() => handleCategorySelect(item.id)}
            >
                {item.id === 'verified' && (
                    <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.black}
                        style={{ marginRight: 4 }}
                    />
                )}
                <Text style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive
                ]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* 1. Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <View style={styles.notificationDot} />
                    <Ionicons name="notifications" size={24} color={COLORS.royalBlue} />
                </TouchableOpacity>

                <Text style={styles.logo}>INFLIQ</Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, styles.searchButton]}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Ionicons name="search" size={20} color={COLORS.royalBlue} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Top Tabs (Scrolling) */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {CATEGORIES.map((item) => renderCategoryItem(item))}
                </ScrollView>
            </View>

            {/* 3. Static Map View */}
            <View style={styles.mapContainer}>
                <Image
                    source={require('../../../assets/map-bg.jpg')}
                    style={styles.mapBackground}
                    resizeMode="cover"
                />

                {/* Overlay darkening */}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />

                {users.map((user) => (
                    <TouchableOpacity
                        key={user._id}
                        style={[
                            styles.markerWrapper,
                            { top: user.location.top, left: user.location.left }
                        ]}
                        onPress={() => setSelectedUser(user)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.markerContainer}>
                            <Image
                                source={{ uri: user.profilePicture }}
                                style={styles.markerImage}
                            />
                            <View style={[
                                styles.markerBadge,
                                { backgroundColor: getBadgeColor(user.badge) }
                            ]}>
                                <Ionicons name={getBadgeIcon(user.badge)} size={8} color={COLORS.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>


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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
        zIndex: 100
    },
    logo: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.black,
        letterSpacing: 1
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
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        zIndex: 1
    },
    tabsContainer: {
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        zIndex: 99,
        paddingBottom: 25
    },
    tabsScrollContent: {
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        marginRight: 25
    },
    categoryText: {
        fontSize: 16,
        color: COLORS.darkGray,
        fontWeight: '500'
    },
    categoryTextActive: {
        color: COLORS.black,
        fontWeight: 'bold',
        fontSize: 17
    },
    mapContainer: {
        flex: 1,
        marginTop: 0,
        position: 'relative',
        backgroundColor: '#1E1E1E'
    },
    mapBackground: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        opacity: 0.95
    },
    markerWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.white,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    markerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    markerBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
