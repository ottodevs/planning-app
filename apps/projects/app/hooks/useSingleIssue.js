import { useEffect, useState } from 'react'
import { useAragonApi } from '../api-react'
import { initApolloClient } from '../utils/apollo-client'
import { GET_ISSUE_NUMBER } from '../utils/gql-queries'

const useSingleIssue = (selectedSubmissionId) => {
  const { appState } = useAragonApi()
  const token = appState.github && appState.github.token

  const [ singleIssue, setSingleIssue ] = useState()

  useEffect(() => {
    if (!token) return

    initApolloClient(token)
      .query({ query: GET_ISSUE_NUMBER, variables: { id: selectedSubmissionId } })
      .then(res => {
        setSingleIssue(res.data.node)
      }
      )
  }, [token])

  return singleIssue
}

export default useSingleIssue
