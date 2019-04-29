const { assertRevert } = require('@tps/test-helpers/assertThrow')

const mockRepoId = 'MDEwOlJlcG9zaXRvcnk3NTM5NTIyNA=='

const assertEqualRepoId = repoId => {
  assert.equal(repoId, mockRepoId, 'repo ID is returned')
}

/**
 * App initialization assertions
 */
const assertRevertInitialization = (app, badParams) => async () => {
  await assertRevert(async () => {
    await app.initialize(...badParams)
  })
}

module.exports = {
  assertEqualRepoId,
  assertRevertInitialization,
}
