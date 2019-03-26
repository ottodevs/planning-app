/* global artifacts, errorOut, module, process, require, web3 */
require('dotenv').config({ path: '../.env' })

const deploy_ens = require('@aragon/os/scripts/deploy-test-ens')
const deploy_apm = require('@aragon/os/scripts/deploy-apm')
const deploy_id = require('@aragon/id/scripts/deploy-beta-aragonid')
const deployKitBase = require('./deploy-kit-base')
const deployKit = require('./deploy-kit')

const existentENS = process.env.ENS

module.exports = async callback => {
  // eslint-disable-next-line no-console
  console.log(`Deploying Planning Suite Kit, Owner ${process.env.OWNER}`)

  if (process.argv.length < 5) {
    errorOut('Usage: truffle exec --network <network> scripts/deploy.js')
  }

  // get network (sometimes node is prepended so we should shift the network position)
  const network =
    process.argv[4] === '--network' ? process.argv[5] : process.argv[4]

  console.log('Deploying on network:', network)

  let ens
  if (!existentENS) {
    // ENS
    const { deployedENS } = await deploy_ens(null, { artifacts, web3 })
    ens = deployedENS
    // APM
    await deploy_apm(null, { artifacts, web3, ensAddress: ens.address })
    // aragonID
    await deploy_id(null, { artifacts, web3, ensAddress: ens.address })
  } else {
    console.log('Skipping deployments, using previous ENS', existentENS)

    ens = existentENS
  }

  // planning suite base kit
  await deployKitBase(null, {
    artifacts,
    network,
    ensAddress: ens.address,
    kitName: 'planning-kit-base',
    kitContractName: 'PlanningKitBase',
  })

  // // planning suite kit
  // await deployKit(null, {
  //   artifacts,
  //   network,
  //   ensAddress: ens.address,
  //   kitName: 'planning-suite',
  //   kitContractName: 'PlanningSuite',
  // })

  callback()
}
