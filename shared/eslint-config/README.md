# That Planning Suite Common configs

Common project configs for That Planning Suite Aragon Apps.

## Installation

```bash
yarn add --dev eslint eslint-config-tps husky lint-staged prettier
```

## Usage

Add the following changes to files below to enable the configurations:

### `.eslintrc.js`

```js
module.exports = {
  extends: ['@tps'],
}
```

or inline the config into:

### `package.json`

```json
{
  "scripts": {
    "lint": "yarn lint:js && yarn lint:sol",
    "lint:js": "eslint .",
    "lint:sol": "solium -d .",
    "prettier": "prettier \"**/*.{js,json,css,md}\" --write"
  },
  // Select needed dependencies based on desired use
  "devDependencies": {
    "@tps/eslint-config": "^0.0.1",
    "eslint": "^5.15.3",
    "prettier": "^1.16.4",
    "stylelint": "^9.10.1"
  },
  "eslintConfig": {
    "extends": "@tps"
  },
  // To enforce style on git codebase
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  // Optional prettier rules on module basis
  "prettier": {
    "bracketSpacing": true,
    "trailingComma": "es5",
    "semi": false,
    "singleQuote": true
  },
  // Only needed when using css or styled-components
  "stylelint": {
    "extends": "@tps/eslint-config/stylelint"
  }
}
```
