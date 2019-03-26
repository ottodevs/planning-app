/* global module, web3 */
const getNetworkNameFromId = (networks, id) => {
  const defaultNetwork = 'devnet'
  // const defaultNetwork = 'rpc'
  for (const n in networks) {
    if (networks[n].network_id == id) {
      return n
    }
  }
  return defaultNetwork
}
const getNetworkId = () =>
  new Promise((resolve, reject) =>
    web3.version.getNetwork((error, result) =>
      error ? reject(error) : resolve(result)
    )
  )

module.exports = async networks => {
  const id = await getNetworkId()
  const name = getNetworkNameFromId(networks, id)
  return { id, name }
}
