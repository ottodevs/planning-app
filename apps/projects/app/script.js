import '@babel/polyfill'
import { of } from 'rxjs'
// import { GraphQLClient } from 'graphql-request'

import Aragon from '@aragon/client'

const app = new Aragon()

// app.cache('state', {
//   hello: 'hi',
//   // getToken: () => app.cache('state', { saludo: 'hllo' }),
// })

const STATUS = {
  INITIAL: 'initial',
}

app.rpc.send('cache', ['set', 'github', { status: STATUS.INITIAL }])

app.rpc
  .sendAndObserveResponses('cache', ['get', 'github'])
  .pluck('result')
  .subscribe(state => {
    // console.log('token suscription', state)
  })

app.rpc
  .sendAndObserveResponses('cache', ['get', 'state'])
  .pluck('result')
  .subscribe(state => {
    // console.log('new suscription', state)
  })

app.state().subscribe(state => {
  // console.log('SCRIPT state', state)
  // Here we init the thing
})

// console.log('APP mode:', app.addToken)
// console.log('APP state:', app.state)
// app.events().subscribe(handleEvents)
// app.state().subscribe(state => {
//   console.log('STATE projectss', state)
//   return { token: 'hello' }
// })
// const initialState = { token: 'lel', accounts: [{ address: '0x0' }] }

// app.state().subscribe(state => {
//   console.log('[SCRIPT] received new state:', state)
//   return { ...state, team: 'some' }
//   // appState = state ? state : { accounts: [] }
//   // //appState = state
// })

// app.events().subscribe(event => {
//   console.log('[EVENT SCRIPT:', event)
// })

const state$ = app.store(async (state, { event, returnValues }) => {
  // console.log('store entered', state, event, returnValues)
  return state
})

// Log out the statee
state$.subscribe(something => {
  // console.log('state$ this:', something)
})

// Send intent to the wrapper
// app
//   .increment()
//   .subscribe(
//     txHash => console.log('Success! Incremented in tx:', txHash),
//     err => console.log('CCould not increment', err)
//   )

// const initGraphQL = authToken =>
//   new GraphQLClient('https://api.github.com/graphql', {
//     headers: {
//       Authorization: 'Bearer ' + authToken,
//     },
//   })

// // Initialise the app
// const app = new Aragon()

// // Listen for events and reduce to a state
// app.store(async (state, event) => {
//   console.log('store entered')

//   // Initial state is always null
//   if (state === null) state = {}
//   let nextState = { ...state }

//   console.log('script.js state ', state)
//   console.log('script.js event ', event)
//   // Build State
//   switch (
//     event.event // {event, returnValues}
//   ) {
//   case 'RepoAdded':
//     console.log('RepoAdded')
//     break
//   case 'RepoRemoved':
//     console.log('RepoRemoved')
//     break
//   case 'BountyAdded':
//     console.log('BountyAdded')
//     break
//   default:
//     console.log('Unknown event catched')
//     break
//   }
//   return nextState
// })

// // console.log('scrript state$', state$)

// // state$().subscribe(state => {
// //   console.log('script state$:', state)
// // })

// app.state().subscribe(async state => {
//   if (!state) return
//   state && console.log('[projects->script.js]: received new state:', state)
//   // state.token && console.log('script.js, this is the save token:', state.token)
//   if (!state.client) {
//     state.token &&
//       app.cache('state', {
//         token: state.token,
//         client: await initGraphQL(state.token),
//       })
//     state.client && console.log('script.js: GraphQL ready', state.client)
//   } else {
//     // console.log(
//     //   'client is in window.parent.graf!',
//     //   await new GraphQLClient('https://api.github.com/graphql', {
//     //     headers: {
//     //       Authorization: 'Bearer ' + state.token,
//     //     },
//     //   }).request(reposFromServer)
//     // )
//     // console.log('Script.js, we have client', state.client)
//     // console.log('getRepos:', await getReposFromServer(state.client))
//     // app.cache('state', {
//     //   ...state,
//     //   getReposFromServer: async () => await getReposFromServer(state.client),
//     // })
//   }
// })

// // import { first, of } from 'rxjs' // Make sure observables have .first
// // import { combineLatest } from 'rxjs'
// // import { empty } from 'rxjs/observable/empty'
// // import { github } from './utils/github'

// // const toAscii = hex => {
// //   // Find termination
// //   let str = ''
// //   let i = 0,
// //     l = hex.length
// //   if (hex.substring(0, 2) === '0x') {
// //     i = 2
// //   }
// //   for (; i < l; i += 2) {
// //     let code = parseInt(hex.substr(i, 2), 16)
// //     str += String.fromCharCode(code)
// //   }

// //   return str
// // }

// const reposFromServer = `{
//   viewer {
//     repositories(first: 30) {
//       edges {
//         node {
//           nameWithOwner
//         }
//       }
//     }
//   }
// }`

// const getReposFromServer = client => client.request(reposFromServer)

