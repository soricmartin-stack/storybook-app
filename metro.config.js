const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'mjs'];

// Enable symlinks for workspace support
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
