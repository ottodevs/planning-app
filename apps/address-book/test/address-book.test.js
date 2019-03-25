/* global artifacts, assert, before, context, contract, it */

import {
  ACL,
  DAOFactory,
  EVMScriptRegistryFactory,
  Kernel,
} from '@tps/test-helpers/artifacts'

import { assertRevert } from '@tps/test-helpers/assertThrow'

const AddressBook = artifacts.require('AddressBook')
const ANY_ADDR = ' 0xffffffffffffffffffffffffffffffffffffffff'

contract('AddressBook App', accounts => {
  let daoFact = {}
  let app = {}

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
    let role = await dao.APP_MANAGER_ROLE()

    await acl.createPermission(root, dao.address, role, root, { from: root })
    const addressBook = await AddressBook.new()
    const receipt = await dao.newAppInstance(
      '0x1234',
      addressBook.address,
      0x0,
      false,
      { from: root }
    )
    app = AddressBook.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    )
    await app.initialize()
    role = await app.ADD_ENTRY_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
    ;(role = await app.REMOVE_ENTRY_ROLE()),
      await acl.createPermission(ANY_ADDR, app.address, role, root, {
        from: root,
      })
  })

  context('main context', () => {
    const starfleet = accounts[0]

    it('should add a new entry', async () => {
      const receipt = await app.addEntry(starfleet, 'Starfleet', 'Group')
      const addedAddress = receipt.logs.filter(l => l.event == 'EntryAdded')[0]
        .args.addr
      assert.equal(addedAddress, starfleet)
    })
    it('should get the previously added entry', async () => {
      const entry1 = await app.getEntry(starfleet)
      assert.equal(entry1[0], starfleet)
      assert.equal(entry1[1], 'Starfleet')
      assert.equal(entry1[2], 'Group')
    })
    it('should remove the previously added entry', async () => {
      await app.removeEntry(starfleet)
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

    it('should revert when adding duplicate address', async () => {
      assertRevert(async () => {
        await app.addEntry(borg, 'Burg', 'N/A')
      })
    })
    it('should revert when adding duplicate name', async () => {
      assertRevert(async () => {
        await app.addEntry(jeanluc, 'Borg', 'Captain')
      })
    })
    it('should revert when removing not existent entry', async () => {
      assertRevert(async () => {
        await app.removeEntry(jeanluc)
      })
    })
    it('should revert when getting non-existent entry', async () => {
      assertRevert(async () => {
        await app.getEntry(jeanluc)
      })
    })
  })
})
