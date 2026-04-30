import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const TERMS_KEY = 'ugc_terms_accepted_v1';

export default function TermsConsentScreen({ onAccepted }) {
    const [accepted, setAccepted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleAccept = async () => {
        if (!accepted) {
            Alert.alert('Agreement required', 'Please agree to the Terms of Use to continue.');
            return;
        }

        setLoading(true);
        try {
            await AsyncStorage.setItem(TERMS_KEY, 'true');
            onAccepted?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.brand}>INFLIQ</Text>
                <Text style={styles.title}>Terms of Use</Text>
                <Text style={styles.subtitle}>
                    Before you access user-generated content, please agree to the rules below.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>No abusive content</Text>
                    <Text style={styles.cardText}>
                        Harassment, hate speech, spam, impersonation, threats, sexual exploitation,
                        and any objectionable content are not tolerated.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Moderation and removal</Text>
                    <Text style={styles.cardText}>
                        Reports about objectionable content or abusive users are reviewed within 24
                        hours. We remove violating content and may suspend or disable the user who
                        posted it.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Report and block tools</Text>
                    <Text style={styles.cardText}>
                        You can report posts, profiles, reels, or chats, and block abusive users from
                        profile, feed, reel, and message screens.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAccepted(prev => !prev)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                        {accepted && <Ionicons name="checkmark" size={18} color={COLORS.white} />}
                    </View>
                    <Text style={styles.checkboxText}>
                        I agree to the Terms of Use and understand that objectionable content is not allowed.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.acceptButton, !accepted && styles.acceptButtonDisabled]}
                    onPress={handleAccept}
                    disabled={loading}
                >
                    <Text style={styles.acceptButtonText}>
                        {loading ? 'Saving...' : 'Agree and Continue'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07111f'
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center'
    },
    brand: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12
    },
    title: {
        color: COLORS.white,
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 8
    },
    subtitle: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14
    },
    cardTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8
    },
    cardText: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: 14,
        lineHeight: 20
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
        marginBottom: 20
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.45)',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkboxChecked: {
        backgroundColor: COLORS.royalBlue,
        borderColor: COLORS.royalBlue
    },
    checkboxText: {
        flex: 1,
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        lineHeight: 20
    },
    acceptButton: {
        backgroundColor: COLORS.royalBlue,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center'
    },
    acceptButtonDisabled: {
        opacity: 0.5
    },
    acceptButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700'
    }
});
