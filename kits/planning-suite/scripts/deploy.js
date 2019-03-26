/* global artifacts, module, process, require */
require('dotenv').config({ path: '../.env' })
const namehash = require('eth-ens-namehash').hash
const logDeploy = require('@aragon/os/scripts/helpers/deploy-logger')
// const deployKit = require('./deploy-kit.js')

const owner = process.env.OWNER

const loadENS = () => {
  const ensAddr = '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1'
  return artifacts.require('ENS').at(ensAddr)
}

const loadAPM = async ens => {
  const apmAddr = await ens.resolver(namehash('aragonpm.eth'))
  return artifacts.require('APMRegistry').at(apmAddr)
}

const loadDAOFact = async (kernelAddr, aclAddr, evmScriptAddr) => {
  const DAOFactory = artifacts.require('DAOFactory')
  const daoFactory = await DAOFactory.new(kernelAddr, aclAddr, evmScriptAddr)
  await logDeploy(daoFactory)
  return daoFactory
}

const loadMiniMeFac = async () => {
  const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
  const minimeFac = await MiniMeTokenFactory.new()
  await logDeploy(minimeFac)
  return minimeFac
}

const loadEVMSCriptRegFac = async () => {
  const EVMScriptRegFac = artifacts.require('EVMScriptRegistryFactory')
  const evmScriptRegFac = await EVMScriptRegFac.new()
  await logDeploy(evmScriptRegFac)
  return evmScriptRegFac
}

const loadKernelBase = async () => {
  const Kernel = artifacts.require('Kernel')
  const kernelBase = await Kernel.new(true) // immediately petrify
  await logDeploy(kernelBase)
  return kernelBase
}

const loadACL = async () => {
  const ACL = artifacts.require('ACL')
  const aclBase = await ACL.new()
  await logDeploy(aclBase)
  return loadACL
}

const loadStandardBounties = async () => {
  const StandardBounties = artifacts.require('StandardBounties')
  const registry = await StandardBounties.new(owner)
  await logDeploy(registry)
  return registry
}

const newRepo = async (apm, name, acc, contract) => {
  console.log(`Creating Repo for ${contract}`)
  const artifact = artifacts.require(contract)

  let c
  try {
    c = await artifact.new()
    console.log('conseguido', c.address)
  } catch (error) {
    console.log('Error running async task', error)
  }
}

module.exports = async () => {
  const log = (...args) => {
    // eslint-disable-next-line no-console
    console.log(...args)
  }

  // get network
  // const network = process.argv[4]

  const ens = loadENS()
  const apm = await loadAPM(ens)
  const kernelAddr = await loadKernelBase()
  const aclAddr = await loadACL()
  const evmScript = await loadEVMSCriptRegFac()
  const daoFactory = await loadDAOFact(
    kernelAddr.address,
    aclAddr.address,
    evmScript.address
  )
  const minimeFac = await loadMiniMeFac()

  const aragonId = await ens.owner(namehash('aragonid.eth'))
  const votingAddr = await ens.owner(namehash('range-voting.aragonpm.eth'))
  const registry = await loadStandardBounties()

  log('===')
  log('ENS at', ens.address)
  log('APM at', apm.address)
  log('AragonID at', aragonId)
  log('Voting at', votingAddr)
  log('===')

  // apps

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

  if (
    (await ens.owner(planningAppIds[0])) ==
    '0x0000000000000000000000000000000000000000'
  ) {
    log('Deploying apps in local network')
    // log('apm', apm, owner)

    await newRepo(apm, 'address-book', owner, 'AddressBook')
    await newRepo(apm, 'allocations', owner, 'Allocations')
    await newRepo(apm, 'projects', owner, 'Projects')
    await newRepo(apm, 'range-voting', owner, 'RangeVoting')
    await newRepo(apm, 'rewards', owner, 'Rewards')
  }

  // planning suite kit
  // const kitName = 'planning-suite'
  const kitContractName = 'PlanningSuite'
  const kitContract = artifacts.require(kitContractName)
  const kit = await kitContract.new(
    daoFactory.address,
    ens.address,
    minimeFac.address,
    aragonId,
    appIds,
    planningAppIds,
    registry.address
  )

  await logDeploy(kit)
  log('Completed')
}
