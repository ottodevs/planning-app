import React, { Suspense, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ErrorBoundary, Loading, Screen, Unauthorized } from '../screens'
// import { TabbedView } from '../../temp/app/components/TabbedView'
// import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks'

// import Screen from '../../temp/app/components/App/Screen'
// import IssueDetail from '../../temp/app/components/Content/IssueDetail'
// import { AppContent } from '../../temp/app/components/App/AppContent'

const Content = ({ isAuthorized, handleLogin }) => {
  // const [currentScreen, setCurrentScreen] = useState('overview')
  // const [animateScreens, setAnimateScreens] = useState(false)

  // useEffect(() => {
  //   setTimeout(() => {
  //     // setAnimateScreens(true)
  //   }, 0)
  // })

  console.log('authorization:', isAuthorized)
  return (
    <Suspense fallback={<Loading />}>
      {isAuthorized ? <ContentView /> : <Unauthorized onLogin={handleLogin} />}
    </Suspense>
  )
}

const ContentView = () => {
  return (
    <ErrorBoundary>
      {/* <ApolloProviderHooks client={apolloClient}> */}
      <Wrap>
        <Screen position={0}>
          <div>Hello</div>
          {/* {location.screen === 'overview' && <div>Helloo contnet</div>} */}
        </Screen>
        {/* <Screen position={1} animate={animateScreens}> */}
        <div>Hososie pos 1</div>
        {/* {location.screen === 'issue-detail' && <div>Issue details</div>} */}
        {/* </Screen> */}
      </Wrap>
      {/* </ApolloProviderHooks> */}
    </ErrorBoundary>
  )
}
// {/* <IssueDetail issue={this.state.issue} /> */}

const Wrap = styled.div`
  padding: 0;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  /* top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  min-width: 320px; */
`

export default Content
