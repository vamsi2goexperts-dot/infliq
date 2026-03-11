import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';
import { setUnauthorizedCallback, setAuthToken, userService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle 401s by logging out
        setUnauthorizedCallback(() => {
            logout();
        });
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedToken = await AuthService.getToken();
            const storedUserId = await AsyncStorage.getItem('userId');

            if (storedToken && storedUserId) {
                setAuthToken(storedToken);
                setToken(storedToken);

                // Fetch fresh user data from backend
                try {
                    const freshUserData = await userService.getProfile(storedUserId);
                    // Handle wrapped response { user: ... } or direct user object
                    const userObj = freshUserData.user || freshUserData;
                    setUser(userObj);

                    // Update storage with fresh data
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));
                } catch (netError) {
                    console.log('Network error fetching profile, falling back to storage:', netError);
                    // Fallback to stored user data if network fails
                    const storedUser = await AuthService.getUser();
                    setUser(storedUser);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await AuthService.login(email, password);
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
    };

    const loginWithOTP = async (phone, otp, name, age) => {
        const response = await AuthService.verifyOTP(phone, otp, name, age);
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
    };

    const register = async (name, email, password, phone, age) => {
        const response = await AuthService.register(name, email, password, phone, age);
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
    };

    const setAuthSession = (user, token) => {
        setAuthToken(token);
        setToken(token);
        setUser(user);
    };

    const logout = async () => {
        await AuthService.logout();
        setAuthToken(null);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, loginWithOTP, register, logout, setAuthSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
