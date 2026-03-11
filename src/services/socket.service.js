import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../utils/constants';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    async connect() {
        if (this.socket && this.connected) {
            console.log('✅ [SocketService] Already connected, reusing existing socket');
            return this.socket;
        }

        console.log('🔌 [SocketService] Initiating socket connection...');
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');

        console.log(`🔑 [SocketService] Connecting with userId: ${userId}, token: ${token ? 'present' : 'missing'}`);

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ [SocketService] Socket connected successfully, ID:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ [SocketService] Socket disconnected');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('❌ [SocketService] Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Chat events
    joinChat(chatId) {
        if (this.socket) {
            this.socket.emit('join-chat', chatId);
        }
    }

    sendMessage(chatId, message) {
        if (this.socket) {
            this.socket.emit('send-message', { chatId, message });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new-message', callback);
        }
    }

    // Call events
    onIncomingCall(userId, callback) {
        if (this.socket) {
            this.socket.on(`incoming-call-${userId}`, callback);
        }
    }

    onCallAccepted(userId, callback) {
        if (this.socket) {
            this.socket.on(`call-accepted-${userId}`, callback);
        }
    }

    onCallRejected(userId, callback) {
        if (this.socket) {
            this.socket.on(`call-rejected-${userId}`, callback);
        }
    }

    onCallEnded(userId, callback) {
        if (this.socket) {
            this.socket.on(`call-ended-${userId}`, callback);
        }
    }

    // Remove listeners
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    on(event, callback) {
        if (this.socket) {
            console.log(`👂 [SocketService] Registering listener for event: ${event}`);
            this.socket.on(event, callback);
        } else {
            console.warn(`⚠️ [SocketService] Cannot register listener for ${event} - socket not connected`);
        }
    }

    emit(event, data) {
        if (this.socket) {
            console.log(`📤 [SocketService] Emitting event: ${event}`, data);
            this.socket.emit(event, data);
        } else {
            console.warn(`⚠️ [SocketService] Cannot emit ${event} - socket not connected`);
        }
    }
}

export default new SocketService();
