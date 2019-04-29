const {
  ACL,
  DAOFactory,
  EVMScriptRegistryFactory,
  Kernel,
  StandardBounties,
} = require('@tps/test-helpers/artifacts')

const Vault = artifacts.require('Vault')
const apps = {
  Projects: artifacts.require('Projects'),
}

/**
 * Initialization helpers
 */
const deployBaseContracts = async () => {
  //Create Base DAO Contracts
  const kernelBase = await Kernel.new(true)
  const aclBase = await ACL.new()
  const regFact = await EVMScriptRegistryFactory.new()
  const daoFact = await DAOFactory.new(
    kernelBase.address,
    aclBase.address,
    regFact.address
  )
  return daoFact
}

const newDAO = async (daoFact, owner) => {
  //Deploy Base DAO Contracts
  const r = await daoFact.newDAO(owner)
  const dao = Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)

  const acl = ACL.at(await dao.acl())

  //Create DAO admin role
  await acl.createPermission(
    owner,
    dao.address,
    await dao.APP_MANAGER_ROLE(),
    owner,
    { from: owner }
  )
  return { acl, dao }
}

const deployApp = async (name, owner, dao) => {
  //Deploy Contract to be tested
  // TODO: Revert to use regular function call when truffle gets updated
  // read: https://github.com/AutarkLabs/planning-suite/pull/243
  const receipt = await dao.newAppInstance(
    '0x1234',
    (await apps[name].new()).address,
    0x0,
    false,
    { from: owner }
  )
  const app = apps[name].at(
    receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
  )
  return app
}

const setupProjectsPermissions = async (
  acl,
  app,
  owner,
  bountyAdder,
  repoRemover
) => {
  // create ACL permissions
  await acl.createPermission(
    owner,
    app.address,
    await app.ADD_REPO_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    bountyAdder,
    app.address,
    await app.ADD_BOUNTY_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    repoRemover,
    app.address,
    await app.REMOVE_REPO_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    owner,
    app.address,
    await app.CURATE_ISSUES_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    bountyAdder,
    app.address,
    await app.TASK_ASSIGNMENT_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    bountyAdder,
    app.address,
    await app.WORK_REVIEW_ROLE(),
    owner,
    { from: owner }
  )

  await acl.createPermission(
    owner,
    app.address,
    await app.CHANGE_SETTINGS_ROLE(),
    owner,
    { from: owner }
  )
}

const deployStandardBounties = async owner => {
  const bounties = await StandardBounties.new(web3.toBigNumber(owner))
  return bounties
}

const deployVault = async (app, owner, acl) => {
  const vault = await Vault.new()

  await acl.createPermission(
    app.address,
    vault.address,
    await vault.TRANSFER_ROLE(),
    owner,
    { from: owner }
  )
  return vault
}

/**
 * Repo helpers
 */
const addedRepo = receipt =>
  web3.toAscii(receipt.logs.filter(x => x.event == 'RepoAdded')[0].args.repoId)

/**
 * Bounty helpers
 */
const addedBounties = receipt =>
  receipt.logs.filter(x => x.event == 'BountyAdded')[2]

const fulfilledBounty = receipt =>
  receipt.logs.filter(x => x.event == 'BountyFulfilled')[0].args

// const usedGlobals = [
//      accounts
//      app,
//      bounties,
//      vault,
//  ]

// const usedConstants = [
//      badVault,
//      curateIssuesParams,
//      issueCurationDescription,
//      repoId
//      unusedAccounts,
//      zeros
// ]

module.exports = {
  deployApp,
  deployBaseContracts,
  deployStandardBounties,
  deployVault,
  newDAO,
  setupProjectsPermissions,
}
