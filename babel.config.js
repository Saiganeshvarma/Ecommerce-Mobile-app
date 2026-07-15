module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@api': './src/api',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@redux': './src/redux',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@constants': './src/constants',
            '@models': './src/models',
            '@validations': './src/validations',
            '@services': './src/services',
            '@assets': './assets',
          },
        },
      ],
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};
