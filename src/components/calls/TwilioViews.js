import Constants from 'expo-constants';
import { View } from 'react-native';

const isExpoGo =
    Constants?.executionEnvironment === 'storeClient' ||
    Constants?.appOwnership === 'expo';

let TwilioVideoLocalView = View;
let TwilioVideoParticipantView = View;
let TwilioVideo = View;

if (!isExpoGo) {
    try {
        const sdk = require('@twilio/video-react-native-sdk');
        TwilioVideoLocalView = sdk.TwilioVideoLocalView;
        TwilioVideoParticipantView = sdk.TwilioVideoParticipantView;
        TwilioVideo = sdk.TwilioVideo;
    } catch (error) {
        console.warn('Twilio SDK unavailable, using fallback views:', error.message);
    }
}

export { TwilioVideoLocalView, TwilioVideoParticipantView, TwilioVideo };
