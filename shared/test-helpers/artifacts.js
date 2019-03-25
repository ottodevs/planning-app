/* global artifacts */
export const ACL = artifacts.require('./acl/ACL')
export const DAOFactory = artifacts.require('./factory/DAOFactory')
export const EVMScriptRegistryFactory = artifacts.require(
  './factory/EVMScriptRegistryFactory'
)
export const Kernel = artifacts.require('./kernel/Kernel')
export const MiniMeToken = artifacts.require('./lib/minime/MiniMeToken')
export const StandardBounties = artifacts.require(
  './lib/bounties/StandardBounties'
)
export function getContract(name) {
  return artifacts.require(name)
}
