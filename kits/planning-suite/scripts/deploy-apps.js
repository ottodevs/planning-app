/* global errorOut, module, process, require */
const envPath = '../.env'

require('dotenv').config({ path: envPath })
const namehash = require('eth-ens-namehash').hash

// // ensure alphabetic order
// const apps = ['finance', 'token-manager', 'vault', 'voting']
// const planningApps = [
//   'address-book',
//   'allocations',
//   'projects',
//   'range-voting',
//   'rewards',
// ]

// const [appIds, planningAppIds] = [apps, planningApps].map(e =>
//   e.map(app => namehash(`${app}.aragonpm.eth`))
// )

// ensure alphabetic order
const apps = ['finance', 'token-manager', 'vault', 'voting']
const appIds = apps.map(app => namehash(`${app}.aragonpm.eth`))

// const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const defaultOwner = process.env.OWNER
const defaultENSAddress = process.env.ENS

const errorOut = msg => {
  console.error(msg)
  throw new Error(msg)
}

module.exports = async (
  truffleExecCallback,
  {
    artifacts, // = globalArtifacts,
    owner = defaultOwner,
    apm,
    ensAddress = defaultENSAddress,
    network = 'devnet',
    verbose = true,
  } = {}
) => {
  const log = (...args) => {
    if (verbose) {
      console.log(...args)
    }
  }

  log(`Deploying Apps in ${network} network with ENS ${ensAddress}`)

  const ENS = artifacts.require('ENS')

  const newRepo = async (apm, name, acc, contract) => {
    log(`Creating Repo for ${contract}`)
    const artifact = artifacts.require(contract)

    let c
    try {
      c = await artifact.new()
    } catch (error) {
      log('Error running async task', error)
      if (typeof truffleExecCallback === 'function') {
        // Called directly via `truffle exec`
        truffleExecCallback(error)
      }
    }

    return await apm.newRepoWithVersion(
      name,
      acc,
      [1, 0, 0],
      c.address,
      '0x1245'
    )
  }

  let arappFileName
  if (network !== 'rpc' && network !== 'devnet') {
    arappFileName = 'arapp.json'
  } else {
    arappFileName = 'arapp_local.json'
  }
  if (!ensAddress) {
    const betaArapp = require('../' + arappFileName)
    ensAddress = betaArapp.environments[network].registry
  }

  if (!ensAddress) {
    errorOut('ENS environment variable not passed, aborting.')
  }
  log('Using ENS', ensAddress)
  const ens = ENS.at(ensAddress)

  // if (network === 'devnet') {
  if (
    (await ens.owner(appIds[0])) == '0x0000000000000000000000000000000000000000'
  ) {
    log('Deploying apps in local network')
    await newRepo(apm, 'token-manager', owner, 'TokenManager')
    await newRepo(apm, 'vault', owner, 'Vault')
    await newRepo(apm, 'voting', owner, 'Voting')
    await newRepo(apm, 'finance', owner, 'Finance')
  }
  // }

  //   const kitArappPath = path.resolve('.') + '/' + arappFileName
  //   let arappObj = {}
  //   if (fs.existsSync(kitArappPath)) arappObj = require(kitArappPath)
  //   if (arappObj.environments === undefined) arappObj.environments = {}
  //   if (arappObj.environments[network] === undefined)
  //     arappObj.environments[network] = {}
  //   arappObj.environments[network].registry = ens.address
  //   arappObj.environments[network].appName = kitEnsName
  //   arappObj.environments[network].address = kit.address
  //   arappObj.environments[network].network = network
  //   if (arappObj.path === undefined)
  //     arappObj.path = 'contracts/' + kitContractName + '.sol'
  //   const arappFile = JSON.stringify(arappObj, null, 2)
  //   // could also use https://github.com/yeoman/stringify-object if you wanted single quotes
  //   fs.writeFileSync(kitArappPath, arappFile)
  //   log(`Kit addresses saved to ${arappFileName}`)

  //   if (typeof truffleExecCallback === 'function') {
  // Called directly via `truffle exec`
  // truffleExecCallback()
  //   } else {
  // return arappObj
  //   }
}
