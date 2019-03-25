/* global artifacts, assert, before, beforeEach, context, contract, it, web3, xit */
import {
  ACL,
  DAOFactory,
  EVMScriptRegistryFactory,
  Kernel,
  MiniMeToken,
} from '@tps/test-helpers/artifacts'

const RangeVoting = artifacts.require('RangeVotingMock')
const ExecutionTarget = artifacts.require('ExecutionTarget')

import { assertRevert } from '@tps/test-helpers/assertThrow'
import { encodeCallScript } from '@tps/test-helpers/evmScript'

import timetravel from '@tps/test-helpers/timeTravel'
const timeTravel = timetravel(web3)

const pct16 = x =>
  new web3.BigNumber(x).times(new web3.BigNumber(10).toPower(16))
const createdVoteId = receipt =>
  receipt.logs.filter(x => x.event === 'StartVote')[0].args.voteId

const castedVoteId = receipt =>
  receipt.logs.filter(x => x.event === 'CastVote')[0].args.voteId

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'

contract('RangeVoting App', accounts => {
  let daoFact = {}
  let app = {}
  let token = {}
  let executionTarget = {}

  const RangeVotingTime = 1000
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
  })

  beforeEach(async () => {
    const r = await daoFact.newDAO(root)
    const dao = Kernel.at(
      r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao
    )

    const acl = ACL.at(await dao.acl())

    let role = await dao.APP_MANAGER_ROLE()
    await acl.createPermission(root, dao.address, role, root, { from: root })

    // TODO: Revert to only use 2 params when truffle is updated
    // read: https://github.com/AutarkLabs/planning-suite/pull/243
    const rangeVoting = await RangeVoting.new()
    const receipt = await dao.newAppInstance(
      '0x1234',
      rangeVoting.address,
      0x0,
      false,
      { from: root }
    )

    app = RangeVoting.at(
      receipt.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy
    )
    role = await app.CREATE_VOTES_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
    role = await app.ADD_CANDIDATES_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
    role = await app.MODIFY_PARTICIPATION_ROLE()
    await acl.createPermission(ANY_ADDR, app.address, role, root, {
      from: root,
    })
  })

  context('normal token supply', () => {
    const holder19 = accounts[0]
    const holder31 = accounts[1]
    const holder50 = accounts[2]
    const nonHolder = accounts[4]

    const minimumParticipation = pct16(30)
    const candidateSupportPct = pct16(5)

    beforeEach(async () => {
      token = await MiniMeToken.new(
        NULL_ADDRESS,
        NULL_ADDRESS,
        0,
        'n',
        0,
        'n',
        true
      ) // empty parameters minime

      await token.generateTokens(holder19, 19)
      await token.generateTokens(holder31, 31)
      await token.generateTokens(holder50, 50)

      await app.initialize(
        token.address,
        minimumParticipation,
        candidateSupportPct,
        RangeVotingTime
      )

      executionTarget = await ExecutionTarget.new()
    })

    it('fails on reinitialization', async () => {
      return assertRevert(async () => {
        await app.initialize(
          token.address,
          minimumParticipation,
          candidateSupportPct,
          RangeVotingTime
        )
      })
    })

    it('can create new vote', async () => {
      const action = {
        to: executionTarget.address,
        calldata: executionTarget.contract.setSignal.getData(
          // original args: address[], uint256[] supports
          //  updated args: address[], uint256[] _supports, uint256[] infoIndex, string Info
          [accounts[7], accounts[8], accounts[9]],
          [0, 0, 0],
          [4, 4, 4],
          'arg1arg2arg3',
          [0x61, 0x61, 0x61],
          [0x61, 0x61, 0x61],
          5,
          false
        ),
      }
      const script = encodeCallScript([action])
      //console.log(script)
      const voteId = createdVoteId(
        await app.newVote(script, '', { from: holder50 })
      )
      assert.equal(voteId, 1, 'A vote should be created with empty script')
    })
    it('can cast votes', async () => {
      const data = executionTarget.contract.setSignal.getData(
        // original args: address[], uint256[] supports
        //  updated args: address[], uint256[] supports, uint256[] infoIndex, string Info
        [accounts[7], accounts[8], accounts[9]],
        [0, 0, 0],
        [4, 4, 4],
        'arg1arg2arg3',
        ['0x0', '0x0', '0x0'],
        ['0x0', '0x0', '0x0'],
        5,
        false
      )
      const action = {
        to: executionTarget.address,
        calldata: data,
      }
      const script = encodeCallScript([action])
      let vote = await app.newVote(script, '', { from: holder50 })
      let voteId = createdVoteId(vote)
      assert.equal(voteId, 1, 'A vote should be created with empty script')
      const votes = [10, 15, 25]
      const voter = holder50
      vote = await app.vote(voteId, votes, { from: voter })
      voteId = castedVoteId(vote)
      assert.equal(voteId, 1, 'A vote should have been casted')
    })
    it('execution scripts can execute actions', async () => {
      const data = executionTarget.contract.setSignal.getData(
        // original args: address[], uint256[] supports
        //  updated args: address[], uint256[] supports, uint256[] infoIndex, string Info
        [accounts[7], accounts[8], accounts[9]],
        [0, 0, 0],
        [4, 4, 4],
        'arg1arg2arg3',
        [1, 2, 3],
        [2, 4, 6],
        5,
        true
      )
      const action = {
        to: executionTarget.address,
        calldata: data,
      }
      const script = encodeCallScript([action])
      const voteId = createdVoteId(
        await app.newVote(script, '', { from: holder50 })
      )
      const vote = [10, 15, 25]
      const voter = holder50
      await app.vote(voteId, vote, { from: voter })
      timeTravel(RangeVotingTime + 1)
      await app.executeVote(voteId)
      //assert.equal(1,0)
      let signal
      for (let i = 0; i < vote.length; i++) {
        signal = await executionTarget.getSignal(i)
        assert.equal(
          signal[0].toNumber(),
          vote[i],
          'Signal ' + i + ' should be ' + vote[i]
        )
        assert.equal(
          signal[1].toNumber(),
          i + 1,
          'Id1 ' + (i + 1) + 'is incorrect'
        )
        assert.equal(
          signal[2].toNumber(),
          2 * (i + 1),
          'Id2 ' + 2 * (i + 1) + ' is incorrect'
        )
      }
    })

    it('execution script can be empty', async () => {
      const callScript = encodeCallScript([])
      const voteId = createdVoteId(
        await app.newVote(callScript, '', { from: holder50 })
      )
      assert.equal(voteId, 1, 'A vote should be created with empty script')
    })

    it('execution throws if any action on script throws', async () => {
      const action = {
        to: executionTarget.address,
        calldata: executionTarget.contract.setSignal.getData(
          [],
          [],
          [],
          '',
          [],
          [],
          0,
          true
        ),
      }
      const script = encodeCallScript([action])
      //console.log(script)
      const voteId = createdVoteId(
        await app.newVote(script, '', { from: holder50 })
      )
      const vote = [10, 15, 25]
      await app.addCandidate(voteId, '0x', accounts[7], 0x0, 0x0)
      await app.addCandidate(voteId, '0x', accounts[8], 0x0, 0x0)
      await app.addCandidate(voteId, '0x', accounts[9], 0x0, 0x0)
      const voter = holder50
      await app.vote(voteId, vote, { from: voter })
      return assertRevert(async () => {
        await app.executeVote(voteId)
      })
    })

    it('forwarding creates vote', async () => {
      const action = {
        to: executionTarget.address,
        calldata: executionTarget.contract.setSignal.getData(
          // original args: address[], uint256[] supports
          //  updated args: address[], uint256[] supports, uint256[] infoIndex, string Info
          [accounts[7], accounts[8], accounts[9]],
          [0, 0, 0],
          [4, 4, 4],
          'arg1arg2arg3',
          ['0x0', '0x0', '0x0'],
          ['0x0', '0x0', '0x0'],
          5,
          false
        ),
      }
      const script = encodeCallScript([action])
      const voteId = createdVoteId(
        await app.forward(script, { from: holder50 })
      )
      assert.equal(voteId, 1, 'RangeVoting should have been created')
    })

    it('can change minimum candidate support', async () => {})

    context('creating vote with normal distributions', () => {
      let voteId = {}
      let script = ''
      let candidateState
      // TODO: improve this assignment
      /* eslint-disable-next-line unicorn/no-unreadable-array-destructuring */
      const [, , ...candidates] = accounts.slice(0, 5)
      const [apple, orange, banana] = candidates

      beforeEach(async () => {
        const action = {
          to: executionTarget.address,
          calldata: executionTarget.contract.setSignal.getData(
            // TODO: Candidates need to be added in reverse order to keep their initial index
            candidates,
            [0, 0, 0],
            [4, 4, 4],
            'arg1arg2arg3',
            [0x1, 0x2, 0x3],
            [0x1, 0x2, 0x3],
            5,
            false
          ),
        }
        script = await encodeCallScript([action])
        // console.log(script)
        const newvote = await app.newVote(script, 'metadata', {
          from: nonHolder,
        })
        voteId = createdVoteId(newvote)
      })

      it('has correct vote ID', async () => {
        assert.equal(voteId, 1, 'RangeVote should have been created')
      })

      it('stored the candidate addresses correctly', async () => {
        const appleState = await app.getCandidate(
          voteId,
          candidates.indexOf(apple)
        )
        //console.log(appleState)
        const orangeState = await app.getCandidate(
          voteId,
          candidates.indexOf(orange)
        )
        const bananaState = await app.getCandidate(
          voteId,
          candidates.indexOf(banana)
        )
        assert.equal(
          appleState[0],
          apple,
          'apple address extracted incorrectly'
        )
        assert.equal(
          orangeState[0],
          orange,
          'orange address extracted incorrectly'
        )
        assert.equal(
          bananaState[0],
          banana,
          'banana address extracted incorrectly'
        )
      })
      it('has correct state', async () => {
        const voteState = await app.getVote(voteId)
        const tokenBalance = await token.totalSupply()
        assert.equal(voteState[0], true, 'is true')
        assert.equal(voteState[1], nonHolder, 'is nonHolder')
        assert.equal(
          voteState[4].toNumber(),
          candidateSupportPct.toNumber(),
          'is candidateSupportPct'
        )
        assert.equal(
          voteState[5].toNumber(),
          tokenBalance.toNumber(),
          'is token.totalSupply()'
        )
        assert.equal(voteState[6].toNumber(), 0, 'is totalParticipation')
        // TODO: externalId returning as 3. Need sanity check to ensure if this s/b the case.
        // assert.equal(voteState[7].toNumber(), 3, 'is externalId')
        assert.equal(voteState[8], script, 'is script')
        assert.equal(voteState[9], false, 'is false')
      })

      it('holder can vote', async () => {
        const vote = [1, 2, 3]
        const voter = holder19

        await app.vote(voteId, vote, { from: voter })
        await app.vote(voteId, vote, { from: voter })
        const holderVoteData = await app.getVoterState(voteId, voter)
        assert.equal(
          vote[0],
          holderVoteData[0].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          vote[1],
          holderVoteData[1].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          vote[2],
          holderVoteData[2].toNumber(),
          'vote and voter state should match after casting ballot'
        )

        const appleInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(apple)
        )
        const orangeInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(orange)
        )
        const bananaInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(banana)
        )

        assert.equal(
          appleInfo[1].toNumber(),
          vote[0],
          'The correct amount of support should be logged for Apple'
        )
        assert.equal(
          orangeInfo[1].toNumber(),
          vote[1],
          'The correct amount of support should be logged for Orange'
        )
        assert.equal(
          bananaInfo[1].toNumber(),
          vote[2],
          'The correct amount of support should be logged for Banana'
        )
      })

      it('holder can modify vote', async () => {
        const voteTwo = [6, 5, 4]

        const voter = holder31

        await app.vote(voteId, voteTwo, { from: voter })
        await app.vote(voteId, voteTwo, { from: voter })
        const holderVoteData2 = await app.getVoterState(voteId, voter)
        assert.equal(
          voteTwo[0],
          holderVoteData2[0].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          voteTwo[1],
          holderVoteData2[1].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          voteTwo[2],
          holderVoteData2[2].toNumber(),
          'vote and voter state should match after casting ballot'
        )

        const appleInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(apple)
        )
        const orangeInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(orange)
        )
        const bananaInfo = await app.getCandidate(
          voteId,
          candidates.indexOf(banana)
        )

        assert.equal(
          appleInfo[1].toNumber(),
          voteTwo[0],
          'The correct amount of support should be logged for Apple'
        )
        assert.equal(
          orangeInfo[1].toNumber(),
          voteTwo[1],
          'The correct amount of support should be logged for Orange'
        )
        assert.equal(
          bananaInfo[1].toNumber(),
          voteTwo[2],
          'The correct amount of support should be logged for Banana'
        )
      })

      it('token transfers dont affect RangeVoting', async () => {
        const vote = [10, 9, 12]
        const voter = holder31
        await token.transfer(nonHolder, 31, { from: voter })
        await app.vote(voteId, vote, { from: voter })
        const holderVoteData1 = await app.getVoterState(voteId, voter)
        assert.equal(
          vote[0],
          holderVoteData1[0].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          vote[1],
          holderVoteData1[1].toNumber(),
          'vote and voter state should match after casting ballot'
        )
        assert.equal(
          vote[2],
          holderVoteData1[2].toNumber(),
          'vote and voter state should match after casting ballot'
        )
      })

      it('cannot execute during open vote', async () => {
        const canExecute = await app.canExecute(voteId)
        assert.equal(canExecute, false, 'canExecute should be false')
      })
      it('cannot execute if vote instance executed', async () => {
        const voteOne = [4, 15, 0]
        const voteTwo = [20, 10, 1]
        const voteThree = [30, 15, 5]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        await app.executeVote(voteId)
        const canExecute = await app.canExecute(voteId)

        assert.equal(canExecute, false, 'canExecute should be false')
      })
      it('can execute if vote has sufficient candidate support', async () => {
        const voteOne = [4, 15, 0]
        const voteTwo = [20, 10, 1]
        const voteThree = [30, 15, 5]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        const canExecute = await app.canExecute(voteId)

        assert.equal(canExecute, true, 'canExecute should be true')
      })
      it('cannot execute if vote has 0 candidate support', async () => {
        const voteOne = [0, 0, 0]
        const voteTwo = [0, 0, 0]
        const voteThree = [0, 0, 0]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        const canExecute = await app.canExecute(voteId)
        assert.equal(canExecute, false, 'canExecute should be false')
      })
      it('cannot execute if vote has insufficient candidate support', async () => {
        const voteOne = [2, 17, 0]
        const voteTwo = [18, 12, 1]
        const voteThree = [30, 19, 1]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        const canExecute = await app.canExecute(voteId)
        assert.equal(canExecute, false, 'canExecute should be false')
      })
      it('can execute vote if minimum participation (quorum) has been met', async () => {
        const voteOne = [10, 0, 0]
        const voteTwo = [0, 20, 0]
        const voteThree = [0, 0, 40]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        const canExecute = await app.canExecute(voteId)
        assert.equal(canExecute, true, 'canExecute should be true')
      })
      it('cannot execute vote if minimum participation (quorum) not met', async () => {
        const voteOne = [10, 0, 0]
        const voteTwo = [0, 9, 0]
        const voteThree = [0, 0, 10]
        await app.vote(voteId, voteOne, { from: holder19 })
        await app.vote(voteId, voteTwo, { from: holder31 })
        await app.vote(voteId, voteThree, { from: holder50 })
        timeTravel(RangeVotingTime + 1)
        const canExecute = await app.canExecute(voteId)
        assert.equal(canExecute, false, 'canExecute should be false')
      })
      it('holder can add candidates', async () => {
        const mango = accounts[5]
        await app.addCandidate(voteId, '0xbeefdead', mango, 0x1, 0x1)
        candidates.push(mango)
        candidateState = await app.getCandidate(
          voteId,
          candidates.indexOf(mango)
        )
        assert.equal(
          candidateState[0],
          mango,
          'Candidate should have been added'
        )
        assert.equal(
          candidateState[1].toNumber(),
          0,
          'Support should start at 0'
        )
        candidates.pop()
      })
      it('holder can get total number of candidates', async () => {
        const totalCandidates = await app.getCandidateLength(voteId)
        assert.equal(
          totalCandidates.toNumber(),
          3,
          'candidate array length is incorrect'
        )
      })
      it('holder can get vote metadata', async () => {
        const metadata = await app.getVoteMetadata(voteId)
        assert.equal(metadata, 'metadata', 'Vote has metadata')
      })
    })
  })
  context('wrong initializations', () => {
    beforeEach(async () => {
      const n = '0x00'
      token = await MiniMeToken.new(n, n, 0, 'n', 0, 'n', true) // empty parameters minime
    })

    it('fails if min participation is 0', () => {
      const minimumParticipation = pct16(0)
      const candidateSupportPct = pct16(0)
      return assertRevert(async () => {
        await app.initialize(
          token.address,
          minimumParticipation,
          candidateSupportPct,
          RangeVotingTime
        )
      })
    })

    it('fails if min candidate support is greater than min participation', () => {
      const minimumParticipation = pct16(20)
      const candidateSupportPct = pct16(50)
      return assertRevert(async () => {
        await app.initialize(
          token.address,
          minimumParticipation,
          candidateSupportPct,
          RangeVotingTime
        )
      })
    })

    it('fails if min participation is greater than 100', () => {
      const minimumParticipation = pct16(101)
      const candidateSupportPct = pct16(20)
      return assertRevert(async () => {
        await app.initialize(
          token.address,
          minimumParticipation,
          candidateSupportPct,
          RangeVotingTime
        )
      })
    })
  })

  context('before init', () => {
    it('fails creating a vote before initialization', async () => {
      return assertRevert(async () => {
        await app.newVote(encodeCallScript([]), '')
      })
    })
  })
})
