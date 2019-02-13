import React from 'react'
import { render } from 'react-dom'

import { StoreProvider } from './store/useStore'
import { AragonStyles } from './components/ui-shared'
import { Nav, Content, Panel } from './components/layout'
import { usePlanningApp } from './hooks'

const App = () => {
  usePlanningApp()
  return (
    <AragonStyles>
      <StoreProvider>
        <Nav />
        <Content />
        <Panel />
      </StoreProvider>
    </AragonStyles>
  )
}

render(<App />, document.querySelector('#projects'))
