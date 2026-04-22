import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    ImageBackground
} from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loginWithOTP } = useAuth();

    const handleSendOTP = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter phone number');
            return;
        }

        setLoading(true);
        try {
            await authService.sendOTP(phone);
            setShowOTP(true);
        } catch (error) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.error || error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter OTP');
            return;
        }

        setLoading(true);
        try {
            await loginWithOTP(phone, otp);
        } catch (error) {
            Alert.alert('Error', error.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ImageBackground
                    source={require('../../../assets/login-background.jpeg')}
                    style={styles.background}
                    resizeMode="cover"
                    blurRadius={3}
                >
                    <View style={styles.overlay}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Text style={styles.logo}>⭐ INFLIQ</Text>
                        </View>

                        {/* Headline */}
                        <Text style={styles.headline}>
                            Redefines how{'\n'}the world{'\n'}connects instant,{'\n'}intelligent, and{'\n'}infinitely inspiring.
                        </Text>

                        {/* Form Card */}
                        <View style={styles.cardContainer}>
                            <BlurView intensity={30} tint="light" style={styles.blurContainer}>
                                <View style={styles.cardContent}>
                                    {!showOTP ? (
                                        <>
                                            <View style={[styles.inputContainer, phone.length === 10 && styles.inputContainerSuccess]}>
                                                <Text style={styles.inputIcon}>📱</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Mobile Number (10 digits)"
                                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                    value={phone}
                                                    onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                />
                                                {phone.length === 10 && (
                                                    <Text style={styles.validIcon}>✅</Text>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                style={[
                                                    styles.loginButton,
                                                    styles.otpButton,
                                                    phone.length !== 10 && styles.buttonDisabled
                                                ]}
                                                onPress={handleSendOTP}
                                                disabled={loading || phone.length !== 10}
                                            >
                                                <Text style={styles.loginButtonText}>
                                                    {loading ? 'Sending...' : 'Send OTP'}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.inputIcon}>🔢</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter OTP"
                                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                    value={otp}
                                                    onChangeText={setOtp}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={styles.loginButton}
                                                onPress={handleVerifyOTP}
                                                disabled={loading}
                                            >
                                                <Text style={styles.loginButtonText}>
                                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setShowOTP(false)}>
                                                <Text style={styles.forgotPassword}>Change Phone Number</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={styles.createAccount}>Create a New Account</Text>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </View>
                    </View>
                </ImageBackground>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.deepBlue
    },
    scrollContent: {
        flexGrow: 1
    },
    background: {
        minHeight: '100%',
        backgroundColor: COLORS.deepBlue,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'center'
    },
    logoContainer: {
        marginBottom: 30
    },
    logo: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold'
    },
    headline: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        lineHeight: 40
    },
    cardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        width: '100%',
    },
    cardContent: {
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
        color: COLORS.white
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.white
    },
    forgotPassword: {
        color: 'rgba(255, 255, 255, 0.8)',
        textDecorationLine: 'underline',
        marginBottom: 16,
        textAlign: 'center'
    },
    loginButton: {
        backgroundColor: COLORS.deepBlue,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16
    },
    otpButton: {
        backgroundColor: COLORS.royalBlue
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },
    inputContainerSuccess: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        backgroundColor: 'rgba(76, 175, 80, 0.1)'
    },
    validIcon: {
        fontSize: 18,
        marginLeft: 8
    },
    buttonDisabled: {
        opacity: 0.6,
        backgroundColor: COLORS.mediumGray || '#999'
    },
    createAccount: {
        color: COLORS.white,
        textDecorationLine: 'underline',
        textAlign: 'center',
        marginTop: 10,
        opacity: 0.9,
        fontWeight: '500'
    }
});
