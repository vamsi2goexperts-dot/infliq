import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import { userService } from '../../services/api';

const safeUri = (uri) => {
    if (typeof uri !== 'string') return null;
    const trimmed = uri.trim();
    if (!trimmed) return null;
    return trimmed.startsWith('http://') ? trimmed.replace('http://', 'https://') : trimmed;
};

const CATEGORIES = [
    { id: 'verified', label: 'Verified Voice', icon: 'checkmark-circle' },
    { id: 'global', label: 'Global Pulse', icon: 'globe' },
    { id: 'plant', label: 'Ghost Note', icon: 'leaf' },
];

const DEFAULT_REGION = {
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.9,
    longitudeDelta: 0.9,
};

const getBadgeColor = (badge) => {
    switch (badge) {
        case 'verified':
            return '#4CAF50';
        case 'new':
            return '#FFB300';
        case 'online':
            return '#00C2FF';
        default:
            return '#00BFFF';
    }
};

const getBadgeIcon = (badge) => {
    switch (badge) {
        case 'verified':
            return 'checkmark';
        case 'new':
            return 'sparkles';
        case 'online':
            return 'ellipse';
        default:
            return 'ellipse';
    }
};

const normalizeUserLocation = (user, fallbackIndex = 0) => {
    const coordinates = user.location?.coordinates;
    const hasCoordinates = Array.isArray(coordinates) && coordinates.length >= 2;

    if (hasCoordinates) {
        return {
            ...user,
            latitude: coordinates[1],
            longitude: coordinates[0],
        };
    }

    const offset = (fallbackIndex + 1) * 0.01;
    return {
        ...user,
        latitude: DEFAULT_REGION.latitude + offset,
        longitude: DEFAULT_REGION.longitude + offset,
    };
};

