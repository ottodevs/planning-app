import { of } from './rxjs'
import Aragon from '@aragon/client'
// import AddressBookJSON from '../../address-book/build/contracts/AddressBook.json'
import addressBookEvents from '../../shared/abi/address-book'
// import { filterEntries } from '../../address-book/app/script'

const app = new Aragon()
// let appState, addressBook

const initStore = addressBookAddress => {
  console.log('init store')

  const addressBookApp = app.external(addressBookAddress, addressBookEvents)

  return app.store(async (state, event) => {
    if (state === null) state = {}
    console.log('hellot')
    return state
  })
}
//     console.log('store events', state, event)

//     try {
//       const nextState = await handleEvent(state, event)
//       console.log('next state received:', nextState)

//       return nextState
//     } catch (err) {
//       console.error('[Allocations script] initStore', event, err)
//     }
//     return state
//   },
//   [
//     // // handle account change
//     // app.accounts().map(([accountAddress]) => {
//     //   return {
//     //     event: Event.AccountChange,
//     //     accountAddress,
//     //   }
//     // }),
//     // handle finance events
//     of(addressBookApp.events()),
//   ]
// )
// }

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

const retryEvery = (callback, initialRetryTimer = 1000, increaseFactor = 5) => {
  const attempt = (retryTimer = initialRetryTimer) => {
    callback(() => {
      console.error(`Retrying in ${retryTimer / 1000}s...`)

      // Exponentially back-off attempts
      setTimeout(() => attempt(retryTimer * increaseFactor), retryTimer)
    })
  }

  attempt()
}

retryEvery(async retry => {
  const addressBookAddress = await app
    .call('addressBook')
    .first()
    .toPromise()

  console.log('inside script', addressBookAddress)
  console.log('inside script')

  initStore(addressBookAddress).catch(err => {
    console.error('[Allocations script] worker failed', err)
    retry()
  })
})
// app.events().subscribe(handleEvents)

// app.state().subscribe(state => {
//   appState = state ? state : { accounts: [], entries: [] }
//   if (!addressBook) {
//     // this should be refactored to be a "setting"
//     app.call('addressBook').subscribe(response => {
//       addressBook = app.external(response, AddressBookJSON.abi)
//       addressBook.events().subscribe(handleEvents)
//     })
//   }
// })

async function handleEvent(state, { event, returnValues }) {
  console.log('handling event:', state, event, returnValues)

  //   const { entries, accounts } = appState
  //   let nextAccounts, nextEntries

  //   switch (event) {
  //   // case 'FundAccount':
  //   //   nextAccounts = await onFundedAccount(accounts, returnValues)
  //   //   break
  //   case 'NewAccount':
  //     nextAccounts = await onNewAccount(accounts, returnValues)
  //     break
  //     // case 'PayoutExecuted':
  //     // case 'SetDistribution':
  //     //   nextAccounts = await syncAccounts(accounts, returnValues)
  //     //   break
  //   case 'EntryAdded':
  //     nextEntries = await onEntryAdded(entries, returnValues)
  //     break
  //   case 'EntryRemoved':
  //     nextEntries = await onEntryRemoved(entries, returnValues)
  //     break
  //   default:
  //     console.log('[Allocations script] Unknown event', event, returnValues)
  //   }

  //   // If nextAccounts or nextEntries were not generated
  //   // then return each original array
  //   const filteredState = {
  //     accounts: nextAccounts || accounts,
  //     entries: (nextEntries && filterEntries(nextEntries)) || entries,
  //   }
  //   app.cache('state', filteredState)
}

////////////////////////////////////////
/*    Allocations event handlers      */
////////////////////////////////////////

// const onNewAccount = async (accounts = [], { accountId }) => {
//   if (!accounts.some(a => a.accountId === accountId)) {
//     const newAccount = await getAccountById(accountId)
//     if (newAccount) {
//       accounts.push(newAccount)
//       console.log('new account gound', newAccount, accounts)
//     }
//   }
//   return accounts
// }

// const onFundedAccount = async (accounts = [], { accountId }) => {
//   if (!accounts.some(a => a.accountId === accountId)) {
//     return onNewAccount(accounts, { accountId })
//   } else {
//     const nextAccount = accounts.find(a => a.accountId === accountId)
//     console.log('nextAccount', nextAccount)
//   }
//   return accounts
// }

// const syncAccounts = async (accounts = [], { accountId }) => {
//   const data = await loadAccountData(accountId) // async load data from contract
//   const account = { accountId, data, executed: true } // transform from the frontend to understand
//   console.log('[Allocations script]', accountId, 'updating cache')
//   const nextAccounts = [...accounts, account] // add to the state object received as param
//   console.log('[ALLOCATIONS] nextAccounts', nextAccounts)

//   return nextAccounts
// }

////////////////////////////////////////
/*    Allocations helper functions    */
////////////////////////////////////////

// const getAccountById = accountId => {
//   return app
//     .call('getPayout', accountId)
//     .first()
//     .map(data => ({ accountId, data, executed: true }))
//     .toPromise()
// }

// const loadAccountData = async accountId => {
//   return new Promise(resolve => {
//     // TODO: Should we standarize the naming and switch to getAccount?
//     app
//       .call('getPayout', accountId)
//       .first()
//       .map()
//       .subscribe(account => {
//         // don't resolve when entry not found
//         if (account) {
//           resolve({
//             balance: account[0],
//             limit: account[1],
//             metadata: account[2],
//             token: account[3],
//             proxy: account[4],
//             amount: account[5],
//           })
//         }
//       })
//   })
// }

////////////////////////////////////////
/*    AddressBook event handlers      */
////////////////////////////////////////

// const onEntryAdded = async (entries = [], { addr }) => {
//   // is addr already in the state?
//   if (entries.some(entry => entry.addr === addr)) {
//     // entry already cached, do nothing
//     console.log('[Allocations script]', addr, 'already cached')
//   } else {
//     // entry not cached
//     const data = await loadEntryData(addr) // async load data from contract
//     const entry = { addr, data } // transform for the frontend to understand
//     entries.push(entry) // add to the state object received as param
//     console.log('[Allocations script] caching new contract entry', data.name)
//     // console.log('[AddressBook script] at position', addedIndex) // in case we need the index
//   }
//   return entries // return the (un)modified entries array
// }

// const onEntryRemoved = async (entries = [], { addr }) => {
//   const removeIndex = entries.findIndex(entry => entry.addr === addr)
//   if (removeIndex > -1) {
//     // entry already cached, remove from state
//     console.log('[Allocations script] removing', addr.name, 'cached copy')
//     entries.splice(removeIndex, 1)
//   }
//   return entries // return the (un)modified entries array
// }

////////////////////////////////////////
/*    AddressBook helper functions    */
////////////////////////////////////////

// const loadEntryData = async addr => {
//   return new Promise(resolve => {
//     // this is why we cannot import methods without binding proxy caller
//     addressBook.getEntry(addr).subscribe(entry => {
//       // don't resolve when entry not found
//       entry &&
//         resolve({
//           entryAddress: entry[0],
//           name: entry[1],
//           entryType: entry[2],
//         })
//     })
//   })
// }
