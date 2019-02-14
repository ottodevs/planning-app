import Aragon from '@aragon/client'

const app = new Aragon()

// app.identify

retryEvery(async retry => {
  initialize().catch(err => {
    console.error('Could not start background script execution due:', err)
    retry()
  })
})

/*
 * Calls `callback` exponentially, everytime `retry()` is called.
 *
 * Usage:
 *
 * retryEvery(retry => {
 *  // do something
 *
 *  if (condition) {
 *    // retry in 1, 2, 4, 8 seconds… as long as the condition passes.
 *    retry()
 *  }
 * }, 1000, 2)
 *
 */

function retryEvery(callback, initialRetryTimer = 1000, increaseFactor = 5) {
  const attempt = (retryTimer = initialRetryTimer) => {
    callback(() => {
      console.error(`Retrying in ${retryTimer / 1000}s...`)

      // Exponentially backoff attempts
      setTimeout(() => attempt(retryTimer * increaseFactor), retryTimer)
    })
  }

  attempt()
}

function initialize() {
  return app.store(async (state, { event, ...data }) => {
    const eventProcessor = eventMapping[event] || (state => state)
    try {
      const newState = await eventProcessor({ ...state }, data)
      return newState
    } catch (error) {
      console.error('AddressBook script error processing', event, error)
    }
    return state
  })
}

// TODO: Extract to utils
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

// const app = new Aragon()
// let appState = { entries: [] }
// app.events().subscribe(handleEvents)

// app.state().subscribe(state => {
//   if (state) appState = state
// })

// /***********************
//  *                     *
//  *   Event Handlers    *
//  *                     *
//  ***********************/

// async function handleEvents({ event, returnValues }) {
//   let nextState
//   switch (event) {
//   case 'EntryAdded':
//     console.log('Entry added, old state:', appState)
//     nextState = await onEntryAdded(appState, returnValues)
//     console.log('Entry added, new state:', nextState)
//     break
//     // case 'EntryRemoved':
//     //   nextState = await onRemoveEntry(appState, returnValues)
//     //   break
//   default:
//     console.log('[AddressBook script] Unknown event', response)
//   }
//   app.cache('state', nextState)
// }

// const onEntryAdded = async (
//   state,
//   { entryAddress, name, entryType, index }
// ) => {
//   if (state.length >= index) {
//     // This means the entry is already cached
//     return state
//   } else {
//     return combineLatest(state, {
//       entries: [
//         ...state.entries,
//         {
//           addr: entryAddress,
//           data: {
//             entryAddress,
//             entryType: toAscii(entryType),
//             index,
//             name: toAscii(name),
//           },
//         },
//       ],
//     })
//   }
// }

// const onRemoveEntry = async (state, { addr }) => {
//   const { entries = [] } = state
//   // Try to find the removed entry in the current state
//   const entryIndex = entries.findIndex(entry => entry.addr === addr)
//   // If the entry exists in the state, remove from it
//   if (entryIndex !== -1) {
//     entries.splice(entryIndex, 1)
//   }
//   return state
// }

// async function syncEntries(state, { entryAddress }) {
//   const transform = ({ data, ...entry }) => ({
//     ...entry,
//     data: { ...data },
//   })
//   try {
//     const updatedState = await updateState(state, entryAddress, transform)
//     return updatedState
//   } catch (err) {
//     console.error('[AddressBook script] syncEntries failed', err)
//   }
// }

// /***********************
//  *                     *
//  *       Helpers       *
//  *                     *
//  ***********************/

// const loadEntryData = async addr => {
//   return new Promise(resolve => {
//     app.call('getEntry', addr).subscribe(entry => {
//       // return gracefully when entry not found
//       entry &&
//         resolve({
//           entryAddress: addr,
//           name: toAscii(entry[0]),
//           entryType: toAscii(entry[1]),
//           index: entry[2],
//         })
//     })
//   })
// }

// async function checkEntriesLoaded(entries, addr, transform) {
//   const entryIndex = entries.findIndex(entry => entry.addr === addr)
//   // if (entryIndex === -1) {
//   //   // If we can't find it, load its data, perform the transformation, and concat
//   //   // hopefully every "not_found" entry will be deleted when its EntryRemoved event is handled
//   const result = entries.concat(
//     await ztransform({
//       addr,
//       data: (await loadEntryData(addr)) || 'not_found',
//     })
//   )
//   console.log('The result checkEntriesLoaded:', result)
//   return result
//   // } else {
//   //   const nextEntries = Array.from(entries)
//   //   nextEntries[entryIndex] = await transform({
//   //     addr,
//   //     data: await loadEntryData(addr),
//   //   })
//   //   return nextEntries
//   // }
// }

// async function updateState(state, addr, transform) {
//   const { entries = [] } = state
//   try {
//     const nextEntries = await checkEntriesLoaded(entries, addr, transform)
//     const newState = { ...state, entries: nextEntries }
//     return newState
//   } catch (err) {
//     console.error('[AddressBook script] updateState failed', err)
//   }
// }
