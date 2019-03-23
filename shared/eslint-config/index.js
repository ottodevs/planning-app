module.exports = {
  env: {
    browser: true,
    es6: true,
    // node: true,
    // jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:unicorn/recommended',
    // TODO: Conflicts with prettier
    // 'standard',
    // 'standard-react',
    // prettier should be last to override other configs
    'plugin:prettier/recommended',
    'prettier/react',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019,
    // sourceType: 'module',
  },
  plugins: ['jsdoc', 'prettier', 'promise', 'react', 'react-hooks'],
  rules: {
    // Old TPS rules:
    // "indent": ["error", 2],
    // "linebreak-style": ["error", "unix"],
    // "quotes": ["error", "single"],
    // "react/no-typos": 1,
    // "semi": ["error", "never"],
    'no-var': 'error',
    'prefer-const': 'error',
    'react/prop-types': 'error',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

    // conflicts with prettier/prettier
    'unicorn/number-literal-case': 'off',
    'valid-jsdoc': [
      'error',
      {
        requireReturn: false,
      },
    ],
    // 'array-bracket-spacing': [
    //   'error',
    //   'always',
    //   {
    //     objectsInArrays: false,
    //     arraysInArrays: false,
    //     singleValue: false,
    //   },
    // ],
    // 'object-curly-spacing': [ 'error', 'always' ],
    // 'comma-dangle': [ 2, 'always-multiline' ],
    // 'prettier/prettier': ['error', { bracketSpacing: true }],
  },
}
