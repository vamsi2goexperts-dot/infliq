import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { API_BASE_URL } from '../utils/constants';

const API_URL = `${API_BASE_URL}/api`;

class TwilioService {
    async getToken(roomName) {
        try {
            const token = await AsyncStorage.getItem('authToken');
            console.log('🎫 Requesting Twilio token for room:', roomName);

            const response = await axios.post(
                `${API_URL}/calls/token`,
                { roomName },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            console.log('✅ TWILIO_DEBUG_SYNC_V3: Received token');
            return response.data.token;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            console.error('❌ Error getting Twilio token:', errorMsg);
            Alert.alert('Auth Error', 'Failed to get call token: ' + errorMsg);
            throw new Error('Failed to get Twilio token: ' + errorMsg);
        }
    }
}

export default new TwilioService();
