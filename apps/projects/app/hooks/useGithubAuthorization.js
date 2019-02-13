import { useState, useEffect } from 'react'
import { githubPopup, getToken, STATUS } from '../utils/github-auth'

export const useGithubAuthorization = aragonApp => {
  const [github, setGithub] = useState({ token: null, status: '' })
  const [popup, setPopup] = useState(null)
  const [authorized, setAuthorized] = useState(true)

  // TODO: effect
  const handlePopupMessage = async message => {
    if (message.data.from !== 'popup') return
    if (message.data.name === 'code') {
      // TODO: Optimize the listeners lifecycle, ie: remove on unmount
      console.log('removing messageListener')
      window.removeEventListener('message', this)

      const code = message.data.value
      console.log('AuthCode received from github:', code)
      console.log('Proceeding to token request...')
      // TODO: Check token received correctly
      const token = await getToken(code)
      console.log('token obtained:', token)
      const github = {
        status: STATUS.AUTHENTICATED,
        token: token,
      }
      aragonApp.cache('github', github)
      setAuthorized(true)
      setGithub(github)
    }
  }

  const handleLogin = () => {
    setPopup(githubPopup(popup))
    console.log('adding messageListener for code')
    window.addEventListener('message', handlePopupMessage)
  }

  const githubSubscriptionEffect = () => {
    if (Boolean(aragonApp)) {
      aragonApp.rpc
        .sendAndObserveResponses('cache', ['get', 'github'])
        .pluck('result')
        .subscribe(nextGithub => {
          setGithub(nextGithub)
          setAuthorized(Boolean(nextGithub.token))
        })
    }
  }

  useEffect(githubSubscriptionEffect, [aragonApp])

  return { isAuthorized: authorized, handleLogin, github }
}
