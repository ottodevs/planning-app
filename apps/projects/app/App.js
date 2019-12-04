import React, { useEffect, useState } from 'react'
import { ApolloProvider } from 'react-apollo'

import { useAragonApi } from './api-react'
import { AppLogicProvider, useAppLogic } from './app-logic'
import {
  Bar,
  Button,
  BackButton,
  Header,
  IconPlus,
  Main,
  Tabs,
} from '@aragon/ui'

import ErrorBoundary from './components/App/ErrorBoundary'
import { Issues, Overview, Settings } from './components/Content'
import IssueDetail from './components/Content/IssueDetail'
import { PanelManager, PanelContext, usePanelManagement } from './components/Panel'

import { IdentityProvider } from '../../../shared/identity'
import {
  REQUESTED_GITHUB_TOKEN_SUCCESS,
  REQUESTED_GITHUB_TOKEN_FAILURE,
} from './store/eventTypes'

import { initApolloClient } from './utils/apollo-client'
import { getToken, getURLParam, githubPopup, STATUS } from './utils/github'
import Unauthorized from './components/Content/Unauthorized'
import { LoadingAnimation } from './components/Shared'
import { EmptyWrapper } from './components/Shared'
import { Error } from './components/Card'
import { DecoratedReposProvider } from './context/DecoratedRepos'

const App = () => {
  const { api, appState } = useAragonApi()
  const [ tabData, setTabData ] = useState({})
  const [ githubLoading, setGithubLoading ] = useState(false)
  const [ panel, setPanel ] = useState(null)
  const [ panelProps, setPanelProps ] = useState(null)
  const [ popupRef, setPopupRef ] = useState(null)

  const {
    repos = [],
    bountySettings = {},
    issues = [],
    tokens = [],
    github = { status : STATUS.INITIAL },
    isSyncing = true,
  } = appState

  const { fromPath: { selectedIssue, selectedPanel, selectedSubmissionId, selectedTab }, selectIssue, selectTab } = useAppLogic(issues)
  const client = github.token ? initApolloClient(github.token) : null

  useEffect(() => {
    const code = getURLParam('code')
    code &&
      window.opener.postMessage(
        { from: 'popup', name: 'code', value: code },
        '*'
      )
    window.close()
  })

  const handlePopupMessage = async message => {
    if (message.data.from !== 'popup') return
    if (message.data.name === 'code') {
      // TODO: Optimize the listeners lifecycle, ie: remove on unmount
      window.removeEventListener('message', handlePopupMessage)

      const code = message.data.value
      try {
        const token = await getToken(code)
        setGithubLoading(false)
        api.emitTrigger(REQUESTED_GITHUB_TOKEN_SUCCESS, {
          status: STATUS.AUTHENTICATED,
          token
        })

      } catch (err) {
        setGithubLoading(false)
        api.emitTrigger(REQUESTED_GITHUB_TOKEN_FAILURE, {
          status: STATUS.FAILED,
          token: null,
        })
      }
    }
  }

  const closePanel = () => {
    setPanel(null)
    setPanelProps(null)
  }

  const configurePanel = {
    setActivePanel: p => setPanel(p),
    setPanelProps: p => setPanelProps(p),
  }

  const handleGithubSignIn = () => {
    // The popup is launched, its ref is checked and saved in the state in one step
    setGithubLoading(true)

    setPopupRef(githubPopup(popupRef))

    // Listen for the github redirection with the auth-code encoded as url param
    window.addEventListener('message', handlePopupMessage)
  }

  const handleTabSelection = data => {
    // When a project card is clicked, data is passed to the issues view
    if (typeof data === 'object') {
      selectTab(data.tabIndex)
      setTabData(data.tabData)
    } else {
      // When a section is clicked on the TabBar no data is passed
      selectTab(data)
    }
  }

  const handleResolveLocalIdentity = address => {
    return api.resolveAddressIdentity(address).toPromise()
  }

  const handleShowLocalIdentityModal = address => {
    return api
      .requestAddressIdentityModification(address)
      .toPromise()
  }

  const noop = () => {}
  if (githubLoading) {
    return (
      <EmptyWrapper>
        <LoadingAnimation />
      </EmptyWrapper>
    )
  } else if (github.status === STATUS.INITIAL) {
    return (
      <Main>
        <Unauthorized onLogin={handleGithubSignIn} isSyncing={isSyncing} />
      </Main>
    )
  } else if (github.status === STATUS.FAILED) {
    return (
      <Main>
        <Error action={noop} />
      </Main>
    )
  }

  // Tabs are not fixed
  const tabs = [{ name: 'Overview', body: Overview }]
  // TODO: This is failing a lot, repos.length is empty every time the page is refreshed from the browser button
  if (repos.length)
    tabs.push({ name: 'Issues', body: Issues })
  tabs.push({ name: 'Settings', body: Settings })

  // Determine current tab details
  const TabComponent = tabs[selectedTab].body
  const TabAction = () => {
    const { setupNewIssue, setupNewProject } = usePanelManagement()

    switch (tabs[selectedTab].name) {
    case 'Overview': return (
      <Button mode="strong" icon={<IconPlus />} onClick={setupNewProject} label="New Project" />
    )
    case 'Issues': return (
      <Button mode="strong" icon={<IconPlus />} onClick={setupNewIssue} label="New Issue" />
    )
    default: return null
    }
  }

  return (
    <ApolloProvider client={client}>
      <PanelContext.Provider value={configurePanel}>
        <IdentityProvider
          onResolve={handleResolveLocalIdentity}
          onShowLocalIdentityModal={handleShowLocalIdentityModal}
        >
          <DecoratedReposProvider>
            <Header
              primary="Projects"
              secondary={
                <TabAction />
              }
            />
            <ErrorBoundary>

              {selectedIssue
                ? (
                  <React.Fragment>
                    <Bar>
                      <BackButton onClick={() => selectIssue(null)} />
                    </Bar>
                    <IssueDetail issueId={selectedIssue} />
                  </React.Fragment>
                )
                : (
                  <React.Fragment>
                    <Tabs
                      items={tabs.map(t => t.name)}
                      onChange={handleTabSelection}
                      selected={selectedTab}
                    />
                    <TabComponent
                      app={api}
                      bountyIssues={issues}
                      bountySettings={bountySettings}
                      onProjectClick={handleTabSelection}
                      onLogin={handleGithubSignIn}
                      setSelectedIssue={selectIssue}
                      status={github.status}
                      tabData={tabData}
                      tokens={tokens}
                    />
                  </React.Fragment>
                )
              }
            </ErrorBoundary>
            <PanelManager
              activePanel={panel}
              onClose={closePanel}
              {...panelProps}
            />
          </DecoratedReposProvider>
        </IdentityProvider>
      </PanelContext.Provider>
    </ApolloProvider>
  )
}

const Projects = () =>
  <Main>
    <AppLogicProvider>
      <App />
    </AppLogicProvider>
  </Main>

export default Projects