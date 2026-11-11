module.exports = ({ config }) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const plugins = [...(config.plugins ?? []), 'expo-status-bar'];
  if (apiKey) plugins.push(['react-native-maps', { androidGoogleMapsApiKey: apiKey }]);

  return {
    ...config,
    plugins,
  };
};