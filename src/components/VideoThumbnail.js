import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import ManagedVideoView from './ManagedVideoView';

export default function VideoThumbnail({ uri, style }) {
    return (
        <View style={[style, styles.container]}>
            <ManagedVideoView
                uri={uri}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                shouldPlay={false}
                isMuted={true}
                initialTimeSeconds={0.1}
                nativeControls={false}
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
