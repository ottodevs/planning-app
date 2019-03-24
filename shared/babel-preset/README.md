# That Planning Suite Babel preset

Common Babel config for That Planning Suite Aragon Apps.

## Installation

```bash
yarn add --dev @tps/babel-preset
```

## Usage

Add the following changes to `package.json`:

### `.babelrc.js` <sup>[1](#fn1)</sup>

```js
  "devDependencies": {
    "@babel/core": "^7.4.0",
    "@tps/babel-preset": "^0.0.1",
    // if needed:
    "react-hot-loader": "^4.8.0",
  },
  "babel": {
    "presets": "@tps",
    // if needed:
    "plugins": "react-hot-loader/babel"
  },
```

<sup id="fn1">1</sup> _`babel-preset` suffix can be omitted, it is automatically assumed by Babel._
