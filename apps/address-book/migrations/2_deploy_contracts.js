/* global artifacts, module */

const AddressBook = artifacts.require('./AddressBook.sol')

module.exports = function(deployer) {
  deployer.deploy(AddressBook)
}
