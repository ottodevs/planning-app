/*global module*/

// const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = () => ({
  // TODO: add "browser" param
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: [
            '> 1%',
            'last 3 versions',
            'ie >= 9',
            'ios >= 8',
            'android >= 4.2',
          ],
        },
        // TODO: check if we need entry and single babel/polyfill import per app
        // https://babeljs.io/docs/en/babel-preset-env
        useBuiltIns: false,
      },
    ],
  ],
  plugins: [
    ['styled-components', { displayName: true, fileName: false, pure: true }],
    '@babel/plugin-proposal-class-properties',
  ],
})
