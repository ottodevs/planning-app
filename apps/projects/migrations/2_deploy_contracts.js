/* global artifacts, module */
const Projects = artifacts.require('./Projects.sol')

module.exports = function(deployer) {
  deployer.deploy(Projects)
}
