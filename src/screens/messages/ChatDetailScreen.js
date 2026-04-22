import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { chatService, callService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socket.service';

export default function ChatDetailScreen({ route, navigation }) {
    const { chatId, otherUser } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const flatListRef = useRef();
    const typingTimeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            loadMessages();
        }, [chatId])
    );

    useEffect(() => {
        console.log('🔌 [ChatDetail] Setting up socket listeners for chatId:', chatId);

        // Join chat room for real-time updates
        socketService.emit('join-chat', chatId);
        console.log('📥 [ChatDetail] Emitted join-chat for:', chatId);

        // Listen for new messages via socket
        const messageHandler = (data) => {
            // Expected format from backend: { chatId, message }
            console.log('📨 [ChatDetail] New message received via socket:', data);
            if (data.chatId === chatId) {
                console.log('✅ [ChatDetail] Message is for current chat, adding to state');
                setMessages(prev => [...prev, data.message]);
            } else {
                console.log('⚠️ [ChatDetail] Message is for different chat, ignoring');
            }
        };

        socketService.on('new-message', messageHandler);
        console.log('👂 [ChatDetail] Listening for new-message events');

        // Listen for typing indicator
        const typingHandler = (data) => {
            console.log('⌨️ [ChatDetail] Typing event received:', data);
            if (data.chatId === chatId && data.userId !== user._id) {
                setIsOtherUserTyping(data.isTyping);

                // Auto-clear typing indicator after 3 seconds
                if (data.isTyping) {
                    setTimeout(() => setIsOtherUserTyping(false), 3000);
                }
            }
        };

        socketService.on('user-typing', typingHandler);

        return () => {
            // Cleanup on unmount or chatId change
            console.log('🧹 [ChatDetail] Cleaning up socket listener for chatId:', chatId);
            socketService.off('new-message', messageHandler);
            socketService.off('user-typing', typingHandler);
        };
    }, [chatId]);

    const loadMessages = async () => {
        try {
            console.log('🔄 Loading messages for chatId:', chatId);
            const chat = await chatService.getChatMessages(chatId);
            if (chat && chat.messages) {
                console.log(`✅ Loaded ${chat.messages.length} messages`);
                setMessages(chat.messages);
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            chatId,
            text: newMessage.trim(),
            senderId: user._id
        };

        console.log('📤 [ChatDetail] Sending message:', { chatId, text: newMessage.substring(0, 50) });

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticMsg = { ...messageData, _id: tempId, createdAt: new Date() };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        try {
            await socketService.emit('send-message', messageData);
            console.log('✅ [ChatDetail] Message emitted to socket');
        } catch (error) {
            console.error('❌ [ChatDetail] Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handleCall = async (type) => {
        try {
            console.log(`📞 Initiating ${type} call to ${otherUser.name}`);

            // Call the service first to get callId
            const response = await callService.initiateCall(otherUser._id, type);

            // Navigate to CallScreen with callId
            navigation.navigate('CallScreen', {
                callId: response.callId,
                otherUser,
                callType: type,
                isIncoming: false
            });
        } catch (error) {
            console.error('Call initialization error:', error);
            Alert.alert('Error', 'Failed to start call');
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.senderId === user._id;

        if (item.type && item.type !== 'text') {
            return (
                <View style={styles.callMessageContainer}>
                    <View style={styles.callMessageContent}>
                        <View style={[
                            styles.callIconContainer,
                            item.type === 'call-missed' ? styles.missedCallIcon : styles.startedCallIcon
                        ]}>
                            <Ionicons
                                name={item.type === 'call-missed' ? "call" : (item.text?.includes('Video') ? "videocam" : "call")}
                                size={20}
                                color={COLORS.white}
                            />
                        </View>
                        <View style={styles.callMessageInfo}>
                            <Text style={styles.callMessageTitle}>{item.text}</Text>
                            <Text style={styles.callMessageTime}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                    {item.type === 'call-missed' && !isMe && (
                        <TouchableOpacity
                            style={styles.callBackBtn}
                            onPress={() => handleCall(item.text?.includes('video') ? 'video' : 'audio')}
                        >
                            <Text style={styles.callBackText}>Call back</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {item.text}
                </Text>
                <Text style={styles.timestamp}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>

                <Image
                    source={otherUser.profilePicture ? { uri: otherUser.profilePicture } : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random` }}
                    style={styles.avatar}
                />

                <View style={styles.headerInfo}>
                    <Text style={styles.userName}>{otherUser.name}</Text>
                    <Text style={styles.status}>
                        {isOtherUserTyping ? 'typing...' : 'Online'}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => handleCall('audio')} style={styles.actionButton}>
                        <Ionicons name="call-outline" size={24} color={COLORS.royalBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCall('video')} style={styles.actionButton}>
                        <Ionicons name="videocam-outline" size={24} color={COLORS.royalBlue} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.royalBlue} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item._id || `temp-${index}-${Date.now()}`}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
                style={{ position: 'relative' }}
            >
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Ionicons name="camera" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Message..."
                            value={newMessage}
                            onChangeText={(text) => {
                                setNewMessage(text);

                                // Emit typing indicator
                                socketService.emit('user-typing', {
                                    chatId,
                                    userId: user._id,
                                    isTyping: true
                                });

                                // Clear previous timeout
                                if (typingTimeoutRef.current) {
                                    clearTimeout(typingTimeoutRef.current);
                                }

                                // Set timeout to stop typing after 2 seconds of inactivity
                                typingTimeoutRef.current = setTimeout(() => {
                                    socketService.emit('user-typing', {
                                        chatId,
                                        userId: user._id,
                                        isTyping: false
                                    });
                                }, 2000);
                            }}
                            placeholderTextColor={COLORS.mediumGray}
                            multiline
                        />
                        {newMessage.trim() ? (
                            <TouchableOpacity
                                style={styles.sendTextButton}
                                onPress={handleSendMessage}
                            >
                                <Text style={styles.sendText}>Send</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.inputActions}>
                                <TouchableOpacity style={styles.inputAction}>
                                    <Ionicons name="mic-outline" size={24} color={COLORS.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.inputAction}>
                                    <Ionicons name="image-outline" size={24} color={COLORS.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.inputAction}>
                                    <Ionicons name="happy-outline" size={24} color={COLORS.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.inputAction}>
                                    <Ionicons name="add-circle-outline" size={24} color={COLORS.black} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    backButton: {
        marginRight: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.lightGray,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    status: {
        fontSize: 12,
        color: COLORS.mediumGray,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: 20,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginBottom: 4,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.royalBlue,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#efefef',
    },
    messageText: {
        fontSize: 15,
    },
    myMessageText: {
        color: COLORS.white,
    },
    theirMessageText: {
        color: COLORS.black,
    },
    callMessageContainer: {
        alignSelf: 'center',
        backgroundColor: COLORS.darkSlate + '20', // Slightly darker
        borderRadius: 24,
        padding: 16,
        marginVertical: 12,
        width: '90%',
        alignItems: 'center',
    },
    callMessageContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    callIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    startedCallIcon: {
        backgroundColor: '#3a3a3a', // Darker gray for started/ended
    },
    missedCallIcon: {
        backgroundColor: '#ff3131', // Brighter red for missed
    },
    callMessageInfo: {
        flex: 1,
    },
    callMessageTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.white,
    },
    callMessageTime: {
        fontSize: 13,
        color: COLORS.mediumGray,
        marginTop: 4,
    },
    callBackBtn: {
        marginTop: 14,
        backgroundColor: '#2a2a2a', // Darker button background
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    callBackText: {
        color: COLORS.royalBlue,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 10,
        color: COLORS.mediumGray,
        alignSelf: 'center',
        marginVertical: 16,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    cameraButton: {
        backgroundColor: COLORS.royalBlue,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: COLORS.black,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    inputAction: {
        marginLeft: 12,
    },
    sendTextButton: {
        paddingHorizontal: 16,
    },
    sendText: {
        color: COLORS.royalBlue,
        fontWeight: '700',
        fontSize: 16,
    },
});
