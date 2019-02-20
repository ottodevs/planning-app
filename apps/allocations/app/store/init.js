import addressBookAbi from '../../../shared/abi/address-book'
import { app, handleEvent } from './'

export const initStore = addressBookAddress => {
  const addressBookApp = app.external(addressBookAddress, addressBookAbi)
  // console.log('addressBook', addressBookApp)

  const initialState = {
    accounts: [],
    entries: [],
    addressBook: addressBookAddress,
  }

  return app.store(
    async (state = initialState, event) => {
      try {
        const next = await handleEvent(state, event)
        const nextState = { ...initialState, ...next }
        // console.log('[Allocations store]', nextState)
        return nextState
      } catch (err) {
        console.error('[Allocations script] initStore', event, err)
      }
      // always return the state even unmodified
      console.log('returning state:', state)

      return state
    },
    [
      // handle address book events
      addressBookApp.events(),
    ]
  )
}
