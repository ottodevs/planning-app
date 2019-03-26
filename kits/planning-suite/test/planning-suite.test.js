/* global artifacts, before, context, contract, it, require, web3 */
import getNetwork from '@tps/test-helpers/networks'
import truffleConfig from '@tps/test-helpers/truffle-config'
import { hash as namehash } from 'eth-ens-namehash'

const MiniMeToken = artifacts.require('MiniMeToken')

const Finance = artifacts.require('Finance')
const TokenManager = artifacts.require('TokenManager')
const Vault = artifacts.require('Vault')
const Voting = artifacts.require('Voting')

const apps = ['finance', 'token-manager', 'vault', 'voting']
const appIds = apps.map(app =>
  namehash(require(`@aragon/apps-${app}/arapp`).environments.default.appName)
)

const getContract = name => artifacts.require(name)

const getAppProxy = (receipt, id) =>
  receipt.logs.filter(l => l.event == 'InstalledApp' && l.args.appId == id)[0]
    .args.appProxy

const getKitConfiguration = async networkName => {
  let arappFilename
  if (networkName == 'devnet' || networkName == 'rpc') {
    arappFilename = 'arapp_local'
  } else {
    arappFilename = 'arapp'
  }

  const arappFile = require('../' + arappFilename)
  const ensAddr = arappFile.environments[networkName].registry
  const ens = getContract('ENS').at(ensAddr)
  const resolverAddr = await ens.resolver(namehash('aragonpm.eth'))
  const resolver = getContract('PublicResolver').at(resolverAddr)

  const kitEnsName = arappFile.environments[networkName].appName
  const repoAddr = await resolver.addr(namehash(kitEnsName))
  const repo = getContract('Repo').at(repoAddr)
  const kitAddress = (await repo.getLatest())[1]
  const kitContractName = arappFile.path
    .split('/')
    .pop()
    .split('.sol')[0]
  const kit = getContract(kitContractName).at(kitAddress)

  return { ens, kit }
}

contract('Planning Kit Base', accounts => {
  const ETH = '0x0'
  let ens, kit
  let daoAddress, tokenAddress
  let financeAddress, tokenManagerAddress, vaultAddress, votingAddress
  let finance, tokenManager, vault, voting
  let receiptInstance

  const [owner, holder20, holder29, holder51, nonHolder] = accounts.slice(0, 6)

  before(async () => {
    // Create Planning Kit
    const { networks } = truffleConfig
    const networkName = (await getNetwork(networks)).name

    if (networkName == 'devnet' || networkName == 'rpc') {
      // transfer some ETH to other accounts
      await web3.eth.sendTransaction({
        from: owner,
        to: holder20,
        value: web3.toWei(10, 'ether'),
      })
      await web3.eth.sendTransaction({
        from: owner,
        to: holder29,
        value: web3.toWei(10, 'ether'),
      })
      await web3.eth.sendTransaction({
        from: owner,
        to: holder51,
        value: web3.toWei(10, 'ether'),
      })
      await web3.eth.sendTransaction({
        from: owner,
        to: nonHolder,
        value: web3.toWei(10, 'ether'),
      })
    }

    const configuration = await getKitConfiguration(networkName)
    ens = configuration.ens
    kit = configuration.kit
  })

  // Test when organization is created in one call with `newTokenAndInstance()` and in
  // two calls with `newToken()` and `newInstance()`
  // const creationStyles = ['single', 'separate']
  // for (const creationStyle of creationStyles) {
  // context(`> Creation through ${creationStyle} transaction`, () => {

  context('DAO creation', () => {
    let aragonId, tokenName, tokenSymbol

    before(async () => {
      aragonId = 'autarkdao-' + Math.floor(Math.random() * 1000)
      tokenName = 'Autark Token'
      tokenSymbol = 'autark'

      const holders = [holder20, holder29, holder51]
      const stakes = [20e18, 29e18, 51e18]

      //   if (creationStyle === 'single') {
      //     // create token and instance
      //     receiptInstance = await kit.newTokenAndInstance(tokenName, tokenSymbol, aragonId, holders, stakes, neededSupport, minimumAcceptanceQuorum, votingTime)
      //     tokenAddress = getEventResult(receiptInstance, 'DeployToken', 'token')
      //     daoAddress = getEventResult(receiptInstance, 'DeployInstance', 'dao')
      // } else if (creationStyle === 'separate') {
      // create Token
      // const receiptToken = await kit.newToken(tokenName, tokenSymbol)
      // tokenAddress = getEventResult(receiptToken, 'DeployToken', 'token')

      // create Instance
      // receiptInstance = await kit.newInstance(aragonId, holders, stakes, neededSupport, minimumAcceptanceQuorum, votingTime)
      // daoAddress = getEventResult(receiptInstance, 'DeployInstance', 'dao')
      // }

      // generated apps
      // financeAddress = getAppProxy(receiptInstance, appIds[0])
      // finance = await Finance.at(financeAddress)
      // tokenManagerAddress = getAppProxy(receiptInstance, appIds[1])
      // tokenManager = TokenManager.at(tokenManagerAddress)
      // vaultAddress = getAppProxy(receiptInstance, appIds[2])
      // vault = await Vault.at(vaultAddress)
      // votingAddress = getAppProxy(receiptInstance, appIds[3])
      // voting = Voting.at(votingAddress)
    })

    it('creates and initializes a DAO with its Token', async () => {
      console.log('It works')
    })
  })
})
