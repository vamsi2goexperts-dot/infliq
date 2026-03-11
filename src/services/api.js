import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../utils/constants';

// Create axios instance
const api = axios.create({
    baseURL: API_ENDPOINTS.AUTH.replace('/api/auth', ''),
    timeout: 30000, // Increased for media uploads
});

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        // Prefer in-memory token for performance, fallback to AsyncStorage
        const token = authToken || await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (!authToken) authToken = token; // Sync back to memory if found in storage
            console.log(`🚀 API Request [TOKEN FOUND]: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
            console.log(`🚀 API Request [NO TOKEN]: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let unauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
    unauthorizedCallback = callback;
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('🛑 401 Unauthorized detected - clearing session');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userId');
            if (unauthorizedCallback) {
                unauthorizedCallback();
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH SERVICES ====================

export const authService = {
    sendOTP: async (phone) => {
        const response = await api.post('/api/auth/send-otp', { phone });
        return response.data;
    },

    verifyOTP: async (phone, otp) => {
        const response = await api.post('/api/auth/verify-otp', { phone, otp });
        if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
            await AsyncStorage.setItem('userId', response.data.user._id);
        }
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
            await AsyncStorage.setItem('userId', response.data.user._id);
        }
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userId');
    }
};

// ==================== USER SERVICES ====================

export const userService = {
    getProfile: async (userId) => {
        const response = await api.get(`/api/users/${userId}`);
        return response.data;
    },

    updateProfile: async (userId, data) => {
        const response = await api.put(`/api/users/${userId}`, data);
        return response.data;
    },

    followUser: async (userId) => {
        const response = await api.post(`/api/users/${userId}/follow`);
        return response.data;
    },

    getNearbyUsers: async (lat, lng, category) => {
        const response = await api.get('/api/users/nearby', {
            params: { lat, lng, category }
        });
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get('/api/users/search', {
            params: { q: query }
        });
        return response.data;
    }
};

// ==================== POST SERVICES ====================

export const postService = {
    createPost: async (postData) => {
        const response = await api.post('/api/posts', postData);
        return response.data;
    },

    getFeed: async (page = 1, limit = 10) => {
        const response = await api.get(`/api/posts/feed?page=${page}&limit=${limit}`);
        return response.data;
    },

    likePost: async (postId) => {
        const response = await api.post(`/api/posts/${postId}/like`);
        return response.data;
    },

    addComment: async (postId, text) => {
        const response = await api.post(`/api/posts/${postId}/comment`, { text });
        return response.data;
    },

    getReels: async (page = 1, limit = 10) => {
        const response = await api.get(`/api/reels/feed?page=${page}&limit=${limit}`);
        return response.data;
    },

    getUserPosts: async (userId) => {
        const response = await api.get(`/api/posts/user/${userId}`);
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await api.delete(`/api/posts/${postId}`);
        return response.data;
    }
};

// ==================== CALL SERVICES ====================

export const callService = {
    getToken: async (roomName) => {
        const response = await api.post('/api/calls/token', { roomName });
        return response.data;
    },

    initiateCall: async (receiverId, type = 'video') => {
        const response = await api.post('/api/calls/initiate', { receiverId, type });
        return response.data;
    },

    acceptCall: async (callId) => {
        const response = await api.post(`/api/calls/${callId}/accept`);
        return response.data;
    },

    rejectCall: async (callId) => {
        const response = await api.post(`/api/calls/${callId}/reject`);
        return response.data;
    },

    endCall: async (callId) => {
        const response = await api.post(`/api/calls/${callId}/end`);
        return response.data;
    },

    getCallHistory: async () => {
        const response = await api.get('/api/calls/history');
        return response.data;
    }
};

// ==================== CHAT SERVICES ====================

export const chatService = {
    getChats: async () => {
        const response = await api.get('/api/chats');
        return response.data.chats || [];
    },

    createChat: async (type, participants) => {
        const response = await api.post('/api/chats', { type, participants });
        return response.data;
    },

    getChatMessages: async (chatId) => {
        const response = await api.get(`/api/chats/${chatId}`);
        return response.data.chat || null;
    }
};

// ==================== MEDIA SERVICES ====================

export const mediaService = {
    uploadMedia: async (file) => {
        try {
            const formData = new FormData();
            const fileUri = file.uri;

            if (Platform.OS === 'web') {
                // On Web, we need to fetch the blob URI to get a real Blob/File object
                const response = await fetch(fileUri);
                const blob = await response.blob();
                formData.append('file', blob, file.fileName || 'upload.jpg');
            } else {
                // On Native, we use the specific object format supported by RN FormData polyfill
                formData.append('file', {
                    uri: fileUri,
                    type: file.type || 'image/jpeg',
                    name: file.fileName || 'upload.jpg'
                });
            }

            const token = authToken || await AsyncStorage.getItem('authToken');
            const baseUrl = API_ENDPOINTS.AUTH.replace('/api/auth', '');
            const uploadUrl = `${baseUrl}/api/media/upload`;

            console.log(`📡 [API] Uploading to: ${uploadUrl} (Platform: ${Platform.OS})`);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [API] Upload failed:', response.status, errorData);
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ [API] Upload successful:', data.url);
            return data;
        } catch (error) {
            console.error('🛑 [API] Upload Exception:', error.message);
            throw error;
        }
    }
};

export default api;

