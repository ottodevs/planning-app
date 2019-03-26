/* global artifacts, module, require */

const deployKit = require('./deploy-kit.js')

// Make sure that you have deployed ENS and APM and that you set the first one
// in `ENS` env variable
module.exports = async callback => {
  const deployConfig = {
    artifacts,
    kitName: 'planning-suite',
    kitContractName: 'PlanningSuite',
    // returnKit: true,
  }

  const { address } = await deployKit(null, deployConfig)

  // eslint-disable-next-line no-console
  console.log(address)
  callback()
}
