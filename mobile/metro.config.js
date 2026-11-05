const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      // video assets for bundled local playback
      'mp4', 'mov', 'avi', 'mkv', 'webm',
      // default React Native asset types
      'bmp', 'gif', 'jpg', 'jpeg', 'png', 'psd', 'svg', 'webp',
      'aac', 'aiff', 'caf', 'm4a', 'mp3', 'wav',
      'html', 'pdf', 'ttf', 'otf', 'woff', 'woff2',
      'zip', 'db',
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
