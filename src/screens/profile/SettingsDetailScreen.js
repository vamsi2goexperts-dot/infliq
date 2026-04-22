import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import Toast from '../../components/Toast';

const getArticleContent = (parentTitle, label) => {
    const articles = {
        'Report a Problem': {
            'Report a Bug': [
                {
                    heading: 'How Bug Reports Are Reviewed',
                    body: 'Our support team reviews every issue based on device model, operating system version, and the exact actions taken before the problem occurred. Reports that include reproducible steps are generally resolved faster and are prioritized for the next stability release.'
                },
                {
                    heading: 'What To Include',
                    body: 'Please describe what you expected to happen, what actually happened, and whether the issue affects login, posts, chats, calls, or media uploads. Including a screenshot, time of occurrence, and network condition helps our team validate the issue quickly.'
                },
                {
                    heading: 'Response Timeline',
                    body: 'Most standard issues are reviewed within one to two business days. If the report affects account access, payments, or user safety, it is automatically escalated for faster handling.'
                }
            ],
            'Abuse or Spam': [
                {
                    heading: 'Safety Review Process',
                    body: 'Reports related to harassment, impersonation, fake engagement, spam, and abusive behavior are evaluated by the moderation team. Actions may include content review, visibility restrictions, temporary limitations, or permanent account removal depending on severity.'
                },
                {
                    heading: 'Useful Information',
                    body: 'To speed up review, include the username, a profile or post reference, and a short explanation of the issue. If the report involves repeated abuse, include multiple examples so the moderation team can assess the pattern accurately.'
                }
            ],
            'Suggestions': [
                {
                    heading: 'How Product Suggestions Are Evaluated',
                    body: 'Feature ideas are reviewed based on demand, user impact, design feasibility, and overall product direction. The most useful suggestions usually explain the problem being solved and how the improvement would make the experience simpler or more valuable.'
                },
                {
                    heading: 'What Makes A Strong Suggestion',
                    body: 'Helpful requests are specific, practical, and connected to a clear user need. Suggestions around profile controls, creator tools, feed personalization, privacy settings, and discovery features are reviewed regularly as part of our planning cycle.'
                }
            ]
        },
        'Terms of Service': {
            'User Agreement': [
                {
                    heading: 'Account Responsibility',
                    body: 'By using INFLIQ, users agree to maintain accurate account information, protect access credentials, and avoid activities that interfere with platform safety, reliability, or the experience of other users. Users remain responsible for all activity performed through their account.'
                },
                {
                    heading: 'Content Ownership And Usage',
                    body: 'Users retain ownership of the content they create and share. By posting content on the platform, users grant INFLIQ a limited license to host, display, distribute, and optimize that content within the service for product functionality, safety review, and promotion of the platform.'
                }
            ],
            'Community Guidelines': [
                {
                    heading: 'Respectful Participation',
                    body: 'Community spaces are intended to support constructive conversation, creativity, and safe interaction. Content that promotes harassment, hate, targeted abuse, violent threats, impersonation, or deceptive behavior is not permitted and may lead to removal or account action.'
                },
                {
                    heading: 'Authenticity And Trust',
                    body: 'Users should share content honestly and avoid manipulative engagement practices, misleading claims, or repeated spam behavior. Reports are reviewed in context, and enforcement decisions consider both severity and repeated violations over time.'
                },
                {
                    heading: 'Frequently Asked Questions',
                    body: 'Users can report abusive behavior through the support section in Settings. Reposted content should only be shared with permission or clear attribution, and repeated violations of safety standards may result in reduced distribution, warning notices, or permanent restrictions.'
                }
            ]
        },
        'Privacy Policy': {
            'Data Usage': [
                {
                    heading: 'Information We Collect',
                    body: 'INFLIQ may collect account details, profile information, device diagnostics, interaction signals, and service usage data to support login, discovery, safety, feed ranking, notifications, and account protection. Data collection is limited to information necessary for service quality and user experience.'
                },
                {
                    heading: 'How Data Is Used',
                    body: 'Collected information is used to personalize the app experience, improve search and recommendations, support moderation, troubleshoot performance issues, and communicate important account updates. Certain data may also be used to improve reliability and detect misuse.'
                }
            ],
            'Cookie Policy': [
                {
                    heading: 'Session And Preference Cookies',
                    body: 'Cookies and similar technologies are used to keep users signed in, remember display preferences, protect account sessions, and improve service continuity between visits. These technologies help deliver a faster and more consistent experience across supported devices.'
                },
                {
                    heading: 'Security And Performance',
                    body: 'Some cookies and local storage tools are used to detect unusual activity, protect accounts from unauthorized access, and understand product performance. These tools support fraud prevention, service availability, and smoother navigation throughout the platform.'
                }
            ],
            'Request Verification': [
                {
                    heading: 'Verification Eligibility',
                    body: 'Verification is intended for notable public figures, creators, brands, and organizations that maintain a complete and authentic presence on the platform. Review decisions are based on identity confirmation, profile quality, and overall account trust signals.'
                },
                {
                    heading: 'Review Expectations',
                    body: 'Applications are reviewed in submission order, and additional documentation may be requested when needed. Approval is based on account authenticity and consistency, and submitting a request does not guarantee verification status.'
                }
            ],
            'Visit Website': [
                {
                    heading: 'Official Contact Channels',
                    body: 'The official INFLIQ website provides platform updates, product information, and support resources. Users can also access account help, legal information, and media contact details through the official support and company communication channels.'
                }
            ],
            'Hidden Words': [
                {
                    heading: 'Content Filtering Controls',
                    body: 'Hidden word controls help reduce exposure to unwanted phrases, spam, and harmful language in comment sections and message requests. These settings are designed to improve safety while allowing users to personalize how visible interactions are filtered.'
                }
            ],
            'Chat Wallpaper': [
                {
                    heading: 'Conversation Appearance',
                    body: 'Chat appearance settings allow users to personalize the visual tone of their messaging experience while preserving readability and comfort. Theme options are designed to keep conversations clear across both light and high-contrast viewing environments.'
                }
            ],
            'Posts and Reels': [
                {
                    heading: 'Content Notification Controls',
                    body: 'Users can manage alerts related to likes, comments, mentions, and creator updates for posts and reels. These controls are designed to balance relevance with frequency, helping users stay informed without receiving excessive notifications.'
                }
            ],
            'Messages': [
                {
                    heading: 'Message Notification Controls',
                    body: 'Message alerts can be adjusted based on conversation type, delivery urgency, and request status. These controls help users stay responsive to important chats while reducing interruptions from muted or lower-priority conversations.'
                }
            ]
        },
        'About Infliq': {
            'Visit Website': [
                {
                    heading: 'About The Platform',
                    body: 'INFLIQ is built to support creator discovery, social interaction, real-time communication, and audience growth through a modern, mobile-first experience. The platform combines profiles, feed content, reels, messaging, and community interaction into a unified social product.'
                }
            ]
        }
    };

    return articles[parentTitle]?.[label] || null;
};

