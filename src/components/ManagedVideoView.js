import React, { useEffect } from 'react';
import { VideoView, useVideoPlayer } from 'expo-video';

const normalizeUri = (uri) => {
    if (!uri || typeof uri !== 'string') return null;
    return uri.startsWith('http://') ? uri.replace('http://', 'https://') : uri;
};

function ManagedVideoViewInner({
    source,
    style,
    contentFit = 'cover',
    shouldPlay = true,
    isMuted = false,
    loop = false,
    nativeControls = false,
    surfaceType,
    initialTimeSeconds,
}) {
    const player = useVideoPlayer(source, (videoPlayer) => {
        videoPlayer.loop = loop;
        videoPlayer.muted = isMuted;

        if (typeof initialTimeSeconds === 'number') {
            videoPlayer.currentTime = initialTimeSeconds;
        }
    });

    useEffect(() => {
        player.loop = loop;
        player.muted = isMuted;
    }, [player, loop, isMuted]);

    useEffect(() => {
        if (typeof initialTimeSeconds === 'number') {
            player.currentTime = initialTimeSeconds;
        }
    }, [player, initialTimeSeconds, source]);

    useEffect(() => {
        if (shouldPlay) {
            player.play();
        } else {
            player.pause();
        }
    }, [player, shouldPlay]);

    return (
        <VideoView
            player={player}
            style={style}
            contentFit={contentFit}
            nativeControls={nativeControls}
            surfaceType={surfaceType}
        />
    );
}

export default function ManagedVideoView(props) {
    const source = normalizeUri(props.uri);

    if (!source) {
        return null;
    }

    return <ManagedVideoViewInner {...props} source={source} />;
}
