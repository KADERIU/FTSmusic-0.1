const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Redirige "node-fetch" vers "cross-fetch"
defaultConfig.resolver.extraNodeModules = {
  'node-fetch': require.resolve('cross-fetch'),
};

module.exports = defaultConfig;