const getNestedSections = (parentTitle, label) => {
    const nestedContent = {
        'Report a Problem': {
            'Report a Bug': [
                {
                    title: 'Common Issues',
                    items: [
                        { label: 'App crashes on launch', value: 'Troubleshooting article', type: 'text' },
                        { label: 'Media upload stuck', value: 'Usually fixed by retrying on Wi-Fi', type: 'text' },
                        { label: 'Login OTP delay', value: 'Allow up to 30 seconds', type: 'text' },
                    ]
                },
                {
                    title: 'Before You Submit',
                    items: [
                        { label: 'Include device model', value: 'Recommended', type: 'text' },
                        { label: 'Attach screenshot', value: 'Helpful', type: 'text' },
                        { label: 'Expected response time', value: '24-48 hours', type: 'text' },
                    ]
                }
            ],
            'Abuse or Spam': [
                {
                    title: 'Safety Help',
                    items: [
                        { label: 'Fake accounts', value: 'Review in progress', type: 'text' },
                        { label: 'Harassment reports', value: 'Priority handling', type: 'text' },
                        { label: 'Impersonation', value: 'Needs profile link', type: 'text' },
                    ]
                },
                {
                    title: 'What To Include',
                    items: [
                        { label: 'Username or post link', value: 'Required', type: 'text' },
                        { label: 'Screenshot evidence', value: 'Optional', type: 'text' },
                    ]
                }
            ],
            'Suggestions': [
                {
                    title: 'Popular Requests',
                    items: [
                        { label: 'Dark mode', value: 'Design finalized', type: 'text' },
                        { label: 'Saved collections', value: 'Collections enabled', type: 'text' },
                        { label: 'Story reactions', value: 'Quick reactions active', type: 'text' },
                    ]
                },
                {
                    title: 'How Suggestions Are Reviewed',
                    items: [
                        { label: 'Product review cycle', value: 'Weekly', type: 'text' },
                        { label: 'Community voting', value: 'Enabled internally', type: 'text' },
                    ]
                }
            ]
        },
        'Terms of Service': {
            'User Agreement': [
                {
                    title: 'Account Terms',
                    items: [
                        { label: 'Minimum age', value: '13+', type: 'text' },
                        { label: 'Account responsibility', value: 'User managed', type: 'text' },
                        { label: 'Content ownership', value: 'Retained by creator', type: 'text' },
                    ]
                },
                {
                    title: 'Platform Rules',
                    items: [
                        { label: 'Prohibited behavior', value: 'Spam, abuse, impersonation', type: 'text' },
                        { label: 'Enforcement', value: 'Warnings or account limits', type: 'text' },
                    ]
                }
            ],
            'Community Guidelines': [
                {
                    title: 'Posting Rules',
                    items: [
                        { label: 'Respectful conduct', value: 'Required in all communities', type: 'text' },
                        { label: 'Sensitive content', value: 'Must follow moderation rules', type: 'text' },
                        { label: 'Misleading content', value: 'Not allowed', type: 'text' },
                    ]
                },
                {
                    title: 'Helpful FAQs',
                    items: [
                        { label: 'Can I repost content?', value: 'Yes, with permission or attribution', type: 'text' },
                        { label: 'How do I report abuse?', value: 'Use Report a Problem in Settings', type: 'text' },
                        { label: 'What happens after a report?', value: 'The moderation team reviews it', type: 'text' },
                    ]
                }
            ]
        },
        'Privacy Policy': {
            'Data Usage': [
                {
                    title: 'What We Store',
                    items: [
                        { label: 'Profile details', value: 'Name, bio, avatar', type: 'text' },
                        { label: 'Activity signals', value: 'Likes, follows, interactions', type: 'text' },
                        { label: 'Device data', value: 'Basic diagnostics only', type: 'text' },
                    ]
                }
            ],
            'Cookie Policy': [
                {
                    title: 'Web Tracking',
                    items: [
                        { label: 'Session cookies', value: 'Used for sign-in', type: 'text' },
                        { label: 'Preference cookies', value: 'Remember settings', type: 'text' },
                        { label: 'Ad cookies', value: 'Not enabled in this build', type: 'text' },
                    ]
                }
            ],
            'Request Verification': [
                {
                    title: 'Verification Checklist',
                    items: [
                        { label: 'Government ID', value: 'Required', type: 'text' },
                        { label: 'Profile completeness', value: '80% or higher', type: 'text' },
                        { label: 'Review timeline', value: '5-7 business days', type: 'text' },
                    ]
                }
            ],
            'Visit Website': [
                {
                    title: 'Official Links',
                    items: [
                        { label: 'Website', value: 'www.infliq.com', type: 'text' },
                        { label: 'Support email', value: 'support@infliq.com', type: 'text' },
                        { label: 'Press contact', value: 'media@infliq.com', type: 'text' },
                    ]
                }
            ],
            'Posts and Reels': [
                {
                    title: 'Notification Types',
                    items: [
                        { label: 'Likes', value: 'Enabled', type: 'text' },
                        { label: 'Comments', value: 'Enabled', type: 'text' },
                        { label: 'Mentions', value: 'Priority only', type: 'text' },
                    ]
                }
            ],
            'Messages': [
                {
                    title: 'Inbox Alerts',
                    items: [
                        { label: 'Direct messages', value: 'Instant', type: 'text' },
                        { label: 'Requests', value: 'Instant', type: 'text' },
                        { label: 'Muted chats', value: 'Off', type: 'text' },
                    ]
                }
            ],
            'Chat Wallpaper': [
                {
                    title: 'Available Themes',
                    items: [
                        { label: 'Aurora', value: 'Installed', type: 'text' },
                        { label: 'Midnight Blue', value: 'Installed', type: 'text' },
                        { label: 'Warm Sand', value: 'Installed', type: 'text' },
                    ]
                }
            ],
            'Hidden Words': [
                {
                    title: 'Content Filters',
                    items: [
                        { label: 'Blocked phrases', value: '14 active', type: 'text' },
                        { label: 'Custom word list', value: 'Enabled', type: 'text' },
                    ]
                }
            ]
        }
    };

    return nestedContent[parentTitle]?.[label] || [
        {
            title: label,
            items: [
                { label: 'Overview', value: 'Information available', type: 'text' },
                { label: 'Last updated', value: 'Today', type: 'text' },
                { label: 'Help article', value: 'Open support article', type: 'text' },
            ]
        }
    ];
};

