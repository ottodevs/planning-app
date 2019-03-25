import Aragon from '@aragon/api'
import { combineLatest } from './rxjs'
import voteSettings, { hasLoadedVoteSettings } from './utils/vote-settings'
import { EMPTY_CALLSCRIPT } from './utils/vote-utils'
import AllocationJSON from '@tps/apps-allocations/build/contracts/Allocations.json'

const app = new Aragon()
let allocations
let appState = {
  votes: [],
}
app.events().subscribe(handleEvents)
app.state().subscribe(state => {
  appState = state
})

async function handleEvents(response) {
  let nextState = {
    ...appState,
    ...(!hasLoadedVoteSettings(appState) ? await loadVoteSettings() : {}),
  }
  switch (response.event) {
    case 'CastVote':
      // console.info('[RangeVoting > script]: received CastVote')
      nextState = await castVote(nextState, response.returnValues)
      break
    case 'ExecutionScript':
      // console.info('[RangeVoting > script]: received ExecutionScript')
      // console.info(response.returnValues)
      break
    case 'ExecuteVote':
      // console.info('[RangeVoting > script]: received ExecuteVote')

      nextState = await executeVote(nextState, response.returnValues)
      break
    case 'StartVote':
      // console.info('[RangeVoting > script]: received StartVote')
      nextState = await startVote(nextState, response.returnValues)
      break
    case 'ExternalContract': {
      const funcSig = response.returnValues.funcSig
      // console.info('[RangeVoting > script]: received ExternalContract', funcSig)
      // Should actually be a case-switch
      if (funcSig.slice(58) == 'f2122136') {
        // console.log('Loading Projects Data')
      } else {
        // console.log('Loading Allocations Contract')
        allocations = app.external(
          response.returnValues.addr,
          AllocationJSON.abi
        )
      }
    }
    // default:
    //   break
  }
  // console.log('[RangeVoting > script]: end state')
  // console.log(nextState)
  appState = nextState
  app.cache('state', nextState)
}

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

async function castVote(state, { voteId }) {
  // Let's just reload the entire vote again,
  // cause do we really want more than one source of truth with a blockchain?
  const transform = async vote => ({
    ...vote,
    data: await loadVoteData(voteId),
  })
  return updateState(state, voteId, transform)
}

async function executeVote(state, { voteId }) {
  const transform = ({ data, ...vote }) => ({
    ...vote,
    data: { ...data, executed: true },
  })
  return updateState(state, voteId, transform)
}

async function startVote(state, { voteId }) {
  return updateState(state, voteId, vote => vote)
}

/***********************
 *                     *
 *       Helpers       *
 *                     *
 ***********************/

async function loadVoteDescription(vote) {
  if (!vote.executionScript || vote.executionScript === EMPTY_CALLSCRIPT) {
    // console.info(
    //   '[RangeVoting > script] loadVoteDescription: No description found for:',
    //   vote
    // )
    return vote
  }

  const path = await app.describeScript(vote.executionScript).toPromise()

  vote.description = path
    .map(step => {
      const identifier = step.identifier ? ` (${step.identifier})` : ''
      const app = step.name ? `${step.name}${identifier}` : `${step.to}`

      return `${app}: ${step.description || 'No description'}`
    })
    .join('\n')

  return vote
}

