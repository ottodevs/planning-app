import { useState, useEffect } from 'react'
import Aragon, { providers } from '@aragon/client'

import { useMsgHandler } from './'
import { sendMessageToWrapper } from '../utils'

export const useAragonWrapper = () => {
  const [aragonApp, setAragonApp] = useState()
  const [windowProvider] = useState(new providers.WindowMessage(window.parent))
  const [aragonClient] = useState(new Aragon(windowProvider))

  const isReady = useMsgHandler()

  const wrapperConnectionEffect = () => {
    if (isReady) {
      sendMessageToWrapper('ready', true)
      setAragonApp(aragonClient)
    }
  }

  useEffect(wrapperConnectionEffect, [isReady])

  return aragonApp
}
