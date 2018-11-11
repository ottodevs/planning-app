import { AragonApp, observe, SidePanel } from '@aragon/ui'
import PropTypes from 'prop-types'
import React from 'react'

import styled from 'styled-components'

import { AppContent } from '.'
import { Title } from '../Shared'
// import { NewProject } from '../Panel'

const ASSETS_URL = 'aragon-ui-assets/'
const TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token'
const AUTH_ENDPOINT = 'https://api.github.com/authorizations/clients'
const REDIRECT_URI = 'http://localhost:3333/'

const GITHUB_API_V3_URL = ''

const generateGuid = () => {
  const chars = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789']
  return [...Array(24)].map(i => chars[(Math.random() * chars.length) | 0])
    .join``
}

const getGithubCode = async () => {
  // console.log('getgithubCode entered')
  // const data = fetch(`${AUTH_ENDPOINT}/:${GITHUB_CLIENT_ID}`, {
  // const data = fetch(`http://localhost:9999/authenticate/${code}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'User-Agent': 'That Planning Suite',
  //     Accept: 'application/vnd.github.v3+json',
  //   },
  // body: JSON.stringify({
  //   client_id: GITHUB_CLIENT_ID,
  //   client_secret: GITHUB_CLIENT_SECRET,
  //   note: 'testing',
  // }),
  // }).then(response => response.json())
  // if (data.error) {
  //   throw new Error(JSON.stringify(data.error))
  // }
  // console.log('reccibi', data)
}

const getGithubToken = async githubCode => {
  const data = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    params: JSON.stringify({
      // client_id: process.env.GITHUB_CLIENT_ID,
      // client_secret: process.env.GITHUB_CLIENT_SECRET,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: githubCode,
    }),
  }).then(response => response.json())

  if (data.error) {
    throw new Error(JSON.stringify(data.error))
  }

  return data.access_token
}

class App extends React.Component {
  static propTypes = {
    app: PropTypes.object,
    repos: PropTypes.arrayOf(PropTypes.object),
  }

  state = {
    repos: [],
    activeIndex: 0,
    panel: {
      visible: false,
    },
    popup: null,
    code: '',

    // TODO: Don't use this in production
    // reposManaged: projectsMockData(),
  }

  receiveMessage = ({ origin, data: { code } }) => {
    if (origin !== 'http://localhost:3333' || !code) return
    console.log('Code received:', code)
    this.state.popup.close()
    fetch(`http://localhost:9999/authenticate/${code}`)
      .then(response => response.json())
      .then(({ token }) => {
        console.log('token!:', token)
        this.props.app.cache('state', { token })
        this.setState({ popup: null })
      })
  }
  componentDidMount() {
    window.addEventListener('message', this.receiveMessage, false)

    const code =
      window.location.href.match(/\?code=(.*)/) &&
      window.location.href.match(/\?code=(.*)/)[1]

    if (code) {
      console.log(
        'CODE CATCHED, now we should show loading in the panel and close the popup',
        code
      )
      window.opener.postMessage(
        { code: location.href.match(/\?code=(.*)/)[1] },
        '*'
      )
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage, false)
  }

  changeActiveIndex = activeIndex => {
    this.setState({ activeIndex })
  }

  selectProject = () => {
    console.log('selectProject')
  }

  githubSignIn = () => {
    console.log('GithubSignIn from App')
    // this.props.onMessage('githubAuth', 'clientId')
    let url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`
    this.openPopup(url, 'new')
  }

  openPopup = (url, name) => {
    const popupFeatures = `directories=no,menubar=no,location=no,scrollbars=no,status=no,titlebar=no,toolbar=no, ${this.getPopupDimensions()}`
    const popup = window.open(url, name, popupFeatures)
    this.setState({ popup: popup })
  }

  getPopupOffset = ({ width, height }) => {
    const wLeft = window.screenLeft ? window.screenLeft : window.screenX
    const wTop = window.screenTop ? window.screenTop : window.screenY

    // const left = wLeft + window.innerWidth / 2 - width / 2
    // const top = wTop + window.innerHeight / 2 - height / 2

    const left = (width - 600) / 2 + wLeft
    const top = (height - 800) / 2 + wTop

    return { top, left }
  }

  getPopupSize = () => {
    return { width: 600, height: 800 }
  }

  getPopupDimensions = () => {
    const { width, height } = this.getPopupSize()
    const { top, left } = this.getPopupOffset({ width, height })

    console.log('popuup dimensions:', { width, height, top, left })

    return `width=${width},height=${height},top=${top},left=${left}`
  }

  createProject = () => {
    this.closePanel()
    this.setState({})
    // console.log('hex:', window.web3.toHex('MDEyOk9yZ2FuaXphdGlvbjM0MDE4MzU5'))

    // this.props.app.addRepo(this.props.userAccount, '0x012026678901')
    // this.props.app.addRepo(
    //   web3.toHex('MDQ6VXNlcjUwMzAwNTk='),
    //   web3.toHex('MDEwOlJlcG9zaXRvcnkxNDkxMzQ4NTk=')
    // )
  }

  newIssue = () => {
    console.log('newIssue')
  }

  newProject = () => {
    console.log('projects state:', this.state)
    console.log('projects props:', this.props)
    console.log('projects props app token:', this.props.token)

    this.setState(NewProject.withActions(this.createProject, this.githubSignIn))
  }

  closePanel = () => {
    this.setState({ panel: { visible: false } })
  }

  render() {
    const { panel } = this.state
    const PanelContent = panel.content

    return (
      <StyledAragonApp publicUrl={ASSETS_URL}>
        <Title text="Projects" shadow />

        {/* <AppContent
          app={this.props.app}
          projects={this.props.repos !== undefined ? this.props.repos : []}
          onNewProject={this.newProject}
          onNewIssue={this.newIssue}
          onSelect={this.selectProject}
          activeIndex={this.state.activeIndex}
          changeActiveIndex={this.changeActiveIndex}
        /> */}

        {/* <SidePanel
          title={(panel.data && panel.data.heading) || ''}
          opened={panel.visible}
          onClose={this.closePanel}
        >
          {panel.content && <PanelContent {...panel.data} />}
        </SidePanel> */}
      </StyledAragonApp>
    )
  }
}

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
// )(App)
export default App
