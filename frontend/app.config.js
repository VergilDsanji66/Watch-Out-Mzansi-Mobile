import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.GOOGLE_API_KEY,
    },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_API_KEY,
      },
    },
  },
  plugins: [
    ...(config.plugins || []), // keep existing plugins if any
    'expo-font',
  ],
});
