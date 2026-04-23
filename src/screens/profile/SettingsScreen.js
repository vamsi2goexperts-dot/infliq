import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const SettingsItem = ({ icon, label, onPress, showArrow = true, color = COLORS.black }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <View style={styles.itemLeft}>
            <Ionicons name={icon} size={22} color={color} style={styles.itemIcon} />
            <Text style={[styles.itemLabel, { color }]}>{label}</Text>
        </View>
        {showArrow && <Ionicons name="chevron-forward" size={18} color="#999" />}
    </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

export default function SettingsScreen({ navigation }) {
    const { logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [toast, setToast] = React.useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    };

    const navigateToDetail = (title, sections) => {
        navigation.navigate('SettingsDetail', { title, sections });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom + 40, 72) }
                ]}
            >
                {/* ACCOUNT SECTION */}
                <SectionHeader title="ACCOUNT" />
                <SettingsItem 
                    icon="list-outline" 
                    label="Your Activity" 
                    onPress={() => navigateToDetail("Your Activity", [
                        {
                            title: "Time Spent",
                            items: [
                                { label: "Daily Average", value: "2h 15m", type: "text" },
                                { label: "Weekly View", value: "15h 40m", type: "text" }
                            ]
                        },
                        {
                            title: "Interactions",
                            items: [
                                { label: "Likes Given", value: "1,240", type: "text" },
                                { label: "Comments", value: "342", type: "text" },
                                { label: "Shares", value: "89", type: "text" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="lock-closed-outline" 
                    label="Privacy and Safety" 
                    onPress={() => navigateToDetail("Privacy and Safety", [
                        {
                            title: "Account Privacy",
                            items: [
                                { label: "Private Account", value: false, type: "switch" },
                                { label: "Allow Message Requests", value: true, type: "switch" }
                            ]
                        },
                        {
                            title: "Safety",
                            items: [
                                { label: "Blocked Accounts", value: "12", type: "text" },
                                { label: "Hidden Words", type: "arrow" },
                                { label: "Mentions", value: "Everyone", type: "text" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="notifications-outline" 
                    label="Notification Settings" 
                    onPress={() => navigateToDetail("Notification Settings", [
                        {
                            title: "Push Notifications",
                            items: [
                                { label: "Pause All", value: false, type: "switch" },
                                { label: "Posts and Reels", type: "arrow" },
                                { label: "Messages", type: "arrow" }
                            ]
                        },
                        {
                            title: "Other",
                            items: [
                                { label: "Email Notifications", value: "Subscribed", type: "text" },
                                { label: "Live Broadcasts", value: true, type: "switch" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="person-outline" 
                    label="Account Management" 
                    onPress={() => navigateToDetail("Account Management", [
                        {
                            title: "Personal Information",
                            items: [
                                { label: "Email", value: "user@infliq.com", type: "text" },
                                { label: "Phone Number", value: "+91 94414*****7", type: "text" },
                                { label: "Gender", value: "Not specified", type: "text" }
                            ]
                        },
                        {
                            title: "Account Actions",
                            items: [
                                { label: "Deactivate Account", value: "Temporarily disabled", type: "text" },
                                { label: "Delete Account", type: "arrow" }
                            ]
                        }
                    ])}
                />

                {/* CHATS SECTION */}
                <SectionHeader title="CHATS" />
                <SettingsItem 
                    icon="help-circle-outline" 
                    label="Chats Settings" 
                    onPress={() => navigateToDetail("Chats Settings", [
                        {
                            title: "Display",
                            items: [
                                { label: "Theme", value: "System Default", type: "text" },
                                { label: "Chat Wallpaper", type: "arrow" }
                            ]
                        },
                        {
                            title: "Storage",
                            items: [
                                { label: "Auto-Download Media", value: true, type: "switch" },
                                { label: "Backup Chats", value: "Last: Today", type: "text" }
                            ]
                        }
                    ])}
                />

                {/* SUPPORT SECTION */}
                <SectionHeader title="SUPPORT" />
                <SettingsItem 
                    icon="warning-outline" 
                    label="Report a Problem" 
                    onPress={() => navigation.navigate('SettingsDetail', {
                        title: 'Report a Problem',
                        articleContent: [
                            {
                                heading: '1. How do I report a bug in the app?',
                                body: 'If something is not working as expected, open the support area from Settings and include the screen name, what you were trying to do, and what happened instead. Reports with clear steps help the support team review the issue faster.'
                            },
                            {
                                heading: '2. What details should I include in my report?',
                                body: 'The most helpful reports include your device model, app version, network condition, and the approximate time the issue occurred. If available, screenshots or screen recordings can make it easier to understand the problem.'
                            },
                            {
                                heading: '3. How long does it take to review a report?',
                                body: 'Most reports are reviewed within one to two business days. Issues related to login, safety, payments, or account access are handled with higher priority whenever possible.'
                            },
                            {
                                heading: '4. Can I report abusive content or spam?',
                                body: 'Yes. Reports involving harassment, spam, impersonation, or harmful behavior are reviewed by the moderation team. The team evaluates the report in context and may take action based on severity and account history.'
                            },
                            {
                                heading: '5. Will I be notified after submitting a report?',
                                body: 'Important updates may appear in the app or through your support history when additional information is needed. In some cases, action may be taken without a direct follow-up message if the issue has already been resolved internally.'
                            },
                            {
                                heading: '6. What if I have a suggestion instead of a bug?',
                                body: 'Suggestions are welcome and are reviewed as part of product planning. The most useful requests explain the specific problem, why the improvement matters, and how it would make the experience better for users.'
                            },
                            {
                                heading: '7. Can I report a problem with messages or calls?',
                                body: 'Yes. If the issue affects chat delivery, notifications, call connection, or media sharing, mention whether it happened in a one-to-one chat, a request thread, or during an active call so the team can narrow down the cause.'
                            },
                            {
                                heading: '8. What should I do if login or OTP is delayed?',
                                body: 'Please allow a short waiting period and confirm that your network signal is stable. If the issue continues, include the phone number format used and the time the request was made so the support team can review delivery behavior.'
                            },
                            {
                                heading: '9. Are repeated reports necessary for the same issue?',
                                body: 'One clear report is usually enough. If you notice new behavior related to the same issue, it is better to add updated details rather than sending multiple separate reports with identical information.'
                            },
                            {
                                heading: '10. How are urgent safety concerns handled?',
                                body: 'Safety-related reports are prioritized and reviewed as quickly as possible. Content or accounts that appear to involve immediate abuse, impersonation, or threats may be limited while the review is in progress.'
                            }
                        ]
                    })}
                />
                <SettingsItem 
                    icon="star-outline" 
                    label="Infliq Verified" 
                    onPress={() => navigateToDetail("Infliq Verified", [
                        {
                            title: "Verification Status",
                            items: [
                                { label: "Current Status", value: "Not Verified", type: "text" },
                                { label: "Request Verification", type: "arrow" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="globe-outline" 
                    label="Languages" 
                    onPress={() => navigateToDetail("Languages", [
                        {
                            title: "App Language",
                            items: [
                                { label: "English (US)", value: true, type: "switch" },
                                { label: "Hindi", value: false, type: "switch" },
                                { label: "Spanish", value: false, type: "switch" }
                            ]
                        }
                    ])}
                />

                {/* ABOUT SECTION */}
                <SectionHeader title="ABOUT" />
                <SettingsItem 
                    icon="information-circle-outline" 
                    label="About Infliq" 
                    showArrow={true}
                    onPress={() => navigateToDetail("About Infliq", [
                        {
                            items: [
                                { label: "Version", value: "1.0.0", type: "text" },
                                { label: "Build Number", value: "1024", type: "text" },
                                { label: "Visit Website", type: "arrow" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="document-text-outline" 
                    label="Terms of Service" 
                    showArrow={true}
                    onPress={() => navigateToDetail("Terms of Service", [
                        {
                            items: [
                                { label: "User Agreement", type: "arrow" },
                                { label: "Community Guidelines", type: "arrow" }
                            ]
                        }
                    ])}
                />
                <SettingsItem 
                    icon="shield-checkmark-outline" 
                    label="Privacy Policy" 
                    showArrow={true}
                    onPress={() => navigateToDetail("Privacy Policy", [
                        {
                            items: [
                                { label: "Data Usage", type: "arrow" },
                                { label: "Cookie Policy", type: "arrow" },
                                { label: "Location Tracking", value: "While Using", type: "text" }
                            ]
                        }
                    ])}
                />

                {/* LOGOUT BUTTON */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={22} color={COLORS.red} style={styles.itemIcon} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
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
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 15,
    },
    itemLabel: {
        fontSize: 16,
        color: COLORS.black,
    },
    scrollContent: {
        flexGrow: 1,
    },
    logoutContainer: {
        marginTop: 40,
        marginBottom: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 15,
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: COLORS.red,
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        marginTop: 15,
        fontSize: 12,
        color: '#999',
    }
});
