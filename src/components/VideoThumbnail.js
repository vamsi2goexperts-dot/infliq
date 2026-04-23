import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { COLORS } from '../utils/constants';

export default function VideoThumbnail({ uri, style }) {
    return (
        <View style={[style, styles.container]}>
            <Video
                source={{ uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                shouldPlay={false}
                positionMillis={100} // Show frame at 0.1s
                isMuted={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.lightGray,
        overflow: 'hidden'
    }
});
