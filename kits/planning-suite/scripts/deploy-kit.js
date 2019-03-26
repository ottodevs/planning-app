/* global errorOut, module, process, require */
const envPath = '../.env'

require('dotenv').config({ path: envPath })

const path = require('path')
const fs = require('fs')

const namehash = require('eth-ens-namehash').hash

const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')
const logDeploy = require('@aragon/os/scripts/helpers/deploy-logger')

// ensure alphabetic order
const apps = ['finance', 'token-manager', 'vault', 'voting']
const planningApps = [
  'address-book',
  'allocations',
  'projects',
  'range-voting',
  'rewards',
]

const [appIds, planningAppIds] = [apps, planningApps].map(e =>
  e.map(app => namehash(`${app}.aragonpm.eth`))
)

// const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const defaultOwner = process.env.OWNER
const defaultENSAddress = process.env.ENS
const defaultDAOFactoryAddress = process.env.DAO_FACTORY
const defaultMinimeTokenFactoryAddress = process.env.MINIME_TOKEN_FACTORY
const defaultStandardBountiesRegAddr = process.env.STANDARD_BOUNTIES

module.exports = async (
  truffleExecCallback,
  {
    apm,
    artifacts, // = globalArtifacts,
    owner = defaultOwner,
    ensAddress = defaultENSAddress,
    daoFactoryAddress = defaultDAOFactoryAddress,
    minimeTokenFactoryAddress = defaultMinimeTokenFactoryAddress,
    standardBountiesRegAddr = defaultStandardBountiesRegAddr,
    kitName = 'PlanningSuite',
    kitContractName = kitName,
    network = 'devnet',
    verbose = true,
    returnKit = false,
  } = {}
) => {
  const log = (...args) => {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  }

  log(`${kitName} in ${network} network with ENS ${ensAddress}`)

  const kitEnsName = kitName + '.aragonpm.eth'

  const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
  const DAOFactory = artifacts.require('DAOFactory')
  const ENS = artifacts.require('ENS')
  const StandardBounties = artifacts.require('StandardBounties')

  // const newRepo = async (apm, name, acc, contract) => {
  //   log(`Creating Repo for ${contract}`)
  //   const artifact = await artifacts.require(contract)
  //   log('we have the contract', artifact)
  //   const c = artifact.new()

  //   return await apm.newRepoWithVersion(
  //     name,
  //     acc,
  //     [1, 0, 0],
  //     c.address,
  //     '0x1245'
  //   )
  // }

  // let arappFileName
  // if (!returnKit) {
  //   if (network != 'rpc' && network != 'devnet') {
  //     arappFileName = 'arapp.json'
  //   } else {
  //     arappFileName = 'arapp_local.json'
  //   }
  //   if (!ensAddress) {
  //     const betaArapp = require('../' + arappFileName)
  //     ensAddress = betaArapp.environments[network].registry
  //   }
  // }

  // if (!ensAddress) {
  //   errorOut('ENS environment variable not passed, aborting.')
  // }
  // log('Using ENS', ensAddress)
  // const ens = ENS.at(ensAddress)

  // let daoFactory
  // if (daoFactoryAddress) {
  //   log(`Using provided DAOFactory: ${daoFactoryAddress}`)
  //   daoFactory = DAOFactory.at(daoFactoryAddress)
  // } else {
  //   daoFactory = (await deployDAOFactory(null, { artifacts, verbose }))
  //     .daoFactory
  // }

  // let minimeFac
  // if (minimeTokenFactoryAddress) {
  //   log(`Using provided MiniMeTokenFactory: ${minimeTokenFactoryAddress}`)
  //   minimeFac = MiniMeTokenFactory.at(minimeTokenFactoryAddress)
  // } else {
  //   minimeFac = await MiniMeTokenFactory.new()
  //   log('Deployed MiniMeTokenFactory:', minimeFac.address)
  // }

  let registry
  if (standardBountiesRegAddr) {
    log(`Using provided StandardBounties: ${standardBountiesRegAddr}`)
    registry = StandardBounties.at(standardBountiesRegAddr)
  } else {
    registry = await StandardBounties.new(owner)
    log('Deployed StandardBounties:', registry.address)
  }

  const aragonid = await ens.owner(namehash('aragonid.eth'))
  const kitContract = artifacts.require(kitContractName)

  const kit = await kitContract.new(
    daoFactory.address,
    ens.address,
    minimeFac.address,
    aragonid,
    appIds,
    planningAppIds,
    registry.address
  )

  log(`Deployed ${kitContractName}:`, kit.address)

  await logDeploy(kit)

  if (returnKit) {
    return kit
  }

  // if (network == 'devnet') {
  // Useful for testing to avoid manual deploys with aragon-dev-cli
  // log('Creating APM package with owner', owner)
  // const apmAddr = await artifacts
  //   .require('PublicResolver')
  //   .at(await ens.resolver(namehash('aragonpm.eth')))
  //   .addr(namehash('aragonpm.eth'))
  // const apm = artifacts.require('APMRegistry').at(apmAddr)
  // log('APM', apmAddr)

  // if (
  //   (await ens.owner(appIds[0])) ==
  //   '0x0000000000000000000000000000000000000000'
  // ) {
  //   log('Deploying apps in local network')
  //   log('apm', apm, owner)

  //   await newRepo(apm, 'finance', owner, 'Finance')
  //   await newRepo(apm, 'token-manager', owner, 'TokenManager')
  //   await newRepo(apm, 'vault', owner, 'Vault')
  //   await newRepo(apm, 'voting', owner, 'Voting')
  // }

  // if (
  //   (await ens.owner(namehash(kitEnsName))) ==
  //   '0x0000000000000000000000000000000000000000'
  // ) {
  //   log(`creating APM package for ${kitName} at ${kit.address}`)
  //   await apm.newRepoWithVersion(
  //     kitName,
  //     owner,
  //     [1, 0, 0],
  //     kit.address,
  //     'ipfs:'
  //   )
  // } else {
  //   // TODO: update APM Repo?
  // }
  // // }

  // const kitArappPath = path.resolve('.') + '/' + arappFileName
  // let arappObj = {}
  // if (fs.existsSync(kitArappPath)) arappObj = require(kitArappPath)
  // if (arappObj.environments === undefined) arappObj.environments = {}
  // if (arappObj.environments[network] === undefined)
  //   arappObj.environments[network] = {}
  // arappObj.environments[network].registry = ens.address
  // arappObj.environments[network].appName = kitEnsName
  // arappObj.environments[network].address = kit.address
  // arappObj.environments[network].network = network
  // if (arappObj.path === undefined)
  //   arappObj.path = 'contracts/' + kitContractName + '.sol'
  // const arappFile = JSON.stringify(arappObj, null, 2)
  // // could also use https://github.com/yeoman/stringify-object if you wanted single quotes
  // fs.writeFileSync(kitArappPath, arappFile)
  // log(`Kit addresses saved to ${arappFileName}`)

  if (typeof truffleExecCallback === 'function') {
    log('deploy-kit complete')
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    log('deploy-kit finished')
    // return arappObj
  }
}
