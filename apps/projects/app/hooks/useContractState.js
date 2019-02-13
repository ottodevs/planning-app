import { useState, useEffect } from 'react'

const initialState = {
  repos: [],
  bountySettings: {},
}

export const useContractState = aragonApp => {
  const [contractState, setContractState] = useState(initialState)

  const contractSubscriptionEffect = () => {
    if (Boolean(aragonApp)) {
      aragonApp.state().subscribe(nextState => {
        // console.log('new state received', nextState)
        setContractState(nextState)
      })
    }
  }

  useEffect(contractSubscriptionEffect, [aragonApp])

  return contractState
}
