/*global artifacts*/
const Allocations = artifacts.require('./Allocations.sol')

export default function(deployer) {
  deployer.deploy(Allocations)
}
