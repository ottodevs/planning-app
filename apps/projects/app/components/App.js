import React, { useEffect } from 'react'

import AragonStyles from './AragonStyles'
import { AppBar, Content } from './layout'
import { getURLParam } from '../utils/github-auth'
import {
  useAragonWrapper,
  useGithubAuthorization,
  useContractState,
} from '../hooks'

function App() {
  const parcelReloadEffect = () => {
    // If using Parcel, reload instead of using HMR.
    // HMR makes the app disconnect from the wrapper and the state is empty until a reload
    // See: https://github.com/parcel-bundler/parcel/issues/289
    if (module.hot) {
      module.hot.dispose(() => {
        window.location.reload()
      })
    }
  }
  const getParamEffect = () => {
    /**
     * Acting as the redirect target it looks up for 'code' URL param on component mount
     * if it detects the code then sends to the opener window
     * via postMessage with 'popup' as origin and close the window (usually a popup)
     */
    const code = getURLParam('code')
    if (code) {
      window.opener.postMessage(
        { from: 'popup', name: 'code', value: code },
        '*'
      )
      window.close()
    }
  }

  useEffect(parcelReloadEffect)
  useEffect(getParamEffect)

  const aragonApp = useAragonWrapper()
  const authProps = useGithubAuthorization(aragonApp)
  const contractState = useContractState(aragonApp)

  console.log('authPops', authProps)
  console.log('contractState', contractState)

  return (
    <AragonStyles>
      <AppBar />
      <Content {...authProps} />
    </AragonStyles>
  )
}

export default App
