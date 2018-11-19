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

export default class AppContent extends React.Component {
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    onNewProject: PropTypes.func.isRequired,
    onNewIssue: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    activeIndex: PropTypes.number,
    changeActiveIndex: PropTypes.func.isRequired,
  }

  static defaultProps = {
    activeIndex: 0,
  }

  render() {
    const contentData = [
      {
        tabName: 'Overview',
        TabComponent: Overview,
        tabButton: { caption: 'New Project', onClick: this.props.onNewProject },
      },
      {
        tabName: 'Issues',
        TabComponent: Issues,
        tabButton: { caption: 'New Issue', onClick: this.props.onNewIssue },
      },
      {
        tabName: 'Settings',
        TabComponent: Settings,
      },
    ]
    const appTitleButton = contentData[this.props.activeIndex].tabButton || null
    return (
      <React.Fragment>
        {appTitleButton && (
          <AppTitleButton
            caption={appTitleButton.caption}
            onClick={appTitleButton.onClick}
          />
        )}

        <TabbedView
          activeIndex={this.props.activeIndex}
          changeActiveIndex={this.props.changeActiveIndex}
        >
          <TabBar>
            {contentData.map(({ tabName }) => (
              <Tab key={tabName}>{tabName}</Tab>
            ))}
          </TabBar>
          <TabContent>
            {contentData.map(({ TabComponent }) => (
              <TabComponent key={TabComponent} {...this.props} />
            ))}
          </TabContent>
        </TabbedView>
      </React.Fragment>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}
