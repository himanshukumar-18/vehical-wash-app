// ESLint flat config for Expo / React Native (ESLint 9+)
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'web-build/**',
      'scripts/**',
    ],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          // Resolve @/* path aliases defined in tsconfig.json
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Allow unnamed default exports (common in React Native screens)
      'import/no-anonymous-default-export': 'off',
    },
  },
];
