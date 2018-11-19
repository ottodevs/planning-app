import React from 'react'
import Aragon, { providers } from '@aragon/client'
import { compose, lifecycle, withHandlers, withState } from 'recompose'

import { githubPopup } from '../utils/github-oauth'

export {
  initPerformanceProfiler,
  newAragonAppInstance,
  handleWrapperMessage,
  handlePopupMessage,
  useGithub,
  useRedirectHandler,
  useMessageListener,
  useHMRDisabler,
}

/***********************
 *                     *
 *   Helpers           *
 *                     *
 ***********************/

const initPerformanceProfiler = () => {
  if (process.env.NODE_ENV !== 'production') {
    const { whyDidYouUpdate } = require('why-did-you-update')
    whyDidYouUpdate(React)
  }
}

const newAragonAppInstance = () =>
  new Aragon(new providers.WindowMessage(window.parent))

const getURLParam = param => {
  const searchParam = new URLSearchParams(window.location.search)
  return searchParam.get(param)
}

const handleWrapperMessage = (trigger, action) => message => {
  if (message.data.from !== 'wrapper') return
  if (message.data.name === trigger) {
    action()
  }
  // const { app } = this.state
  // this.setState({
  //   observable: app.state(),
  // })
  // app.accounts().subscribe(accounts => {
  //   this.setState({
  //     userAccount: accounts[0],
  //   })
  // })
  // app.state().subscribe(state => {
  //   console.log('state received:', state)
  // })
  // this.sendMessageToWrapper('ready', true)
}

const handlePopupMessage = message => {
  console.log('handlePopup, message received:', message)

  // console.log('handlePopupMessage:', message.data.name, message.data.value)
}

/**
 * Sends a message over window.postMessage
 * with some customizations
 *
 * @param {string} sender Name of the sender, like: 'app' or 'popup'
 * @param {Object} entry A single key value pair of data to be sent
 *
 * @return {void}
 */
const sendMessage = (sender, entry) => {
  const origin = sender === 'popup' ? window.parent : window
  Object.entries(entry).map(([name, value]) =>
    origin.postMessage({ from: sender, name, value }, '*')
  )
}

/**
 * Looks up for 'code' URL param on component mount
 * if it detects the code then sends to the opener window
 * via postMessage with 'popup' as origin and close the window (usually a popup)
 *
 * @return {void}
 */
const useRedirectHandler = lifecycle({
  componentDidMount() {
    const code = getURLParam('code')
    code &&
      window.opener.postMessage(
        { from: 'popup', name: 'code', value: code },
        '*'
      )
    window.close()
  },
})

/**
 * Attaches a listener for the 'message' event on component mount
 * and removes it when the component gets unmount
 *
 * @param {function} messageHandler A handler function that will receive the message
 *
 * @return {void}
 */
const useMessageListener = messageHandler =>
  lifecycle({
    componentDidMount() {
      console.log('adding messageListener')
      window.addEventListener('message', messageHandler)
    },
    componentWillUnmount() {
      console.log('removing messageListener')
      window.removeEventListener('message', messageHandler)
    },
  })

/**
 * Opens a popup and maintains a ref to it
 */
const usePopup = popupFn =>
  compose(
    withState('popup', 'setPopup', null),
    withHandlers({
      openPopup: ({ setPopup }) => () => setPopup(popupFn),
    })
  )

const useSignIn = withHandlers({
  handleSignIn: ({ openPopup }) => openPopup,
})

const useGithub = compose(
  usePopup(githubPopup),
  // TODO: optimization: should better call a handler in the root component to listen for message of this origin
  useMessageListener(handlePopupMessage)
  //   useSignIn
)

/**
 * If using Parcel, reload instead of using HMR. HMR makes the app
 * disconnect from the wrapper and the state is empty until a reload.
 * See: https://github.com/parcel-bundler/parcel/issues/289
 */

const useHMRDisabler = () => {
  lifecycle({
    componentDidMount() {
      if (module.hot) {
        module.hot.dispose(() => {
          window.location.reload()
        })
      }
    },
  })
}
