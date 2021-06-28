/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

module.exports = {
  root: true,
  env: {
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'testing-library',
  ],
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:testing-library/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
    quotes: 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/setupTests.ts', '**/unitTestUtils.js'] },
    ],
    'object-curly-newline': 0,
    'import/prefer-default-export': 0,
    'implicit-arrow-linebreak': 0,
    'spaced-comment': ['error', 'always', { markers: ['/'] }], // Allow /// <reference types="react-scripts" />
    'no-extra-semi': 0,
    '@typescript-eslint/no-extra-semi': ['warn'],
    semi: 0,
    '@typescript-eslint/semi': ['warn'],
    'operator-linebreak': 0,
    '@typescript-eslint/quotes': ['warn', 'single'],
    'max-len': ['warn', 185],
    'arrow-parens': 0,
    'react/prop-types': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-empty-function': 0,
    'no-use-before-define': 0,
    '@typescript-eslint/ban-ts-comment': 0, // allow @ts-ignore
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/explicit-module-boundary-types': 'off', // off for ALL files, override below,
    camelcase: 0,
    'no-shadow': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['warn'],
        '@typescript-eslint/no-shadow': ['error'],
      },
    },
  ],
};