// // const repoData = id => `{
// //     node(id: "${id}") {
// //       ... on Repository {
// //         name
// //         description
// //         defaultBranchRef {
// //             target {
// //               ...on Commit {
// //                 history {
// //                   totalCount
// //                 }
// //               }
// //             }
// //           }
// //         collaborators {
// //           totalCount
// //         }
// //       }
// //     }
// // }`

// // const getRepoData = repo => client.request(repoData(repo))

// //
// // let appState
// // app.events().subscribe(handleEvents)

// // app.storeToken = token => {
// //   const savedToken = app.cache('state', token)
// //   console.log('token cached in script:', savedToken)
// // }

// // app.state().subscribe(state => {
// //   console.log('Projects: entered state subscription:\n', state)
// //   appState = state ? state : { repos: [] }
// //   //appState = state
// // })

// // /***********************
// //  *                     *
// //  *   Event Handlers    *
// //  *                     *
// //  ***********************/

// // async function handleEvents(response) {
// //   let nextState
// //   switch (response.event) {
// //   case 'RepoAdded':
// //     nextState = await syncRepos(appState, response.returnValues)
// //     console.log('RepoAdded Received', response.returnValues, nextState)
// //     break
// //   case 'RepoRemoved':
// //     nextState = await syncRepos(appState, response.returnValues)
// //     console.log('RepoRemoved Received', response.returnValues, nextState)

// //     break
// //   case 'BountyAdded':
// //     nextState = await syncRepos(appState, response.returnValues)
// //     console.log('BountyAdded Received', response.returnValues, nextState)

// //     break
// //   default:
// //     console.log('Unknown event catched:', response)
// //   }
// //   app.cache('state', nextState)
// // }

// // async function syncRepos(state, { id, ...eventArgs }) {
// //   console.log('syncRepos: arguments from events:', ...eventArgs)

// //   const transform = ({ ...repo }) => ({
// //     ...repo,
// //   })
// //   try {
// //     let updatedState = await updateState(state, id, transform)
// //     return updatedState
// //   } catch (err) {
// //     console.error('updateState failed to return:', err)
// //   }
// // }

// // /***********************
// //  *                     *
// //  *       Helpers       *
// //  *                     *
// //  ***********************/

// // function loadRepoData(id) {
// //   console.log('loadRepoData entered')
// //   return new Promise(resolve => {
// //     combineLatest(app.call('getRepo', id)).subscribe(([{ _owner, _repo }]) => {
// //       console.log('loadRepoData:', _owner, _repo)
// //       let [owner, repo] = [toAscii(_owner), toAscii(_repo)]
// //       getRepoData(repo).then(
// //         ({
// //           node: {
// //             name,
// //             description,
// //             collaborators: { totalCount: collaborators },
// //             defaultBranchRef: {
// //               target: {
// //                 history: { totalCount: commits },
// //               },
// //             },
// //           },
// //         }) => {
// //           let metadata = {
// //             name,
// //             description,
// //             collaborators,
// //             commits,
// //           }
// //           resolve({ owner, repo, metadata })
// //         }
// //       )
// //     })
// //   })
// // }

// // async function checkReposLoaded(repos, id, transform) {
// //   const repoIndex = repos.findIndex(repo => repo.id === id)
// //   console.log('checkReposLoaded, repoIndex:', repos, id)
// //   const { metadata, ...data } = await loadRepoData(id)

// //   if (repoIndex === -1) {
// //     // If we can't find it, load its data, perform the transformation, and concat
// //     console.log('repo not found: retrieving from chain')
// //     return repos.concat(
// //       await transform({
// //         id,
// //         data: { ...data },
// //         metadata,
// //       })
// //     )
// //   } else {
// //     const nextRepos = Array.from(repos)
// //     nextRepos[repoIndex] = await transform({
// //       id,
// //       data: { ...data },
// //       metadata,
// //     })
// //     return nextRepos
// //   }
// // }

// // async function updateState(state, id, transform) {
// //   const { repos = [] } = state
// //   try {
// //     let newRepos = await checkReposLoaded(repos, id, transform)
// //     let newState = { ...state, repos: newRepos }
// //     return newState
// //   } catch (err) {
// //     console.error(
// //       'Update repos failed to return:',
// //       err,
// //       'here\'s what returned in NewRepos',
// //       newRepos
// //     )
// //   }
// // }

// TODO: SAMPLE STATE

/*
"{
  "0xCb0FF465e3847606603A51cc946353A41Fea54c0": {
    "notifications": [],
    "0x037d0f69250a5b21c8902c9efd71f467df8680be": {
      "state": {
        "token": "6bc71bc48ec61f66e95956863ad8ad834855ce0b",
        "client": {
          "url": "https://api.github.com/graphql",
          "options": {
            "headers": {
              "Authorization": "Bearer 6bc71bc48ec61f66e95956863ad8ad834855ce0b"
            }
          }
        }
      }
    }
  }
}"
*/
