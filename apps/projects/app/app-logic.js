import PropTypes from 'prop-types'
import React, { useCallback, useMemo, } from 'react'
import { AragonApi, usePath } from '@aragon/api-react'
import appStateReducer from './app-state-reducer'

// const ISSUE_ID_PATH_RE = /^\/issue\/(?:[a-z0-9]{23}=\/?)$/i
const ISSUE_ID_PATH_RE = /^\/issue\/([a-z0-9]{23}=)\/?$/i
const NO_ISSUE_ID = '-1'

const issueIdFromPath = path => {
  if (!path) {
    return NO_ISSUE_ID
  }
  const matches = path.match(ISSUE_ID_PATH_RE)
  
  return matches ? matches[1] : NO_ISSUE_ID
}

// Get the issue currently selected, or null otherwise.
export const useSelectedIssue = issues => {
  const [ path, requestPath ] = usePath()

  // The memoized issue currently selected
  const selectedIssue = useMemo(() => {
    const issueId = issueIdFromPath(path)

    // The `ready` check prevents the issue to be
    // selected until the app state is fully ready.
    // TODO: Handle signed status / ready state
    if (issueId === NO_ISSUE_ID) {
      return null
    }

    return issueId || null // issues.find(issue => issue.id === issueId) || null
  }, [ path, issues ])

  const selectIssue = useCallback(
    issueId => {
      requestPath(String(issueId) === NO_ISSUE_ID ? '' : `/issue/${issueId}/`)
    },
    [requestPath]
  )

  return [ selectedIssue, selectIssue ]
}

// Handles the main logic of the app.
export const useAppLogic = issues => {
  const [ selectedIssue, selectIssue ] = useSelectedIssue(issues)

  return {
    selectedIssue,
    selectIssue,
  }
}

export const AppLogicProvider = ({ children }) => {
  return <AragonApi reducer={appStateReducer}>{children}</AragonApi>
}

AppLogicProvider.propTypes = {
  children: PropTypes.node.isRequired,
}