export default function MapDiscoveryScreen({ navigation }) {
    const mapRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState('verified');
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);
    const [users, setUsers] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const initLocation = async () => {
            try {
                const permission = await Location.requestForegroundPermissionsAsync();
                if (permission.status !== 'granted') {
                    if (!mounted) return;
                    setCurrentRegion(DEFAULT_REGION);
                    setLoadingLocation(false);
                    return;
                }

                const position = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (!mounted) return;

                const region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.55,
                    longitudeDelta: 0.55,
                };

                setCurrentRegion(region);
                setLoadingLocation(false);
                mapRef.current?.animateToRegion(region, 500);
            } catch (err) {
                if (!mounted) return;
                setCurrentRegion(DEFAULT_REGION);
                setLoadingLocation(false);
            }
        };

        initLocation();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadUsers = async () => {
            if (!currentRegion) return;

            setLoadingUsers(true);
            setError(null);

            try {
                const response = await userService.getNearbyUsers(
                    currentRegion.latitude,
                    currentRegion.longitude,
                    selectedCategory
                );

                const mappedUsers = (response.users || [])
                    .map((item, index) => normalizeUserLocation(item, index))
                    .filter((item) => typeof item.latitude === 'number' && typeof item.longitude === 'number');

                if (!mounted) return;

                setUsers(mappedUsers);
                setSelectedUser((current) => {
                    if (current && mappedUsers.some((item) => item._id === current._id)) {
                        return mappedUsers.find((item) => item._id === current._id);
                    }
                    return mappedUsers[0] || null;
                });

                if (mappedUsers.length > 0 && mapRef.current) {
                    mapRef.current.animateToRegion(
                        {
                            latitude: mappedUsers[0].latitude,
                            longitude: mappedUsers[0].longitude,
                            latitudeDelta: 0.6,
                            longitudeDelta: 0.6,
                        },
                        450
                    );
                }
            } catch (err) {
                if (!mounted) return;
                setUsers([]);
                setError('Unable to load nearby users right now.');
            } finally {
                if (mounted) setLoadingUsers(false);
            }
        };

        if (currentRegion) {
            loadUsers();
        }

        return () => {
            mounted = false;
        };
    }, [currentRegion, selectedCategory]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const renderCategoryItem = (item) => {
        const isSelected = selectedCategory === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                onPress={() => handleCategorySelect(item.id)}
                activeOpacity={0.8}
            >
                {item.id === 'verified' ? (
                    <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={isSelected ? COLORS.black : COLORS.darkGray}
                        style={{ marginRight: 4 }}
                    />
                ) : null}
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

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

            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {CATEGORIES.map((item) => renderCategoryItem(item))}
                </ScrollView>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={currentRegion}
                    showsCompass={false}
                    showsPointsOfInterest={false}
                    showsBuildings={false}
                    showsTraffic={false}
                    toolbarEnabled={false}
                    rotateEnabled={false}
                    mapType="standard"
                >
                    {users.map((item) => (
                        <Marker
                            key={item._id}
                            coordinate={{
                                latitude: item.latitude,
                                longitude: item.longitude,
                            }}
                            onPress={() => setSelectedUser(item)}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerRing}>
                                <View
                                    style={[
                                        styles.markerContainer,
                                        selectedUser?._id === item._id && styles.markerContainerActive,
                                    ]}
                                >
                                    {safeUri(item.profilePicture) ? (
                                        <Image source={{ uri: safeUri(item.profilePicture) }} style={styles.markerImage} />
                                    ) : (
                                        <View style={[styles.markerImage, styles.markerFallback]}>
                                            <Ionicons name="person" size={12} color={COLORS.mediumGray} />
                                        </View>
                                    )}
                                    <View
                                        style={[
                                            styles.markerBadge,
                                            { backgroundColor: getBadgeColor(item.badge) },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getBadgeIcon(item.badge)}
                                            size={7}
                                            color={COLORS.white}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Marker>
                    ))}
                </MapView>

                <LinearGradient
                    colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)']}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                />

                {(loadingLocation || loadingUsers) && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={COLORS.royalBlue} />
                        <Text style={styles.loaderText}>
                            {loadingLocation ? 'Finding nearby places...' : 'Loading nearby users...'}
                        </Text>
                    </View>
                )}

                {error ? (
                    <View style={styles.errorPill}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {selectedUser ? (
                    <TouchableOpacity
                        style={styles.userCard}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Profile', { userId: selectedUser._id })}
                    >
                        {safeUri(selectedUser.profilePicture) ? (
                            <Image source={{ uri: safeUri(selectedUser.profilePicture) }} style={styles.userAvatar} />
                        ) : (
                            <View style={[styles.userAvatar, styles.markerFallback]}>
                                <Ionicons name="person" size={18} color={COLORS.mediumGray} />
                            </View>
                        )}
                        <View style={styles.userCardBody}>
                            <Text style={styles.userName}>{selectedUser.name}</Text>
                            <Text style={styles.userRole}>{selectedUser.role || selectedUser.category || 'Nearby user'}</Text>
                            <Text style={styles.userBio} numberOfLines={2}>
                                {selectedUser.bio || 'Active nearby on the INFLIQ map.'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={COLORS.darkGray} />
                    </TouchableOpacity>
                ) : null}
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 50,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
        zIndex: 100,
    },
    logo: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.black,
        letterSpacing: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
    },
    searchButton: {
        marginRight: 10,
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        zIndex: 1,
    },
    tabsContainer: {
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        zIndex: 99,
        paddingBottom: 14,
    },
    tabsScrollContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        marginRight: 22,
    },
    categoryText: {
        fontSize: 16,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: COLORS.black,
        fontWeight: 'bold',
        fontSize: 17,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#0E0E0E',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loader: {
        position: 'absolute',
        top: 18,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.92)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        elevation: 4,
    },
    loaderText: {
        color: COLORS.black,
        fontWeight: '600',
    },
    errorPill: {
        position: 'absolute',
        top: 18,
        left: 16,
        right: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: 'rgba(255,82,82,0.95)',
    },
    errorText: {
        color: COLORS.white,
        fontWeight: '600',
        textAlign: 'center',
    },
    markerRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    markerContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: COLORS.white,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    markerContainerActive: {
        borderColor: '#2EC5FF',
        shadowOpacity: 0.45,
        transform: [{ scale: 1.08 }],
    },
    markerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    markerFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userCard: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 22,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 10,
    },
    userAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#E9EEF5',
    },
    userCardBody: {
        flex: 1,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.black,
    },
    userRole: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.royalBlue,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    userBio: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 16,
        color: COLORS.darkGray,
    },
});
