import { useState, useEffect } from 'react'

export const useAccount = aragonApp => {
  const [userAccount, setUserAccount] = useState({})

  useEffect(() => {
    const subscription = aragonApp.accounts().subscribe(accounts => {
      console.log('[useAccount] received', accounts[0])

      setUserAccount(accounts[0])
      return () => {
        // cleanup
        console.log('account subscription down')
        subscription.unsubscribe()
      }
    }, userAccount)
  })

  return userAccount
}
