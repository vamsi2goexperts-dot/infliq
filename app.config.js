const fs = require('fs');
const path = require('path');

const appJson = require('./app.json');

function readEnvValue(filePath, key) {
    try {
        if (!fs.existsSync(filePath)) return undefined;

        const content = fs.readFileSync(filePath, 'utf8');
        const line = content
            .split(/\r?\n/)
            .find((entry) => entry.trim().startsWith(`${key}=`));

        if (!line) return undefined;

        return line.slice(key.length + 1).trim();
    } catch (error) {
        return undefined;
    }
}

const backendEnvPath = path.resolve(__dirname, '..', 'backend', '.env');
const googleApiKey =
    process.env.GOOGLE_API_KEY ||
    readEnvValue(backendEnvPath, 'GOOGLE_API_KEY') ||
    'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE';

module.exports = {
    ...appJson,
    expo: {
        ...appJson.expo,
        android: {
            ...appJson.expo.android,
            config: {
                ...appJson.expo.android?.config,
                googleMaps: {
                    ...appJson.expo.android?.config?.googleMaps,
                    apiKey: googleApiKey,
                },
            },
        },
        extra: {
            ...appJson.expo.extra,
            googleApiKey,
        },
    },
};
