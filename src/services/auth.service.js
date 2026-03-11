import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
    async sendOTP(phone) {
        try {
            const response = await api.post('/api/auth/send-otp', { phone });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async verifyOTP(phone, otp, name, age) {
        try {
            const response = await api.post('/api/auth/verify-otp', {
                phone,
                otp,
                name,
                age
            });

            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.user._id);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async login(email, password) {
        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });

            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.user._id);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async register(name, email, password, phone, age) {
        try {
            const response = await api.post('/api/auth/register', {
                name,
                email,
                password,
                phone,
                age
            });

            if (response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.user._id);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async logout() {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('user');
    }

    async getToken() {
        return await AsyncStorage.getItem('authToken');
    }

    async getUser() {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    async isAuthenticated() {
        const token = await this.getToken();
        return !!token;
    }
}

export default new AuthService();
