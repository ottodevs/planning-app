import React, { Suspense, useState } from 'react'
import styled from 'styled-components'

import { AppBar as AragonBar, BreakPoint, NavigationBar } from '@aragon/ui'
import MenuButton from './MenuButton'
import { useContractState } from '../../hooks'

const ResponsiveNavigation = ({ onMenu, ...navProps }) => {
  return (
    <React.Fragment>
      <BreakPoint to="medium">
        <AppBarTitle>
          <MenuButton onClick={onMenu} />
          <NavigationBar {...navProps} />
        </AppBarTitle>
      </BreakPoint>
      <BreakPoint from="medium">
        <NavigationBar {...navProps} />
      </BreakPoint>
    </React.Fragment>
  )
}

const AppBar = () => {
  const navItems = ['Projects', 'Issue Detail']
  const [currentItems, setCurrentItems] = useState([navItems[0]])
  const handleMenuClick = () => {
    setCurrentItems(navItems)
  }
  const handleBackClick = () => {
    setCurrentItems([navItems[0]])
  }

  const navProps = {
    items: currentItems,
    onMenu: handleMenuClick,
    onBack: handleBackClick,
  }
  return (
    <AragonBar
      // TODO: responsive button
      //   endContent={
      //     <ResponsiveButton
      //       title="New Project"
      //       onClick={this.createNewProject}
      //       disabled={false}
      //     />
      //   }
      style={currentItems.length === 1 ? { borderBottom: 'none' } : {}}
    >
      <ResponsiveNavigation {...navProps} />
    </AragonBar>
  )
}

const AppBarTitle = styled.span`
  display: flex;
  align-items: center;
`

export default AppBar
