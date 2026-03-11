import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { chatService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socket.service';

export default function MessagesScreen({ navigation }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('chats');
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'chats', label: 'Chats', badge: null },
        { id: 'communities', label: 'Communities', badge: 36, comingSoon: true },
        { id: 'debates', label: 'Debates', badge: null, comingSoon: true }
    ];

    useFocusEffect(
        useCallback(() => {
            loadChats();
        }, [])
    );

    useEffect(() => {
        // Socket listener for real-time list updates
        const listUpdateHandler = (data) => {
            console.log('📡 List update received:', data);
            setChats(prevChats => {
                const updatedChats = prevChats.map(chat => {
                    if (chat._id === data.chatId) {
                        return {
                            ...chat,
                            messages: [...(chat.messages || []), data.message],
                            lastMessageAt: data.message.createdAt,
                            lastMessage: data.message.text
                        };
                    }
                    return chat;
                });
                // Re-sort by lastMessageAt
                return updatedChats.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            });
        };

        socketService.on('new-message', listUpdateHandler);

        return () => {
            socketService.off('new-message', listUpdateHandler);
        };
    }, []);

    const loadChats = async () => {
        try {
            console.log('🔄 Reloading chat list...');
            const data = await chatService.getChats();
            setChats(data);

            // Join all chat rooms for real-time list updates
            if (Array.isArray(data)) {
                data.forEach(chat => {
                    console.log(`🔗 Joining chat room: ${chat._id}`);
                    socketService.emit('join-chat', chat._id);
                });
            }
        } catch (error) {
            console.error('❌ Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabPress = (tab) => {
        if (tab.comingSoon) {
            Alert.alert('Coming Soon', `${tab.label} feature is coming soon!`);
            return;
        }
        setActiveTab(tab.id);
    };

    const renderChatItem = ({ item }) => {
        // Find the other participant
        const otherParticipant = item.participants.find(p => p._id !== user._id) || { name: 'Unknown', profilePicture: null };
        const lastMessage = item.messages && item.messages.length > 0
            ? item.messages[item.messages.length - 1].text
            : 'No messages yet';

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate('ChatDetail', { chatId: item._id, otherUser: otherParticipant })}
            >
                <Image
                    source={otherParticipant.profilePicture ? { uri: otherParticipant.profilePicture } : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}&background=random` }}
                    style={styles.chatAvatar}
                />
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName}>{otherParticipant.name}</Text>
                        <Text style={styles.chatTime}>
                            {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const filteredChats = Array.isArray(chats) ? chats.filter(chat => {
        const otherParticipant = chat.participants?.find(p => p._id !== user._id);
        return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity>
                    <Ionicons name="send-outline" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={COLORS.darkGray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.darkGray}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.tab}
                        onPress={() => handleTabPress(tab)}
                    >
                        <View style={styles.tabContent}>
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.id && styles.tabTextActive
                                ]}
                            >
                                {tab.label}
                            </Text>
                            {tab.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{tab.badge}</Text>
                                </View>
                            )}
                        </View>
                        {activeTab === tab.id && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chat List */}
            {activeTab === 'chats' ? (
                loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.royalBlue} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredChats}
                        renderItem={renderChatItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.chatList}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No conversations found</Text>
                            </View>
                        }
                    />
                )
            ) : (
                <View style={styles.comingSoonContainer}>
                    <Ionicons name="rocket-outline" size={60} color={COLORS.royalBlue} />
                    <Text style={styles.comingSoonText}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.black
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray
    },
    tab: {
        flex: 1,
        paddingVertical: 12
    },
    tabContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabText: {
        fontSize: 16,
        color: COLORS.darkGray
    },
    tabTextActive: {
        color: COLORS.royalBlue,
        fontWeight: '600'
    },
    badge: {
        backgroundColor: COLORS.royalBlue,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold'
    },
    tabIndicator: {
        height: 3,
        backgroundColor: COLORS.royalBlue,
        marginTop: 8
    },
    chatList: {
        paddingHorizontal: 16
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray
    },
    chatAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.lightGray
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black
    },
    chatTime: {
        fontSize: 12,
        color: COLORS.darkGray
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.darkGray
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        color: COLORS.darkGray,
        fontSize: 16
    },
    comingSoonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    comingSoonText: {
        color: COLORS.royalBlue,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center'
    }
});
