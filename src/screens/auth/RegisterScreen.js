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
import { authService, userService, setAuthToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
    const { loginWithOTP, setAuthSession } = useAuth();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // Flow State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [verifiedUser, setVerifiedUser] = useState(null);
    const [verifiedToken, setVerifiedToken] = useState(null);

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            await authService.sendOTP(phone);
            setIsOtpSent(true);
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
            const response = await authService.verifyOTP(phone, otp);
            if (response.token && response.user) {
                setAuthToken(response.token);
                setUserId(response.user._id);
                setVerifiedUser(response.user);
                setVerifiedToken(response.token);
                setIsPhoneVerified(true);
                Alert.alert('Success', 'Phone verified successfully!');
            } else {
                Alert.alert('Error', 'Verification failed');
            }
        } catch (error) {
            console.error('Verify error:', error);
            Alert.alert('Error', error.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter your full name');
            return;
        }
        if (!isPhoneVerified) {
            Alert.alert('Error', 'Please verify your mobile number first');
            return;
        }

        setLoading(true);
        try {
            // Update profile with Name (and Email)
            if (userId) {
                await userService.updateProfile(userId, { name, email });
            }
            // Manually set session to trigger navigation to avoid re-verifying OTP
            if (verifiedUser && verifiedToken) {
                setAuthSession(verifiedUser, verifiedToken);
            } else {
                // Fallback (shouldn't happen if flow is followed)
                await loginWithOTP(phone, otp);
            }
        } catch (error) {
            console.error('Registration/Update error:', error);
            Alert.alert('Error', 'Failed to complete registration');
        } finally {
            setLoading(false);
        }
    };

    const isPhoneValid = phone.length === 10;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ImageBackground
                    source={require('../../../assets/register-background.jpg')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logo}>⭐ INFLIQ</Text>
                        </View>
                        <Text style={styles.headline}>Join the{'\n'}INFLIQ community</Text>

                        <View style={styles.card}>
                            {/* 1. Name Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputIcon}>👤</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* 2. Email Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputIcon}>📧</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address (Optional)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* 3. Phone Input + Verify Action */}
                            <View style={[styles.inputContainer, isPhoneVerified && styles.inputContainerSuccess]}>
                                <Text style={styles.inputIcon}>📱</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mobile Number (10 digits)"
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text.replace(/[^0-9]/g, ''));
                                        // Reset verification if phone changes significantly? 
                                        // Maybe just lock input if verified? For now, let's keep editable but reset if changed.
                                        if (isPhoneVerified) {
                                            setIsPhoneVerified(false);
                                            setIsOtpSent(false);
                                            setOtp('');
                                        }
                                    }}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                                {isPhoneVerified && <Text style={styles.validIcon}>✅</Text>}

                                {!isPhoneVerified && isPhoneValid && !isOtpSent && (
                                    <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                                        <Text style={styles.inlineVerifyLink}>{loading ? '...' : 'Verify'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* 4. OTP Input (Visible only after sending OTP, and if not yet verified) */}
                            {isOtpSent && !isPhoneVerified && (
                                <View style={styles.otpSection}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputIcon}>🔢</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.verifyOtpButton}
                                        onPress={handleVerifyOTP}
                                        disabled={loading}
                                    >
                                        <Text style={styles.verifyOtpText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                                        <Text style={styles.changePhoneText}>Resend or Change Number</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* 5. Create Account Button (Enabled only when verified) */}
                            <TouchableOpacity
                                style={[
                                    styles.registerButton,
                                    (!isPhoneVerified || !name) && styles.buttonDisabled
                                ]}
                                onPress={handleCreateAccount}
                                disabled={loading || !isPhoneVerified || !name}
                            >
                                <Text style={styles.registerButtonText}>
                                    {loading ? 'Creating...' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.backToLogin}>Already have an account? Login</Text>
                            </TouchableOpacity>
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
        backgroundColor: COLORS.deepBlue, // Fallback
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
        overflow: 'hidden', // Ensure blur respects border radius
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle tint on top of blur
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent inputs
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
        color: COLORS.white // White icons for contrast
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.white // White text
    },
    inputContainerSuccess: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        backgroundColor: 'rgba(76, 175, 80, 0.1)' // Green tint
    },
    validIcon: {
        fontSize: 18,
        marginLeft: 8
    },
    inlineVerifyLink: {
        color: COLORS.white, // White link for better contrast
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 8,
        textDecorationLine: 'underline'
    },
    otpSection: {
        marginTop: -8,
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass background
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    verifyOtpButton: {
        backgroundColor: COLORS.royalBlue,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8
    },
    verifyOtpText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14
    },
    changePhoneText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white
        textAlign: 'center',
        textDecorationLine: 'underline'
    },
    registerButton: {
        backgroundColor: COLORS.deepBlue,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8
    },
    buttonDisabled: {
        opacity: 0.6,
        backgroundColor: COLORS.mediumGray || '#999'
    },
    registerButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },
    backToLogin: {
        color: COLORS.white,
        textDecorationLine: 'underline',
        textAlign: 'center',
        marginTop: 10,
        opacity: 0.8
    }
});
