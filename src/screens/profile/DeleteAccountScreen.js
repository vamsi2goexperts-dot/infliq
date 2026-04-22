import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import Toast from '../../components/Toast';
export default function DeleteAccountScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const reasons = [
        'Privacy concerns',
        'Too many notifications',
        'Created another account',
        'Not finding relevant content',
        'Taking a break from social apps',
    ];

    const handleSubmit = () => {
        if (!email.trim() || !selectedReason) {
            Alert.alert('Incomplete Form', 'Please enter your email and select a reason to continue.');
            return;
        }

        setToast({
            visible: true,
            message: 'Account deletion request submitted successfully.',
            type: 'success'
        });

        setTimeout(() => {
            navigation.goBack();
        }, 1200);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delete Account</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, 56) }]}
            >
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>We are sorry to see you go</Text>
                    <Text style={styles.heroText}>
                        Please confirm your account credentials below. Your profile, posts, messages, and account history will be scheduled for removal after review.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Verification</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#94A3B8"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason For Leaving</Text>
                    {reasons.map((reason) => {
                        const active = selectedReason === reason;
                        return (
                            <TouchableOpacity
                                key={reason}
                                style={[styles.reasonCard, active && styles.reasonCardActive]}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                                    {active ? <View style={styles.radioInner} /> : null}
                                </View>
                                <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{reason}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={handleSubmit}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                    <Text style={styles.deleteButtonText}>Submit Deletion Request</Text>
                </TouchableOpacity>
            </ScrollView>

            <Toast
                message={toast.message}
                visible={toast.visible}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    content: {
        padding: 16,
    },
    heroCard: {
        backgroundColor: '#FFF1F2',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FECDD3',
        marginBottom: 18,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#881337',
        marginBottom: 8,
    },
    heroText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#9F1239',
    },
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    input: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.black,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    reasonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    reasonCardActive: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioOuterActive: {
        borderColor: '#DC2626',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DC2626',
    },
    reasonText: {
        fontSize: 15,
        color: COLORS.black,
    },
    reasonTextActive: {
        fontWeight: '600',
        color: '#7F1D1D',
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    deleteButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },
});
