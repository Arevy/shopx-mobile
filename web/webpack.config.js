const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname, '..');
const babelConfigFile = path.resolve(appDirectory, 'babel.config.js');

const modulesToTranspile = [
  'react-native-vector-icons',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-paper',
  'react-native-worklets',
  'react-native-drawer-layout',
  '@react-navigation',
  '@react-native',
].map(moduleName => path.resolve(appDirectory, 'node_modules', moduleName));

module.exports = (_env = {}, argv = {}) => {
  const isProduction = argv.mode === 'production';

  const envFilePath = path.resolve(process.cwd(), '.env');
  const envFromFile = fs.existsSync(envFilePath)
    ? dotenv.parse(fs.readFileSync(envFilePath))
    : {};
  const rawEnv = {
    ...envFromFile,
    ...process.env,
  };

  const definedEnv = Object.entries(rawEnv).reduce(
    (acc, [key, value]) => {
      if (typeof key === 'string') {
        acc[`process.env.${key}`] = JSON.stringify(value);
      }
      return acc;
    },
    {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || (isProduction ? 'production' : 'development'),
      ),
      __DEV__: JSON.stringify(!isProduction),
    },
  );

  return {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'index.tsx'),
    output: {
      filename: isProduction
        ? 'static/js/[name].[contenthash].js'
        : 'static/js/bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      clean: true,
    },
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
        'react-native-config': path.resolve(
          __dirname,
          './reactNativeConfig.web.ts',
        ),
        'react-native-safe-area-context$': path.resolve(
          appDirectory,
          'node_modules/react-native-safe-area-context/lib/module/index.js',
        ),
        'react-native-safe-area-context': path.resolve(
          appDirectory,
          'node_modules/react-native-safe-area-context/lib/module',
        ),
        'react-native/Libraries/Utilities/Platform': path.resolve(
          appDirectory,
          'node_modules/react-native-web/dist/cjs/exports/Platform/index.js',
        ),
        'react-native/Libraries/EventEmitter/NativeEventEmitter': path.resolve(
          appDirectory,
          'node_modules/react-native-web/dist/cjs/modules/NativeEventEmitter/index.js',
        ),
        'react-native-reanimated/ReanimatedModule': path.resolve(
          appDirectory,
          'node_modules/react-native-reanimated/lib/module/ReanimatedModule/index.web.js',
        ),
        'react-native-reanimated$': path.resolve(
          __dirname,
          './shims/react-native-reanimated.web.ts',
        ),
        'react-native-reanimated/scripts/validate-worklets-version':
          path.resolve(__dirname, './shims/validateWorkletsVersion.ts'),
        '@expo/vector-icons/MaterialCommunityIcons': path.resolve(
          appDirectory,
          'node_modules/react-native-vector-icons/MaterialCommunityIcons.js',
        ),
        '@react-navigation/native/lib/module': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/native/lib/module',
        ),
        '@react-navigation/native/lib/module/index.js': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/native/lib/module/index.js',
        ),
        '@react-navigation/native-stack/lib/module': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/native-stack/lib/module',
        ),
        '@react-navigation/native-stack/lib/module/index.js': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/native-stack/lib/module/index.js',
        ),
        '@react-navigation/drawer/lib/module': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/drawer/lib/module',
        ),
        '@react-navigation/drawer/lib/module/index.js': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/drawer/lib/module/index.js',
        ),
        '@react-navigation/elements/lib/module': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/elements/lib/module',
        ),
        '@react-navigation/elements/lib/module/index.js': path.resolve(
          appDirectory,
          'node_modules/@react-navigation/elements/lib/module/index.js',
        ),
        'react-native-drawer-layout/lib/module': path.resolve(
          appDirectory,
          'node_modules/react-native-drawer-layout/lib/module',
        ),
        'react-native-drawer-layout/lib/module/index.js': path.resolve(
          appDirectory,
          'node_modules/react-native-drawer-layout/lib/module/index.js',
        ),
        '@react-native-vector-icons/material-design-icons': path.resolve(
          appDirectory,
          'node_modules/react-native-vector-icons/MaterialCommunityIcons.js',
        ),
        '@': path.resolve(__dirname, '../src'),
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.tsx',
        '.ts',
        '.web.js',
        '.js',
        '.jsx',
        '.json',
      ],
      mainFields: ['browser', 'module', 'main'],
      fullySpecified: false,
      byDependency: {esm: {fullySpecified: false}},
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [path.resolve(appDirectory, 'src'), path.resolve(__dirname)],
          use: {
            loader: 'babel-loader',
            options: {
              configFile: babelConfigFile,
              cacheDirectory: true,
              caller: {platform: 'web', isDev: !isProduction},
            },
          },
        },
        {
          test: /\.[jt]sx?$/,
          include: modulesToTranspile,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: babelConfigFile,
              cacheDirectory: true,
              caller: {platform: 'web', isDev: !isProduction},
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(ttf|otf|woff2?)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(css)$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
      }),
      new webpack.DefinePlugin(definedEnv),
    ],
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      host: process.env.WEB_HOST || '127.0.0.1',
      port: Number(process.env.WEB_PORT || 8082),
      historyApiFallback: true,
      hot: true,
      allowedHosts: 'all',
      client: {
        overlay: true,
      },
    },
    infrastructureLogging: {
      level: 'warn',
    },
    ignoreWarnings: [
      {
        module: /react-native-worklets\/lib\/module\/initializers\.js/,
      },
    ],
    stats: 'minimal',
  };
};
