import PropTypes from 'prop-types'
import React, { useCallback, useMemo, } from 'react'
import { AragonApi, usePath } from '@aragon/api-react'
import appStateReducer from './app-state-reducer'
// import { fromPath } from './utils/path-utils'

const PATH_REGEX = /^\/(settings|issues)(?:\/([a-zA-Z0-9]{23})(?:\/(application|work)(?:\/([0-9]+)))?)?(?:\/)?$/
const TABS = [ 'overview', 'issues', 'settings' ]

// Get the tab currently selected, or null otherwise (which will load overview then)
export const usePathSegments = () => {
  const [ path, requestPath ] = usePath()
  // const [ , , issueId, panel, submissionId ] = path.match(PATH_REGEX) || []
  // const [ , tab, issueId ] = path.match(PATH_REGEX) || []

  const fromPath = useMemo(() => {
    const [ , tab, issueId, panel, submissionId ] = path.match(PATH_REGEX) || []

    const pathSegments = {
      selectedTab: tab ? TABS.indexOf(tab) : 0,
      selectedIssueId: tab === 'issues' && issueId ? issueId + '=' : null,
      selectedPanel: (panel && submissionId) ? 'Review' + panel[0].toUpperCase() + panel.substr(1) : null,
      selectedSubmissionId: (tab === 'issues' && panel && submissionId) || null
    }

    return pathSegments
  }, [path])

  // // The memoized tab currently selected
  // const selectedTab = useMemo(() => {
  //   console.log('new path:', tab)
  //   // When possible, redirect to overview in case the path does not exist
  //   !tab && requestPath && requestPath('')
  //   // TODO: select 404 view in case
  //   return 
  // }, [tab])

  const selectTab = useCallback(
    tabIndex => {
      const tab = TABS[tabIndex]
      console.log('[selectTab]', tabIndex, tab)
      // For consistency "/overview/"" path will be transformed to root "/" path
      requestPath((!tabIndex || tabIndex < 1) ? '' : `/${tab}`)
    },
    [requestPath]
  )

  // // The memoized issue currently selected
  // const selectedIssue = useMemo(() => {
  //   // TODO: Handle signed status / ready state
  //   // A `ready` check would prevent the issue to be
  //   // selected until the app state is fully ready.      
  //   // TODO: Check why issues is not populated here (probably here it is issues from the contract, we need from the FE state)
  //   // So issues.find is never finding a match
  //   // TODO: Proper error when issue id in the path matches regex but does not exist
  //   console.log('[selectIssue] received issueId', issueId, tab)
  
  //   // We add the equal char here to the issue to avoid %3D escaped equal character in the URL (probably coming from aragon.js)
  //   return 
  // }, [ issueId, tab ])


  const selectIssue = useCallback(
    issueId => {
      // The trailing equal char is sliced to avoid being escaped into ugly %3D in the url
      requestPath(!issueId ? '/issues' : `/issues/${issueId.slice(0, -1)}`)
    },
    [requestPath]
  )

  const selectPanel = () => {}

  return { fromPath, selectIssue, selectPanel, selectTab }
}

// Handles the main logic of the app.
export const useAppLogic = issues => {
  return usePathSegments(issues)
}

export const AppLogicProvider = ({ children }) => {
  return <AragonApi reducer={appStateReducer}>{children}</AragonApi>
}

AppLogicProvider.propTypes = {
  children: PropTypes.node.isRequired,
}