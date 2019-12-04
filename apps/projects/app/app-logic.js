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

  const selectTab = useCallback(
    tabIndex => {
      const tab = TABS[tabIndex]
      requestPath((!tabIndex || tabIndex < 1) ? '' : `/${tab}`)
    },
    [requestPath]
  )
    
  const selectIssue = useCallback(
    issueId => {
      // The trailing equal char is sliced to avoid being escaped into ugly %3D in the url
      requestPath(!issueId ? '/issues' : `/issues/${issueId.slice(0, -1)}`)
    },
    [requestPath]
  )

  // TODO: Implement this
  const selectPanel = () => {}

  return { fromPath, selectIssue, selectPanel, selectTab }
}

// TODO: Add path helper
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