import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const DetailRow = ({ label, value, type = 'arrow', icon, onValueChange }) => {
    const [isEnabled, setIsEnabled] = useState(value === true);

    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        if (onValueChange) onValueChange(!isEnabled);
    };

    return (
        <TouchableOpacity 
            style={styles.row} 
            activeOpacity={type === 'switch' ? 1 : 0.7}
            disabled={type === 'switch'}
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
    const { title, sections } = route.params;

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
                contentContainerStyle={styles.scrollContent}
            >
                {sections && sections.map((section, sIdx) => (
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
                                />
                            ))}
                        </View>
                    </View>
                ))}
                
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Changes are saved automatically.</Text>
                </View>
            </ScrollView>
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
        paddingBottom: 40,
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
