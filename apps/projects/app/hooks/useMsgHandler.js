import { useState, useEffect } from 'react'

export const useMsgHandler = () => {
  const [ready, setReady] = useState(false)
  const handleWrapperMessage = ({ data }) => {
    if (data.from !== 'wrapper') {
      return
    }
    if (data.name === 'ready') {
      // console.log('[useMessageHandle] message ready from wrapper', data)
      setReady(true)
    }
  }
  useEffect(
    () => {
      // console.log('[msgHandler] up', ready)
      window.addEventListener('message', handleWrapperMessage)
      return () => {
        // cleanup
        // console.log('[msgHandler] down', ready)
        window.removeEventListener('message', handleWrapperMessage)
      }
    },
    [ready]
  )

  return ready
}