const DetailRow = ({ label, value, type = 'arrow', icon, onValueChange, onPress }) => {
    const [isEnabled, setIsEnabled] = useState(value === true);

    const toggleSwitch = () => {
        const nextValue = !isEnabled;
        setIsEnabled(nextValue);
        if (onValueChange) onValueChange(nextValue);
    };

    const handlePress = () => {
        if (type === 'switch') {
            toggleSwitch();
            return;
        }

        if (onPress) {
            onPress({ label, value, type });
        }
    };

    return (
        <TouchableOpacity 
            style={styles.row}
            activeOpacity={0.7}
            onPress={handlePress}
        >
            <View style={styles.rowLeft}>
                {icon && <Ionicons name={icon} size={20} color={COLORS.darkGray} style={styles.rowIcon} />}
                <Text style={styles.rowLabel}>{label}</Text>
            </View>
            <View style={styles.rowRight}>
                {type === 'switch' ? (
                    <Switch
                        trackColor={{ false: "#767577", true: COLORS.royalBlue }}
                        thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                ) : type === 'text' ? (
                    <Text style={styles.rowValue}>{value}</Text>
                ) : (
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function SettingsDetailScreen({ navigation, route }) {
    const { title, sections, articleContent } = route.params;
    const insets = useSafeAreaInsets();
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    const handleRowPress = ({ label, value, type }) => {
        if (type === 'text') {
            showToast(`${label}: ${value}`, 'success');
            return;
        }

        if (label === 'Delete Account') {
            navigation.navigate('DeleteAccount');
            return;
        }

        const article = getArticleContent(title, label);
        if (article) {
            navigation.navigate('SettingsDetail', {
                title: label,
                articleContent: article
            });
            return;
        }

        navigation.navigate('SettingsDetail', {
            title: label,
            sections: getNestedSections(title, label)
        });
    };

    const handleSwitchChange = (label, nextValue) => {
        showToast(`${label} ${nextValue ? 'enabled' : 'disabled'}.`, 'success');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom + 32, 56) }
                ]}
            >
                {articleContent ? (
                    <View style={styles.articleWrapper}>
                        {articleContent.map((section, index) => (
                            <View key={index} style={styles.articleSection}>
                                <Text style={styles.articleHeading}>{section.heading}</Text>
                                <Text style={styles.articleBody}>{section.body}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    sections && sections.map((section, sIdx) => (
                        <View key={sIdx} style={styles.section}>
                            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
                            <View style={styles.rowsContainer}>
                                {section.items.map((item, iIdx) => (
                                    <DetailRow 
                                        key={iIdx}
                                        label={item.label}
                                        value={item.value}
                                        type={item.type}
                                        icon={item.icon}
                                        onPress={handleRowPress}
                                        onValueChange={(nextValue) => handleSwitchChange(item.label, nextValue)}
                                    />
                                ))}
                            </View>
                        </View>
                    ))
                )}
                
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Changes are saved automatically.</Text>
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
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    scrollContent: {
    },
    articleWrapper: {
        paddingHorizontal: 18,
        paddingTop: 18,
    },
    articleSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    articleHeading: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 10,
    },
    articleBody: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#718096',
        marginLeft: 20,
        marginBottom: 8,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    rowsContainer: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EDF2F7',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 16,
        color: '#2D3748',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 15,
        color: '#718096',
        marginRight: 5,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    footerText: {
        fontSize: 13,
        color: '#A0AEC0',
        textAlign: 'center',
    }
});
