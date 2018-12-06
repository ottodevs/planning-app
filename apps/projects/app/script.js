import Aragon, { providers } from '@aragon/client'
import { first, of } from 'rxjs' // Make sure observables have .first
import { combineLatest } from 'rxjs'
import { empty } from 'rxjs/observable/empty'

import { GraphQLClient } from 'graphql-request'
import { STATUS } from './utils/github'

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
// TODO: Move to frontend, show only smart contract data if no API token or scrape basic info
// Maybe do a free contract call with something like: function x(repoName, repoCommits, repoContribs) external view { emit AddedRepo(repoName,...) }
// TODO: handle EDGE CASE: new repo with no branches fails with defaultBranchRef not found!
// TODO: Use framents or nodes(ids:["MD3fefere=", "MDewrriwjref="]) { ... on Repository  {issues etc} }
const repoData = id => `{
    rateLimit {
      cost
      remaining
      resetAt
    }
    node(id: "${id}") {
      ... on Repository {
        name
        issues(first: 10) {
          edges {
            node {
              title
              number
              id
            }
          }
        }
        description
        defaultBranchRef {
            target {
              ...on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        collaborators {
          totalCount
        }
      }
    }
}`

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

let client
const getRepoData = repo => client.request(repoData(repo))
const initClient = authToken => {
  client = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      Authorization: 'Bearer ' + authToken,
    },
  })
}

// TODO: Handle cases where checking validity of token fails (revoked, etc)

github().subscribe(result => {
  // console.log('github object received from cache:', result)
  if (result) {
    result.token && initClient(result.token)
    return
  } else app.cache('github', { status: STATUS.INITIAL })
})

app.events().subscribe(handleEvents)

app.state().subscribe(state => {
  // console.log('Projects: entered state subscription:\n', state)
  appState = state ? state : { repos: [] }
  //appState = state
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
    nextState = await syncRepos(appState, response.returnValues)
    // console.log('RepoAdded Received', response.returnValues, nextState)
    break
  case 'RepoRemoved':
    nextState = await syncRepos(appState, response.returnValues)
    // console.log('RepoRemoved Received', response.returnValues, nextState)

    break
  case 'BountyAdded':
    nextState = await syncRepos(appState, response.returnValues)
    // console.log('BountyAdded Received', response.returnValues, nextState)

    break
  default:
    // console.log('Unknown event catched:', response)
  }
  app.cache('state', nextState)
}

async function syncRepos(state, { id, ...eventArgs }) {
  // console.log('syncRepos: arguments from events:', ...eventArgs)

  const transform = ({ ...repo }) => ({
    ...repo,
  })
  try {
    let updatedState = await updateState(state, id, transform)
    return updatedState
  } catch (err) {
    console.error('updateState failed to return:', err)
  }
}

/***********************
 *                     *
 *       Helpers       *
 *                     *
 ***********************/

function loadRepoData(id) {
  // console.log('loadRepoData entered')
  return new Promise(resolve => {
    combineLatest(app.call('getRepo', id)).subscribe(([{ _owner, _repo }]) => {
      // console.log('loadRepoData:', _owner, _repo)
      let [owner, repo] = [toAscii(_owner), toAscii(_repo)]
      getRepoData(repo).then(
        ({
          rateLimit,
          node: {
            name,
            description,
            issues,
            collaborators: { totalCount: collaborators },
            defaultBranchRef: {
              target: {
                history: { totalCount: commits },
              },
            },
          },
        }) => {
          const mappedIssues = issues.edges.map(({ node }) => node)
          let metadata = {
            name,
            description,
            collaborators,
            commits,
            issues: mappedIssues,
          }
          console.log('Github API rate limit info:', rateLimit)
          resolve({ owner, repo, metadata })
        }
      )
    })
  })
}

async function checkReposLoaded(repos, id, transform) {
  const repoIndex = repos.findIndex(repo => repo.id === id)
  // console.log('checkReposLoaded, repoIndex:', repos, id)
  const { metadata, ...data } = await loadRepoData(id)

  if (repoIndex === -1) {
    // If we can't find it, load its data, perform the transformation, and concat
    // console.log('repo not found: retrieving from chain')
    return repos.concat(
      await transform({
        id,
        data: { ...data },
        metadata,
      })
    )
  } else {
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
  const { repos = [] } = state
  try {
    let newRepos = await checkReposLoaded(repos, id, transform)
    let newState = { ...state, repos: newRepos }
    return newState
  } catch (err) {
    console.error(
      'Update repos failed to return:',
      err,
      'here\'s what returned in NewRepos',
      newRepos
    )
  }
}
