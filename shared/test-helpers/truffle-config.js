/* global module, process, require */

require('@babel/register')({
  ignore: [/node_modules/],
  presets: [
    [
      'env',
      {
        targets: {
          node: '8.0',
        },
      },
    ],
  ],
  retainLines: true,
})
require('@babel/polyfill')

const homedir = require('homedir')
const path = require('path')

const HDWalletProvider = require('truffle-hdwallet-provider')
const HDWalletProviderPrivkey = require('truffle-hdwallet-provider-privkey')

const DEFAULT_MNEMONIC =
  'explain tackle mirror kit van hammer degree position ginger unfair soup bonus'

const mochaGasSettings = {
  reporter: 'eth-gas-reporter',
  reporterOptions: {
    currency: 'USD',
    gasPrice: 3,
  },
}
const mocha = process.env.GAS_REPORTER ? mochaGasSettings : {}

const defaultRPC = network => `https://${network}.infura.io`

const configFilePath = filename => path.join(homedir(), `.aragon/${filename}`)

const mnemonic = () => {
  try {
    return require(configFilePath('mnemonic.json')).mnemonic
  } catch (error) {
    return DEFAULT_MNEMONIC
  }
}

const settingsForNetwork = network => {
  try {
    return require(configFilePath(`${network}_key.json`))
  } catch (error) {
    return {}
  }
}

// Lazily loaded provider
const providerForNetwork = network => () => {
  const { rpc, keys } = settingsForNetwork(network)
  const confRpc = rpc || defaultRPC(network)

  if (!keys || keys.length == 0) {
    return new HDWalletProvider(mnemonic(), confRpc)
  }

  return new HDWalletProviderPrivkey(keys, confRpc)
}

module.exports = projectRootPath => ({
  contracts_build_directory: path.join(projectRootPath, './build/contracts/'),
  networks: {
    rpc: {
      network_id: 15,
      host: 'localhost',
      port: 8545,
      gas: 6.9e6,
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 7984452, // Block Gas Limit same as latest on Mainnet https://ethstats.net/
      gasPrice: 2000000000, // same as latest on Mainnet https://ethstats.net/
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    rinkeby: {
      network_id: 4,
      provider: providerForNetwork('rinkeby'),
    },
    mainnet: {
      network_id: 1,
      provider: providerForNetwork('mainnet'),
    },
  },
  build: {},
  mocha,
  env: {
    mocha: true,
  },
})
