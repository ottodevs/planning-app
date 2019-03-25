/* global assert */
const assertError = (error, s, message) => {
  assert.isAbove(error.message.search(s), -1, message)
}

const assertThrows = async (block, message, errorCode) => {
  try {
    await block()
  } catch (error) {
    return assertError(error, errorCode, message)
  }
  assert.fail('should have thrown before')
}

export const assertInvalidOpcode = (
  block,
  message = 'should have failed with invalid opcode'
) => {
  return assertThrows(block, message, 'invalid opcode')
}

export const assertJump = async (
  block,
  message = 'should have failed with invalid JUMP'
) => {
  return assertThrows(block, message, 'invalid JUMP')
}

export const assertRevert = async (
  block,
  message = 'should have failed by reverting'
) => {
  return assertThrows(block, message, 'revert')
}
