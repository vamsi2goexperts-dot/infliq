import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

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
                contentContainerStyle={styles.scrollContent}
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
                    onPress={() => navigateToDetail("Report a Problem", [
                        {
                            title: "Feedback",
                            items: [
                                { label: "Report a Bug", type: "arrow" },
                                { label: "Abuse or Spam", type: "arrow" },
                                { label: "Suggestions", type: "arrow" }
                            ]
                        }
                    ])}
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
        paddingBottom: 60,
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
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fee2e2',
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
