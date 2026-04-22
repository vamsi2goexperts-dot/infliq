export const COLORS = {
    // Primary
    deepBlue: '#00008B',
    royalBlue: '#0000CD',

    // Backgrounds
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkSlate: '#5A6C7D',

    // Text
    black: '#000000',
    darkGray: '#4A5568',

    // Accents
    green: '#00FF00',
    yellow: '#FFD700',
    orange: '#FF8C00',
    cyan: '#00FFFF',
    purple: '#9370DB'
};

export const API_BASE_URL = 'https://infliq.onrender.com';
export const API_HEALTH_URL = `${API_BASE_URL}/health`;

export const API_ENDPOINTS = {
    AUTH: `${API_BASE_URL}/api/auth`,
    USER: `${API_BASE_URL}/api/users`,
    POST: `${API_BASE_URL}/api/posts`,
    FEED: `${API_BASE_URL}/api/posts/feed`,
    CHAT: `${API_BASE_URL}/api/chats`,
    MEDIA: `${API_BASE_URL}/api/media`
};

export const SOCKET_URL = API_BASE_URL;

export const CATEGORIES = [
    { id: 'verified', label: 'Verified Voice', icon: 'person' },
    { id: 'sports', label: 'Sports', icon: 'trophy' },
    { id: 'global', label: 'Global Pu', icon: 'globe' },
    { id: 'music', label: 'Music', icon: 'musical-notes' },
    { id: 'tech', label: 'Tech', icon: 'laptop' }
];
