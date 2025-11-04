const path = require('path');

module.exports = api => {
  const isWeb = !!api?.caller?.(caller => caller?.platform === 'web');

  const presets = [[
    'module:@react-native/babel-preset',
    isWeb ? {disableImportExportTransform: true} : undefined,
  ]];

  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ];

  if (isWeb) {
    plugins.push(require(path.resolve(__dirname, 'babel-plugins/react-navigation-transform.cjs')));
    plugins.push(require(path.resolve(__dirname, 'babel-plugins/append-js-extension.cjs')));
  }

  return {
    presets,
    plugins,
  };
};
