import { AragonApp, observe, SidePanel, Text } from '@aragon/ui'
// import Aragon, { providers } from '@aragon/client'
import PropTypes from 'prop-types'
import React from 'react'
import { hot } from 'react-hot-loader'
import styled from 'styled-components'
import { useRedirectHandler } from '../../hooks'
import { AppContent } from '.'
import { Title } from '../Shared'
import { NewProject } from '../Panel'

const ASSETS_URL = 'aragon-ui-assets/'

const REDIRECT_URI = 'http://localhost:3333'

class App extends React.Component {
  static propTypes = {
    // app: PropTypes.object.isRequired,
    // repos: PropTypes.arrayOf(PropTypes.object),
    // TODO: Just expose a boolean when GraphQl client is ready (User Signed In == true)
    // token: PropTypes.string,
  }

  state = {
    panel: {
      visible: false,
    },
    // TODO: Don't use this in production
    // reposManaged: projectsMockData(),
  }

  changeActiveIndex = activeIndex => {
    this.setState({ activeIndex })
  }

  selectProject = () => {
    console.log('selectProject')
  }

  createProject = () => {
    console.info('App.js: createProject')
    this.closePanel()
    this.setState({})
    console.log('projects props:', this.props)
    // console.log('hex:', window.web3.toHex('MDEyOk9yZ2FuaXphdGlvbjM0MDE4MzU5'))

    // this.props.app.addRepo(this.props.userAccount, '0x012026678901')
    // this.props.app.addRepo(
    //   web3.toHex('MDQ6VXNlcjUwMzAwNTk='),
    //   web3.toHex('MDEwOlJlcG9zaXRvcnkxNDkxMzQ4NTk=')
    // )
  }

  githubSignIn = () => {
    const popup = githubPopup(this.state.popup)
    this.setState({ popup: popup })
    console.log('github')
  }

  newIssue = () => {
    console.log('newIssue')
  }

  newProject = () => {
    // const cche = this.props.app.cache('state', { token: 'something' })
    // console.log(
    //   '[projects->app.js->newProject()]: token stored, response:',
    //   cche
    // )
    // this.props.app.rpc.send('cache', ['set', 'github', { token: 'sometokee' }])
    // this.props.app.cache('state', { token: Math.random().toString() })
    // this.props.app.addToken()
    // this.props.app.notify('hello', 'title')

    this.setState((_, props) => ({
      panel: {
        visible: true,
        content: NewProject,
        data: {
          heading: 'New Project',
          // onCreateProject: this.createProject,
          handleSignIn: this.githubSignIn,
          // githubToken: props.token,
        },
      },
    }))
  }

  closePanel = () => {
    this.setState({ panel: { visible: false } })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
    // return (
    //   nextState.panel !== this.state.panel ||
    //   nextProps.repos !== this.props.repos ||
    //   nextProps.token !== this.props.token
    // )
  }

  render() {
    const { panel } = this.state
    const PanelContent = panel.content

    console.log('app state and props', this.state, this.props)

    return (
      <StyledAragonApp>
        <Title text="Projects" shadow />
        {/* <ObservedRepos observable={this.props.observable} /> */}
        <AppContent
          app={this.props.app}
          projects={this.props.repos !== undefined ? this.props.repos : []}
          onNewProject={this.newProject}
          onNewIssue={this.newIssue}
          onSelect={this.selectProject}
          activeIndex={this.state.activeIndex}
          changeActiveIndex={this.changeActiveIndex}
        />
        <SidePanel
          title={(panel.data && panel.data.heading) || ''}
          opened={panel.visible}
          onClose={this.closePanel}
        >
          {panel.content && <PanelContent {...panel.data} />}
        </SidePanel>
      </StyledAragonApp>
    )
  }
}

// const ObservedRepos = observe(state$ => state$, {})(state => {
//   console.log('new token received!', state)

//   return <Text>{state.token}</Text>
// })

const StyledAragonApp = styled(AragonApp).attrs({
  publicUrl: ASSETS_URL,
})`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`
// export default observe(
//   observable => observable.map(state => ({ ...state })),
//   {}
// )(hot(module)(useRedirectHandler(App)))

export default useRedirectHandler(App)
