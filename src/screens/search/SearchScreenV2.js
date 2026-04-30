import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Platform,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SearchScreen({ navigation }) {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length > 1) {
            handleSearch();
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await userService.searchUsers(query);
            setResults(response.users || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderResultItem = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                if (item._id === user?._id) {
                    navigation.navigate('Main', { screen: 'Profile' });
                } else {
                    navigation.navigate('UserProfile', { userId: item._id });
                }
            }}
        >
            {item.profilePicture ? (
                <Image source={{ uri: item.profilePicture }} style={styles.resultAvatar} />
            ) : (
                <View style={[styles.resultAvatar, { backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={22} color="#999" />
                </View>
            )}
            <View>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultInfo}>{item.phone || item.email}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = (title, icon) => (
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={20} color={COLORS.white} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    // Helper to navigate to Feed via Main tab navigator
    const navigateToFeed = () => {
        navigation.navigate('Main', { screen: 'Feed' });
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.white} />
                        <TextInput
                            style={styles.input}
                            placeholder="Search users, hashtags, posts..."
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={COLORS.royalBlue} />
                    </View>
                ) : query.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={renderResultItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No users found for "{query}"</Text>
                        }
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        {/* Categories (as Recent Searches) */}
                        {renderSectionHeader('Most Searched', 'time-outline')}
                        {['Verified', 'Sports', 'IT Professionals'].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.pillItem}
                                onPress={navigateToFeed}
                            >
                                <Ionicons name="time-outline" size={18} color="rgba(255, 255, 255, 0.6)" />
                                <Text style={styles.pillText}>{item}</Text>
                            </TouchableOpacity>
                        ))}

                        {/* Trending Hashtags */}
                        <View style={{ marginTop: 30 }}>
                            {renderSectionHeader('Trending', 'trending-up-outline')}
                            {['#Web3', '#AI', '#ClimateAction', '#TechNews', '#Crypto'].map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.pillItem}
                                    onPress={navigateToFeed}
                                >
                                    <Text style={styles.hashtagIcon}>#</Text>
                                    <Text style={styles.pillTextActive}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    safeArea: {
        flex: 1,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 44,
        marginRight: 15,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.white,
    },
    cancelText: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    resultAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    resultName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    resultInfo: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionIcon: {
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    placeholderContainer: {
        padding: 20,
    },
    pillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    pillText: {
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.white,
        fontWeight: '500',
    },
    pillTextActive: {
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.white,
        fontWeight: '600',
    },
    hashtagIcon: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: 'bold',
        width: 18,
        textAlign: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
    },
});
