import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '../utils/constants';

const Toast = ({ message, visible, onHide, type = 'success' }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onHide) onHide();
            });
        }
    }, [visible]);

    if (!visible) return null;

    const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';

    return (
        <Animated.View style={[styles.container, { opacity, backgroundColor }]}>
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 9999,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Toast;
