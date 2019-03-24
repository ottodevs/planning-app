import '@babel/polyfill'

import { retryEvery } from '../../../shared/ui/utils'
import { app, initStore } from './store'

retryEvery(async retry => {
  // get deployed address book address from contract
  const addressBookAddress = await app
    .call('addressBook')
    .first()
    .toPromise()

  initStore(addressBookAddress).catch((/*error*/) => {
    // console.error('[Allocations] worker failed', error)
    retry()
  })
})
