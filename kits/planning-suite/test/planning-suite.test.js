/* global artifacts, before, context, contract, it, require */
import getNetwork from '@tps/test-helpers/networks'
import truffleConfig from '@tps/test-helpers/truffle-config'
import { hash as namehash } from 'eth-ens-namehash'

const getContract = name => artifacts.require(name)

const getKitConfiguration = async networkName => {
  let arappFilename
  if (networkName == 'devnet' || networkName == 'rpc') {
    arappFilename = 'arapp_local'
  } else {
    arappFilename = 'arapp'
  }

  // const ensAddr = arappFilename.environments[networkName].registry
  // const ens = getContract('ENS').at(ensAddr)
  // const resolverAddr = await ens.resolver(namehash('aragonpm.eth'))
  // const resolver = getContract('PublicResolver').at(resolverAddr)

  // const kitEnsName = arappFile.environments[networkName].appName
  // const repoAddr = await resolver.addr(namehash(kitEnsName))

  console.log('Arappfile', arappFilename)
}

contract('Planning Kit', accounts => {
  const owner = accounts[0]
  before(async () => {
    // Create Planning Kit
    const { networks } = truffleConfig // ('./')

    const networkName = (await getNetwork(networks)).name
    const configuration = await getKitConfiguration(networkName)
  })
  context('DAO creation', () => {
    it('creates and initializes a DAO with its Token', async () => {
      console.log('It works')
    })
  })
})
