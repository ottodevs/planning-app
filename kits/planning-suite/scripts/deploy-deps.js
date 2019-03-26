/* global errorOut, module, process, require */
require('dotenv').config({
  path: '../node_modules/@aragon/kits-beta-base/.env',
})
const deploy_ens = require('@aragon/os/scripts/deploy-test-ens.js')
const deploy_apm = require('@aragon/os/scripts/deploy-apm.js')
const deploy_id = require('@aragon/id/scripts/deploy-beta-aragonid.js')
const deploy_kit = require('@aragon/kits-beta-base/scripts/deploy_kit.js')

module.exports = async ({ artifacts, web3 }) => {
  console.log(`Deploying deps, Owner ${process.env.OWNER}`)

  //   if (process.argv.length < 5) {
  // errorOut('Usage: truffle exec --network <network> scripts/deploy.js')
  //   }
  // get network
  //   const network = process.argv[4]

  //   // ENS
  //   const { ens } = await deploy_ens(null, { artifacts })

  //   // APM
  //   await deploy_apm(null, { artifacts, web3, ensAddress: ens.address })

  //   // aragonID
  //   await deploy_id(null, { artifacts, web3, ensAddress: ens.address })

  //   await deploy_kit(null, { artifacts, kitName: 'multisig-kit', kitContractName: 'MultisigKit', network: network, ensAddress: ens.address })
  console.log('Completed')
}

// const deploy_ens = require('@aragon/os/scripts/deploy-test-ens.js')
// const deploy_apm = require('@aragon/os/scripts/deploy-apm.js')
// const deploy_id = require('@aragon/id/scripts/deploy-beta-aragonid.js')
// const namehash = require('eth-ens-namehash').hash

// const defaultOwner = process.env.OWNER
// // const defaultENSAddress = process.env.ENS
// // const defaultDAOFactoryAddress = process.env.DAO_FACTORY
// // const defaultMinimeTokenFactoryAddress = process.env.MINIME_TOKEN_FACTORY
// // const defaultStandardBountiesRegAddr = process.env.STANDARD_BOUNTIES

// module.exports = async (
//   truffleExecCallback,
//   {
//     artifacts,
//     owner = defaultOwner,
//     //   ensAddress = defaultENSAddress,
//     network = 'devnet',
//     verbose = true,
//     web3,
//   } = {}
// ) => {
//   const log = (...args) => {
//     if (verbose) {
//       console.log(...args)
//     }
//   }

//   const runAsync = async (fn, params = {}) => {
//     let result

//     log(`running ${fn}`)

//     const code = new Function(code)

//     try {
//       result = await code(null, { artifacts, web3, ...params })
//     } catch (error) {
//       log('Error running async task', error)
//       if (typeof truffleExecCallback === 'function') {
//         // Called directly via `truffle exec`
//         truffleExecCallback(error)
//       }
//     }
//     log('runAsync completed for', fn)
//     return result
//   }

//   log(`Deploying dependencies, owner: ${owner}`)

//   // ENS
//   //   log(params)
//   const { ens } = await runAsync('deploy_ens')

//   const params = { ...params, ensAddress: ens.address }

//   //   // APM
//   //   await runAsync(deploy_apm, params)

//   //   // aragonID
//   //   await runAsync(deploy_id, params)

//   //   if (network == 'devnet') {
//   //     // Useful for testing to avoid manual deploys with aragon-dev-cli
//   //     const apmAddr = await artifacts
//   //       .require('PublicResolver')
//   //       .at(await ens.resolver(namehash('aragonpm.eth')))
//   //       .addr(namehash('aragonpm.eth'))
//   //     const apm = artifacts.require('APMRegistry').at(apmAddr)
//   //     log('Returning with APM', apmAddr)

//   //     // if (typeof truffleExecCallback === 'function') {
//   //     //   // Called directly via `truffle exec`
//   //     //   truffleExecCallback()
//   //     // } else {
//   //     return { apm, ens }
//   //     // }
//   //   }
//   log('deploy deps complete')
// }
