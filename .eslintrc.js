module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['@react-native', 'plugin:react-hooks/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jest'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', {allow: ['warn', 'error']}],
    'react/no-unstable-nested-components': ['warn', {allowAsProps: true}],
  },
};
