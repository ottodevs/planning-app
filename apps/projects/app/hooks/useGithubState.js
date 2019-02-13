import { useState, useEffect } from 'react'

export const useGithubState = aragonApp => {
  const [github, setGithub] = useState({ token: null })

  useEffect(
    () => {
      const subscription = aragonApp.rpc
        .sendAndObserveResponses('cache', ['get', 'github'])
        .pluck('result')
        .subscribe(nextGithub => {
          console.log('[useGithubState] received', nextGithub)
          setGithub(nextGithub)
          return () => {
            // cleanup
            console.log('github subscription down')
            subscription.unsubscribe()
          }
        })
    }
    // [github.status]
  )
  return github
}