async function loadVoteData(voteId) {
  // console.info('[RangeVoting > script]: loadVoteData')
  return new Promise((resolve /*,reject*/) => {
    app
      .call('getVote', voteId)
      .first()
      .subscribe(voteData => {
        const funcSig = voteData.executionScript.slice(58, 66)
        if (funcSig == 'f2122136') {
          // console.log('Loading Projects Data')
          resolve(loadVoteDataProjects(voteData, voteId))
        } else {
          // console.log('Loading Allocations Data')
          resolve(loadVoteDataAllocation(voteData, voteId))
        }
      })
  })
}
// TODO: These functions aren't DRY make them better
async function loadVoteDataAllocation(vote, voteId) {
  return new Promise(resolve =>
    combineLatest(
      app.call('getVoteMetadata', voteId),
      app.call('getCandidateLength', voteId),
      app.call('canExecute', voteId)
    )
      .first()
      .subscribe(([metadata, totalCandidates, canExecute /*, payout*/]) => {
        loadVoteDescription(vote)
          .then(async vote => {
            const options = []

            for (let i = 0; i < totalCandidates; i++) {
              try {
                const candidateData = await getAllocationCandidate(voteId, i)
                // console.log(candidateData)
                options.push(candidateData)
              } catch (error) {
                return
              }
            }

            const returnObject = {
              ...marshallVote(vote),
              metadata,
              canExecute,
              options: options,
            }

            return void allocations
              .getPayout(vote.externalId)
              .first()
              .subscribe(payout => {
                resolve({
                  ...returnObject,
                  limit: parseInt(payout.limit, 10),
                  balance: parseInt(vote.executionScript.slice(706, 770), 16),
                  metadata:
                    'Range Vote ' +
                    voteId +
                    ' - Allocation (' +
                    payout.metadata +
                    ')',
                })
              })
          })
          .catch((/*error*/) => {})
      })
  )
}
// TODO: These functions aren't DRY make them better
async function loadVoteDataProjects(vote, voteId) {
  return new Promise(resolve =>
    combineLatest(
      app.call('getVoteMetadata', voteId),
      app.call('getCandidateLength', voteId),
      app.call('canExecute', voteId)
    )
      .first()
      .subscribe(([/*metadata, */ totalCandidates, canExecute]) => {
        // console.log('projects data:', metadata, totalCandidates, canExecute)

        loadVoteDescription(vote)
          .then(async vote => {
            const options = []
            // console.log('Vote data:', voteId, vote)
            for (let i = 0; i < totalCandidates; i++) {
              const candidateData = await getProjectCandidate(voteId, i)
              // console.log('candidate data', candidateData)
              options.push(candidateData)
            }
            // console.log(metadata)
            const returnObject = {
              ...marshallVote(vote),
              metadata: 'Range Vote ' + voteId + ' - Issue Curation',
              canExecute,
              options: options,
            }
            return void resolve(returnObject)
            // Project specific code
          })
          .catch((/*e*/) => {})
      })
  )
}

async function updateVotes(votes, voteId, transform) {
  const voteIndex = votes.findIndex(vote => vote.voteId === voteId)
  let nextVotes = [...votes]
  if (voteIndex === -1) {
    // If we can't find it, load its data, perform the transformation, and concat
    // console.log('Vote Not Found')
    nextVotes = votes.concat(
      await transform({
        voteId,
        data: await loadVoteData(voteId),
      })
    )
  } else {
    nextVotes[voteIndex] = await transform(nextVotes[voteIndex])
  }
  return nextVotes
}

async function getAllocationCandidate(voteId, candidateIndex) {
  return new Promise(resolve => {
    app
      .call('getCandidate', voteId, candidateIndex)
      .first()
      .subscribe(candidateData => {
        resolve({
          label: candidateData.candidateAddress,
          value: candidateData.voteSupport,
        })
      })
  })
}

async function getProjectCandidate(voteId, candidateIndex) {
  return new Promise(resolve => {
    app
      .call('getCandidate', voteId, candidateIndex)
      .first()
      .subscribe(candidateData => {
        resolve({
          label: candidateData.metadata,
          value: candidateData.voteSupport,
        })
      })
  })
}

async function updateState(state, voteId, transform /*, candidate = null*/) {
  let { votes = [] } = state ? state : []
  votes = await updateVotes(votes, voteId, transform)
  return {
    ...state,
    votes: votes,
  }
}

function loadVoteSettings() {
  return Promise.all(
    voteSettings.map(
      ([name, key, type = 'string']) =>
        new Promise((resolve, reject) =>
          app
            .call(name)
            .first()
            .map(val => {
              if (type === 'number') {
                return parseInt(val, 10)
              }
              if (type === 'time') {
                // Adjust for js time (in ms vs s)
                return parseInt(val, 10) * 1000
              }
              return val
            })
            .subscribe(value => {
              resolve({ [key]: value })
            }, reject)
        )
    )
  )
    .then(settings =>
      settings.reduce((acc, setting) => ({ ...acc, ...setting }), {})
    )
    .catch((/*error*/) => {
      // console.error('Failed to load Vote settings', error)
      // Return an empty object to try again later
      return {}
    })
}

// Apply transmations to a vote received from web3
// Note: ignores the 'open' field as we calculate that locally
function marshallVote({
  open,
  creator,
  startDate,
  snapshotBlock,
  candidateSupport,
  totalVoters,
  totalParticipation,
  metadata,
  executionScript,
  executed,
}) {
  totalVoters = parseInt(totalVoters, 10)
  totalParticipation = parseInt(totalParticipation, 10)
  return {
    open,
    creator,
    startDate: parseInt(startDate, 10) * 1000, // adjust for js time (in ms vs s)
    snapshotBlock: parseInt(snapshotBlock, 10),
    candidateSupport: parseInt(candidateSupport, 10),
    totalVoters: totalVoters,
    totalParticipation: totalParticipation,
    metadata,
    executionScript,
    executed,
    participationPct:
      totalVoters === 0 ? 0 : (totalParticipation / totalVoters) * 100,
  }
}
