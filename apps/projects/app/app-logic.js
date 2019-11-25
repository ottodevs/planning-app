import PropTypes from 'prop-types'
import React, { useCallback, useMemo, } from 'react'
import { AragonApi, usePath } from '@aragon/api-react'
import appStateReducer from './app-state-reducer'
import { fromPath } from './utils/path-utils'

const TABS = [ 'overview', 'issues', 'settings' ]

// Get the tab currently selected, or null otherwise (which will load overview then)
export const useSelectedTab = () => {
  const [ path, requestPath ] = usePath()

  // The memoized tab currently selected
  const selectedTab = useMemo(() => {
    const { tab } = fromPath(path)

    if (!tab) {
      return 0
    }

    return TABS.findIndex(tab)
  }, [path])

  const selectTab = useCallback(
    tabIndex => {
      const tab = TABS[tabIndex]
      console.log('trying to select tab', tabIndex, tab)
      requestPath(!tab ? '' : `/${tab}/`)
    },
    [requestPath]
  )

  return { selectedTab, selectTab }
}

// Get the issue currently selected, or null otherwise.
export const useSelectedIssue = issues => {
  const [ path, requestPath ] = usePath()

  // The memoized issue currently selected
  const selectedIssue = useMemo(() => {
    const { issueId } = fromPath(path)

    // TODO: Handle signed status / ready state
    // A `ready` check prevents the issue to be
    // selected until the app state is fully ready.
    if (!issueId) {
      return null
    }
    
    // TODO: Check why issues is not populated here (probably here it is issues from the contract, we need from the FE state)
    // So issues.find is never finding a match
    // We add the equal char here to the issue to avoid %3D escaped equal character in the URL (probably coming from aragon.js)
    // TODO: Proper error when issue id in the path matches regex but does not exist
    return issueId + '=' // issues.find(issue => issue.id === `${issueId}`) || null
  }, [ path, issues ])

  const selectIssue = useCallback(
    issueId => {
      // The trailing equal char is sliced to avoid being escaped into ugly %3D in the url
      requestPath(!issueId ? '' : `/issue/${issueId.slice(0, -1)}/`)
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