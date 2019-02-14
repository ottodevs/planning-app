const {
  ACL,
  DAOFactory,
  EVMScriptRegistryFactory,
  Kernel,
} = require('@tps/test-helpers/artifacts')

const AddressBook = artifacts.require('AddressBook')

const { assertRevert } = require('@tps/test-helpers/assertThrow')

const ANY_ADDR = ' 0xffffffffffffffffffffffffffffffffffffffff'

const toAscii = hex => {
  // Find termination
  let str = ''
  let i = 0,
    l = hex.length
  if (hex.substring(0, 2) === '0x') {
    i = 2
  }
  for (; i < l; i += 2) {
    let code = parseInt(hex.substr(i, 2), 16)
    str += String.fromCharCode(code)
  }

  return str.replace(/\0/g, '') // removes 'null' \u0000 chars
}

contract('AddressBook App', accounts => {
  let daoFact = {},
    app = {}

  const root = accounts[0]

  before(async () => {
    const kernelBase = await Kernel.new(true)
    const aclBase = await ACL.new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFact = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      regFact.address
    )
    const r = await daoFact.newDAO(root)
    const dao = Kernel.at(
      r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao
    )
    const acl = ACL.at(await dao.acl())

    await acl.createPermission(
      root,
      dao.address,
      await dao.APP_MANAGER_ROLE(),
      root,
      { from: root }
    )

    const receipt = await dao.newAppInstance(
      '0x1234',
      (await AddressBook.new()).address,
      0x0,
      false,
      { from: root }
    )
    app = AddressBook.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    )

    await acl.createPermission(
      ANY_ADDR,
      app.address,
      await app.ADD_ENTRY_ROLE(),
      root,
      { from: root }
    )
    await acl.createPermission(
      ANY_ADDR,
      app.address,
      await app.REMOVE_ENTRY_ROLE(),
      root,
      { from: root }
    )
  })

  context('main context', () => {
    let starfleet = accounts[0]

    it('should initialize', async () => {
      await app.initialize()
    })

    it('should fail on reinitialization', async () => {
      return assertRevert(async () => {
        await app.initialize()
      })
    })

    it('should add a new entry', async () => {
      const receipt = await app.addEntry(
        starfleet,
        'Starfleet with spaces',
        'Group'
      )
      const addedAddress = receipt.logs.filter(l => l.event == 'EntryAdded')[0]
        .args.entryAddress
      assert.equal(addedAddress, starfleet)
    })
    it('should get the previously added entry', async () => {
      const entry1 = await app.getEntry(starfleet)
      assert.equal(toAscii(entry1[0]), 'Starfleet with spaces')
      assert.equal(toAscii(entry1[1]), 'Group')
      assert.equal(entry1[2], 0)
    })
    it('should remove the previously added entry', async () => {
      await app.removeEntry(starfleet)
      assertRevert(async () => {
        await app.getEntry(starfleet)
      })
    })
    it('should allow to use the same name from previously removed entry', async () => {
      await app.addEntry(accounts[1], 'Starfleet', 'Dejavu')
    })
    it('should allow to use the same address from previously removed entry', async () => {
      await app.addEntry(starfleet, 'NewStar', 'Dejavu')
    })
  })
  context('invalid operations', () => {
    const [borg, jeanluc] = accounts.splice(1, 2)
    before(async () => {
      app.addEntry(borg, 'Borg', 'Individual')
    })
    it('should revert when removing not existant entry', async () => {
      assertRevert(async () => {
        await app.removeEntry(jeanluc)
      })
    })
    it('should revert when getting not existant entry', async () => {
      assertRevert(async () => {
        await app.getEntry(jeanluc)
      })
    })
    it('should revert when adding duplicate name', async () => {
      assertRevert(async () => {
        await app.addEntry(jeanluc, 'Borg', 'Captain')
      })
    })
    it('should revert when adding duplicate address', async () => {
      assertRevert(async () => {
        await app.addEnty(borg, 'Cylon', 'N/A')
      })
    })
  })
})
