import '@babel/polyfill'

import Aragon, { providers } from '@aragon/client'
import { first, of } from 'rxjs' // Make sure observables have .first
import { combineLatest } from 'rxjs'
import { empty } from 'rxjs/observable/empty'

// import { GraphQLClient } from 'graphql-request'
// import { STATUS } from './utils/github'

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

  return str
}

// const repoData = id => `{
//     node(id: "${id}") {
//       ... on Repository {
//         name
//         description
//         defaultBranchRef {
//             target {
//               ...on Commit {
//                 history {
//                   totalCount
//                 }
//               }
//             }
//           }
//         collaborators {
//           totalCount
//         }
//       }
//     }
// }`

const app = new Aragon()
let appState

/**
 * Observe the github object.
 * @return {Observable} An observable of github object over time.
 */
const github = () => {
  return app.rpc
    .sendAndObserveResponses('cache', ['get', 'github'])
    .pluck('result')
}

// let client
// const getRepoData = repo => {
//   try {
//     let data = client.request(repoData(repo))
//     return data
//   } catch (err) {
//     console.error('getRepoData failed: ', err)
//   }
// }

// const initClient = authToken => {
//   client = new GraphQLClient('https://api.github.com/graphql', {
//     headers: {
//       Authorization: 'Bearer ' + authToken,
//     },
//   })
// }

// TODO: Handle cases where checking validity of token fails (revoked, etc)

github().subscribe(result => {
  console.log('[projects/script] github received from cache:', result)
  if (result) {
    // result.token && initClient(result.token)
    return
  } else app.cache('github', { status: 'initial' })
})

app.events().subscribe(handleEvents)

app.state().subscribe(state => {
  state && console.log('[projects/script] received state:', state)
  appState = state ? state : { repos: [], bountySettings: {} }
})

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

async function handleEvents(response) {
  let nextState
  switch (response.event) {
    case 'RepoAdded':
      console.log('[projects/script] RepoAdded')
      nextState = await syncRepos(appState, response.returnValues)
      break
    case 'RepoRemoved':
      console.log('[projects/script] RepoRemoved', response.returnValues)
      nextState = await syncRepos(appState, response.returnValues)
      break
    case 'RepoUpdated':
      console.log('[projects/script] RepoUpdated', response.returnValues)
      nextState = await syncRepos(appState, response.returnValues)
    case 'BountyAdded':
      console.log('[projects/script] BountyAdded', response.returnValues)
      nextState = await syncRepos(appState, response.returnValues)
      break
    case 'IssueCurated':
      console.log('[projects/script] IssueCurated', response.returnValues)
      nextState = await syncRepos(appState, response.returnValues)
      break
    case 'BountySettingsChanged':
      console.log('[projects/script] BountySettingsChanged')
      nextState = await syncSettings(appState) // No returnValues on this
      break
    default:
      console.log('[projects/script] unknown event received:', response)
  }
  app.cache('state', nextState)
}

async function syncRepos(state, { repoId, ...eventArgs }) {
  // console.log('syncRepos: arguments from events:', eventArgs)

  const transform = ({ ...repo }) => ({
    ...repo,
  })
  try {
    let updatedState = await updateState(state, repoId, transform)
    return updatedState
  } catch (err) {
    console.error('[projects/script] updateState failed', err)
  }
}

async function syncSettings(state) {
  try {
    let settings = await loadSettings()
    state.bountySettings = settings
    return state
  } catch (err) {
    console.error('[projects/script] syncSettings failed', err)
  }
}

/***********************
 *                     *
 *       Helpers       *
 *                     *
 ***********************/

function loadRepoData(id) {
  return new Promise(resolve => {
    app.call('getRepo', id).subscribe(({ owner, index }) => {
      const [_repo, _owner] = [toAscii(id), toAscii(owner)]
      // getRepoData(_repo).then(({ node }) => {
      //   const commits = node.defaultBranchRef
      //     ? node.defaultBranchRef.commits
      //     : 0
      //   const description = node.description
      //     ? node.description
      //     : '(no description available)'
      //   const metadata = {
      //     name: node.name,
      //     description: description,
      //     collaborators: node.collaborators.totalCount,
      //     commits,
      //   }
      resolve({ _repo, _owner, index })
      // resolve({ _repo, _owner, index, metadata })
      // })
    })
  })
}

function loadSettings() {
  return new Promise(resolve => {
    app.call('getSettings').subscribe(settings => {
      resolve(settings)
    })
  })
}

async function checkReposLoaded(repos, id, transform) {
  const repoIndex = repos.findIndex(repo => repo.id === id)
  // console.log('this is the repo index:', repoIndex)
  // console.log('checkReposLoaded, repoIndex:', repos, id)
  const { metadata, ...data } = await loadRepoData(id)

  if (repoIndex === -1) {
    // If we can't find it, load its data, perform the transformation, and concat
    // console.log('repo not found in the cache: retrieving from chain')
    return repos.concat(
      await transform({
        id,
        data: { ...data },
        metadata,
      })
    )
  } else {
    // console.log('repo found: ' + repoIndex)
    const nextRepos = Array.from(repos)
    nextRepos[repoIndex] = await transform({
      id,
      data: { ...data },
      metadata,
    })
    return nextRepos
  }
}

async function updateState(state, id, transform) {
  // console.log('update state: ' + state + ', id: ' + id)
  const { repos = [] } = state
  try {
    let newRepos = await checkReposLoaded(repos, id, transform)
    let newState = { ...state, repos: newRepos }
    return newState
  } catch (err) {
    console.error(
      'Update repos failed to return:',
      err,
      "here's what returned in NewRepos",
      newRepos
    )
  }
}
