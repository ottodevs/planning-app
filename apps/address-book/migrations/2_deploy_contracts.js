/*global artifacts*/

const AddressBook = artifacts.require('./AddressBook.sol')

export default function(deployer) {
  deployer.deploy(AddressBook)
}
