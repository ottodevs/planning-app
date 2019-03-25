/* global artifacts, assert, before, beforeEach, context, contract, it, web3*/

import {
  ACL,
  DAOFactory,
  EVMScriptRegistryFactory,
  Kernel,
} from '@tps/test-helpers/artifacts'

const Allocations = artifacts.require('Allocations')

import { assertRevert } from '@tps/test-helpers/assertThrow'
import timetravel from '@tps/test-helpers/timeTravel'

const timeTravel = timetravel(web3)

// TODO: Fix Vault not loading artifacts error
// const Vault = artifacts.require('@aragon/apps-vault/contracts/Vault')

// const createdPayoutId = receipt =>
//   receipt.logs.filter(x => x.event == 'StartPayout')[0].args.voteId // TODO: not-used

const ANY_ADDR = ' 0xffffffffffffffffffffffffffffffffffffffff'

contract('Allocations App', accounts => {
  let daoFact,
    app = {}

  const root = accounts[0]

  const [empire, bobafett, dengar, bossk] = accounts
  const candidateAddresses = [bobafett, dengar, bossk]

  before(async () => {
    const kernelBase = await Kernel.new(true)
    const aclBase = await ACL.new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFact = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      regFact.address
    )
  })

  beforeEach(async () => {
    const r = await daoFact.newDAO(root)
    const dao = Kernel.at(
      r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao
    )

    const acl = ACL.at(await dao.acl())

    let role = await dao.APP_MANAGER_ROLE()
    await acl.createPermission(root, dao.address, role, root, { from: root })

    // TODO: Revert to use regular function call when truffle gets updated
    // read: https://github.com/AutarkLabs/planning-suite/pull/243
    const allocations = await Allocations.new()
    const receipt = await dao.newAppInstance(
      '0x1234',
      allocations.address,
      0x0,
      false,
      { from: root }
    )

    app = Allocations.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    )

    role = await app.START_PAYOUT_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
    role = await app.SET_DISTRIBUTION_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
    role = await app.EXECUTE_PAYOUT_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })

    // TODO: Fix vault
    // vault = Vault.at(
    //   receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    // )

    await app.initialize(0x0, { from: accounts[0] })
  })

  context('app creation and funded Payout', () => {
    let bobafettInitialBalance
    let dengarInitialBalance
    let bosskInitialBalance
    let allocationId
    let supports
    let totalSupport

    before(async () => {
      bobafettInitialBalance = await web3.eth.getBalance(bobafett)
      dengarInitialBalance = await web3.eth.getBalance(dengar)
      bosskInitialBalance = await web3.eth.getBalance(bossk)
    })

    beforeEach(async () => {
      allocationId = (await app.newPayout(
        "Fett's vett",
        web3.toWei(1, 'ether'),
        0x0
      )).logs[0].args.accountId.toNumber()

      await app.fund(allocationId, {
        from: empire,
        value: web3.toWei(0.01, 'ether'),
      })

      supports = [500, 200, 300]
      totalSupport = 1000
      const zeros = new Array(candidateAddresses.length).fill(0)
      await app.setDistribution(
        candidateAddresses,
        supports,
        zeros,
        '',
        zeros,
        zeros,
        allocationId,
        false,
        false,
        0,
        web3.toWei(0.01, 'ether')
      )
    })

    it('app initialized properly', async () => {
      const initBlock = await app.getInitializationBlock()
      assert.isAbove(
        initBlock.toNumber(),
        0,
        'App was not initialized properly'
      )
    })

    it('can create a new Payout', async () => {
      const payoutMembers = await app.getPayout(allocationId)
      assert.equal(payoutMembers[2], "Fett's vett", 'Payout metadata incorrect')
      assert.equal(
        payoutMembers[0].toNumber(),
        10000000000000000,
        'Payout Balance Incorrect'
      )
      assert.equal(
        payoutMembers[1].toNumber(),
        1000000000000000000,
        'Payout Limit incorrect'
      )
    })

    it('sets the distribution', async () => {
      const candidateArrayLength = (await app.getNumberOfCandidates(
        allocationId
      )).toNumber()
      const storedSupport = []
      let supportVal

      for (let i = 0; i < candidateArrayLength; i++) {
        supportVal = (await app.getPayoutDistributionValue(
          allocationId,
          i
        )).toNumber()
        assert.equal(
          supports[i],
          supportVal,
          'support distributions do not match what is specified'
        )
        storedSupport.push(supportVal)
      }
      assert.equal(
        supports.length,
        storedSupport.length,
        'distribution array lengths do not match'
      )
    })

    it('executes the payout', async () => {
      await app.runPayout(allocationId, { from: empire })
      const bobafettBalance = await web3.eth.getBalance(bobafett)
      const dengarBalance = await web3.eth.getBalance(dengar)
      const bosskBalance = await web3.eth.getBalance(bossk)
      assert.equal(
        bobafettBalance.toNumber() - bobafettInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[0]) / totalSupport,
        'bounty hunter expense'
      )
      assert.equal(
        dengarBalance.toNumber() - dengarInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[1]) / totalSupport,
        'bounty hunter expense'
      )
      assert.equal(
        bosskBalance.toNumber() - bosskInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[2]) / totalSupport,
        'bounty hunter expense'
      )
    })

    it('cannot add to balance without passing equal msg.value', async () => {
      allocationId = (await app.newPayout(
        "Fett's Lambo",
        web3.toWei(1, 'ether'),
        0x0
      )).logs[0].args.accountId.toNumber()

      supports = [300, 300, 400]
      totalSupport = 1000

      return assertRevert(async () => {
        const zeros = new Array(candidateAddresses.length).fill(0)
        await app.setDistribution(
          candidateAddresses,
          supports,
          zeros,
          '',
          zeros,
          zeros,
          allocationId,
          false,
          false,
          0,
          web3.toWei(0.01, 'ether'),
          { from: empire }
        )
      })
    })

    context('invalid workflows', () => {
      beforeEach(async () => {
        allocationId = (await app.newPayout(
          "Fett's vett",
          web3.toWei(1, 'ether'),
          0x0
        )).logs[0].args.accountId.toNumber()

        //await app.fund(allocationId, {
        //  from: empire,
        //  value: web3.toWei(0.01, 'ether'),
        //})
      })

      it('cannot set Distribution before funding the account', async () => {
        supports = [500, 200, 300]
        totalSupport = 1000
        const zeros = new Array(candidateAddresses.length).fill(0)
        return assertRevert(async () => {
          await app.setDistribution(
            candidateAddresses,
            supports,
            zeros,
            '',
            zeros,
            zeros,
            allocationId,
            false,
            false,
            0,
            web3.toWei(0.01, 'ether')
          )
        })
      })
      it('cannot set Distribution above account limit', async () => {
        await app.fund(allocationId, {
          from: empire,
          value: web3.toWei(3.0, 'ether'),
        })

        supports = [500, 200, 300]
        totalSupport = 1000
        const zeros = new Array(candidateAddresses.length).fill(0)
        return assertRevert(async () => {
          await app.setDistribution(
            candidateAddresses,
            supports,
            zeros,
            '',
            zeros,
            zeros,
            allocationId,
            false,
            false,
            0,
            web3.toWei(1.01, 'ether')
          )
        })
      })
      it('cannot execute payout before Distribution is set', async () => {
        await app.fund(allocationId, {
          from: empire,
          value: web3.toWei(3.0, 'ether'),
        })
        return assertRevert(async () => {
          await app.runPayout(allocationId, { from: empire })
        })
      })
    })
  })

  context('Informational Payout', () => {
    let allocationId
    let supports

    beforeEach(async () => {
      allocationId = (await app.newPayout(
        "Fett's auto warranty",
        0,
        0x0
      )).logs[0].args.accountId.toNumber()
    })

    it('can create new Payout', async () => {
      const payoutMembers = await app.getPayout(allocationId)
      assert.equal(
        payoutMembers[2],
        "Fett's auto warranty",
        'Payout metadata incorrect'
      )
      assert.equal(payoutMembers[0].toNumber(), 0, 'Payout Balance Incorrect')
      assert.equal(payoutMembers[1].toNumber(), 0, 'Payout Limit incorrect')
    })

    it('sets the distribution', async () => {
      supports = [300, 400, 300]

      const zeros = new Array(candidateAddresses.length).fill(0)
      await app.setDistribution(
        candidateAddresses,
        supports,
        zeros,
        '',
        zeros,
        zeros,
        allocationId,
        true,
        false,
        0,
        0,
        { from: empire }
      )
      const candidateArrayLength = (await app.getNumberOfCandidates(
        allocationId
      )).toNumber()
      const storedSupport = []
      let supportVal

      for (let i = 0; i < candidateArrayLength; i++) {
        supportVal = (await app.getPayoutDistributionValue(
          allocationId,
          i
        )).toNumber()
        assert.equal(
          supports[i],
          supportVal,
          'support distributions do not match what is specified'
        )
        storedSupport.push(supportVal)
      }
      assert.equal(
        supports.length,
        storedSupport.length,
        'distribution array lengths do not match'
      )
    })
    it('cannot accept funds via a fund call', async () => {
      supports = [300, 400, 300]
      const zeros = new Array(candidateAddresses.length).fill(0)
      await app.setDistribution(
        candidateAddresses,
        supports,
        zeros,
        '',
        zeros,
        zeros,
        allocationId,
        true,
        false,
        0,
        0,
        { from: empire }
      )
      return assertRevert(async () => {
        await app.fund(allocationId, {
          from: empire,
          value: web3.toWei(0.01, 'ether'),
        })
      })
    })
    it('cannot accept funds via setDistribution', async () => {
      //assertrevert when attempt to add funds
      supports = [300, 400, 300]
      const zeros = new Array(candidateAddresses.length).fill(0)
      return assertRevert(async () => {
        await app.setDistribution(
          candidateAddresses,
          supports,
          zeros,
          '',
          zeros,
          zeros,
          allocationId,
          true,
          false,
          0,
          0,
          { from: empire, value: web3.toWei(0.01, 'ether') }
        )
      })
    })
    it('cannot execute', async () => {
      // assertrevert an attempt to run runPayout for an informational vote
      return assertRevert(async () => {
        await app.runPayout(allocationId)
      })
    })
  })

  context('Recurring Payout', () => {
    const empire = accounts[0]
    const bobafett = accounts[1]
    const dengar = accounts[2]
    const bossk = accounts[3]

    let bobafettInitialBalance
    let dengarInitialBalance
    let bosskInitialBalance
    let allocationId
    let supports

    before(async () => {
      bobafettInitialBalance = await web3.eth.getBalance(bobafett)
      dengarInitialBalance = await web3.eth.getBalance(dengar)
      bosskInitialBalance = await web3.eth.getBalance(bossk)
    })

    beforeEach(async () => {
      allocationId = (await app.newPayout(
        "Fett's auto warranty",
        web3.toWei(0.1, 'ether'),
        0x0
      )).logs[0].args.accountId.toNumber()
    })
    it('cannot occur more frequently than daily', async () => {
      supports = [300, 400, 300]
      const zeros = new Array(candidateAddresses.length).fill(0)
      return assertRevert(async () => {
        await app.setDistribution(
          candidateAddresses,
          supports,
          zeros,
          '',
          zeros,
          zeros,
          allocationId,
          false,
          true,
          86300,
          web3.toWei(0.01, 'ether'),
          { from: empire, value: web3.toWei(0.01, 'ether') }
        )
      })
    })

    it('will not execute more frequently than the specified period', async () => {
      supports = [300, 400, 300]
      const totalSupport = 1000
      const zeros = new Array(candidateAddresses.length).fill(0)
      await app.fund(allocationId, {
        from: empire,
        value: web3.toWei(0.01, 'ether'),
      })
      await app.setDistribution(
        candidateAddresses,
        supports,
        zeros,
        '',
        zeros,
        zeros,
        allocationId,
        false,
        true,
        86400,
        web3.toWei(0.01, 'ether')
      )
      timeTravel(86500)
      await app.runPayout(allocationId)
      const bobafettBalance = await web3.eth.getBalance(bobafett)
      const dengarBalance = await web3.eth.getBalance(dengar)
      const bosskBalance = await web3.eth.getBalance(bossk)
      assert.equal(
        bobafettBalance.toNumber() - bobafettInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[0]) / totalSupport,
        'bounty hunter expense 1 not paid out'
      )
      assert.equal(
        dengarBalance.toNumber() - dengarInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[1]) / totalSupport,
        'bounty hunter expense 2 not paid out'
      )
      assert.equal(
        bosskBalance.toNumber() - bosskInitialBalance.toNumber(),
        (web3.toWei(0.01, 'ether') * supports[2]) / totalSupport,
        'bounty hunter expense 3 not paid out'
      )

      await app.fund(allocationId, {
        from: empire,
        value: web3.toWei(0.01, 'ether'),
      })
      timeTravel(43200)
      return assertRevert(async () => {
        await app.runPayout(allocationId)
      })
    })
  })
})
