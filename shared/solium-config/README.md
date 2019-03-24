# That Planning Suite Ethlint config

Ethlint common config for That Planning Suite Aragon Apps.

## Installation

```bash
yarn add --dev ethlint solium-config-tps
```

## Usage

Add the following changes to files below to enable the configurations:

### `.soliumrc.json`

```js
{
  "extends": "tps",
  "plugins": ["security"]
}
```

### `package.json`

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "scripts": {
    "lint": "yarn lint:js && yarn lint:sol",
    "lint:js": "eslint .",
    "lint:sol": "solium -d .",
    "prettier": "prettier \"**/*.{js,json,css,md}\" --write"
  }
}
```
