import PropTypes from 'prop-types'
import React from 'react'

import { TabbedView, TabBar, TabContent, Tab } from '../TabbedView'
import { Issues, Overview, Settings } from '../Content'
import AppTitleButton from '../App/AppTitleButton'

// TODO: improve structure:
/*
  contentData = [
    {
      title, // merge with screen -> add name to the components
      screen,
      button: { title, actions: [] },
      panel: { content, title },
      empty: { title, text, icon, button: { action, title } }
    }
  ]
*/

// TODO: Dynamic component loading
const AppContent = ({
  activeIndex,
  changeActiveIndex,
  onNewIssue,
  onNewProject,
  ...otherProps
}) => {
  const contentData = [
    {
      tabName: 'Overview',
      TabComponent: Overview,
      tabButton: { caption: 'New Project', onClick: onNewProject },
    },
    {
      tabName: 'Issues',
      TabComponent: Issues,
      tabButton: { caption: 'New Issue', onClick: onNewIssue },
    },
    {
      tabName: 'Settings',
      TabComponent: Settings,
    },
  ]

  var appTitleButton = contentData[activeIndex].tabButton
    ? contentData[activeIndex].tabButton
    : null

  return (
    <React.Fragment>
      {appTitleButton && (
        <AppTitleButton
          caption={appTitleButton.caption}
          onClick={appTitleButton.onClick}
        />
      )}

      <TabbedView
        activeIndex={activeIndex}
        changeActiveIndex={changeActiveIndex}
      >
        <TabBar>
          {contentData.map(({ tabName }) => (
            <Tab key={tabName}>{tabName}</Tab>
          ))}
        </TabBar>
        <TabContent>
          {contentData.map(({ TabComponent }) => (
            <TabComponent key={TabComponent} {...otherProps} />
          ))}
        </TabContent>
      </TabbedView>
    </React.Fragment>
  )
}

AppContent.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  changeActiveIndex: PropTypes.func.isRequired,
  onNewIssue: PropTypes.func.isRequired,
  onNewProject: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AppContent
