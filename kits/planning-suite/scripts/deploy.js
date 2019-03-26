/* global artifacts, errorOut, module, process, require, web3 */

require('dotenv').config({
  path: '../../../node_modules/@aragon/kits-beta-base/.env',
})

const deploy_ens = require('@aragon/os/scripts/deploy-test-ens.js')
const deploy_apm = require('@aragon/os/scripts/deploy-apm.js')
const deploy_id = require('@aragon/id/scripts/deploy-beta-aragonid.js')
const deploy_kit = require('./deploy-kit')

module.exports = async (/*callback*/) => {
  // eslint-disable-next-line no-console
  console.log(`Deploying Planning Suite Kit, Owner ${process.env.OWNER}`)

  console.log('hola?')

  if (process.argv.length < 5) {
    errorOut('Usage: truffle exec --network <network> scripts/deploy.js')
  }

  console.log('seguimos')

  // get network
  const network = process.argv[4]

  console.log('log')

  // ENS
  const { ens } = await deploy_ens(null, {
    artifacts,
    web3,
    owner: process.env.OWNER,
  })
  console.log('ens')

  // APM
  await deploy_apm(null, { artifacts, web3, ensAddress: ens.address })

  // aragonID
  await deploy_id(null, { artifacts, web3, ensAddress: ens.address })

  await deploy_kit(null, {
    artifacts,
    kitName: 'planning-suite',
    kitContractName: 'PlanningSuite',
    network: network,
    ensAddress: ens.address,
  })
}
