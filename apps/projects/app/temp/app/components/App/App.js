import PropTypes from 'prop-types'
import { hot } from 'react-hot-loader'
import React, { Suspense } from 'react'
import styled from 'styled-components'

import {
  AppBar,
  AppView,
  BaseStyles,
  BreakPoint,
  breakpoint,
  font,
  NavigationBar,
  observe,
  PublicUrl,
} from '@aragon/ui'
// import { ApolloProvider } from 'react-apollo'

import { STATUS } from '../../utils/github'

import { Title } from '../Shared'
import PanelManager, { PANELS } from '../Panel'


import ResponsiveButton from './ResponsiveButton'



const ASSETS_URL = './aragon-ui-assets/'

class App extends React.PureComponent {
  static propTypes = {
    app: PropTypes.object.isRequired,
    repos: PropTypes.arrayOf(PropTypes.object),
  }

  state = {
    issue: {},
    repos: [],
    activeIndex: 0,
    animateScreens: false,
    navigationItems: ['Projects'],
    location: { screen: 'overview' },
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ animateScreens: true })
    }, 0)
  }

  // componentDidUpdate(prevProps) {
  //   const prevScreen = this.getLocation(prevProps.params).screen
  //   const screen = this.getLocation(this.props.params).screen
  //   if (prevScreen !== screen) {
  //     this._scrollTopElement.scrollIntoView()
  //   }
  // }

  // getLocation(params) {
  //   const overview = { screen: 'overview' }

  //   if (!params) {
  //     return overview
  //   }

  // // Not using "/" as a separator because
  // // it would get encoded by encodeURIComponent().
  // const [
  //   screen,
  //   data = null,
  //   secondaryScreen = null,
  //   secondaryData = null,
  // ] = params.split('.')

  // if (screen === 'app' && isAddress(data)) {
  //   return {
  //     screen,
  //     address: data,
  //     app: this.getAppByProxyAddress(data),
  //     secondaryScreen,
  //     secondaryData,
  //   }
  // }

  // if (screen === 'entity' && isAddress(data)) {
  //   return { screen, address: data }
  // }

  // return overview
  // }


  }

  changeActiveIndex = activeIndex => {
    this.setState({ activeIndex })
  }

  selectProject = () => {
    console.log('selectProject')
  }

  createProject = ({ owner, project }) => {
    console.info('App.js: createProject', project, owner)
    this.closePanel()
    this.props.app.addRepo(web3.toHex(project), web3.toHex(owner))
  }

  removeProject = projectId => {
    console.log('App.js: removeProject', projectId)
    this.props.app.removeRepo(projectId)
    // TODO: Toast feedback here maybe
  }

  newIssue = () => {
    const { repos } = this.props
    const repoNames =
      (repos &&
        repos.map(repo => ({
          name: repo.metadata.name,
          id: repo.data.repo,
        }))) ||
      'No repos'
    const reposIds = (repos && repos.map(repo => repo.data.repo)) || []

    this.setState(() => ({
      panel: PANELS.NewIssue,
      panelProps: {
        reposManaged: repoNames,
        closePanel: this.closePanel,
        reposIds,
      },
    }))
  }

  // TODO: Review
  // This is breaking RepoList loading sometimes preventing show repos after login
  newProject = () => {
    this.setState((_prevState, { github: { status } }) => ({
      panel: PANELS.NewProject,
      panelProps: {
        onCreateProject: this.createProject,
        onGithubSignIn: this.handleGithubSignIn,
        status: status,
      },
    }))
  }

  newBountyAllocation = issues => {
    this.setState((_prevState, _prevProps) => ({
      panel: PANELS.NewBountyAllocation,
      panelProps: {
        issues: issues,
        onSubmit: this.onSubmitBountyAllocation,
        bountySettings: this.props.bountySettings,
      },
    }))
  }

  onSubmitBountyAllocation = bounties => {
    console.log('bounty allocation submitted', bounties)
    // TODO: The contract addBounties function first param is just a single repoId, so in the case a bounty allocation comprises issues from multiple repos it should launch a tx for each repo
    // this.props.app.addBounties()
    // bytes32 _repoId,
    // uint256[] _issueNumbers,
    // uint256[] _bountySizes,
    // uint256[] _deadlines,
    // bool[] _tokenBounties,
    // address[] _tokenContracts,
    // string _ipfsAddresses

    // this.closePanel()
  }

  curateIssues = issues => {
    this.setState((_prevState, _prevProps) => ({
      panel: PANELS.NewIssueCuration,
      panelProps: {
        issues: issues,
        onSubmit: this.onSubmitCuration,
        // rate: getSetting(SETTINGS.rate),
      },
    }))
  }

  onSubmitCuration = issues => {
    this.closePanel()
    // TODO: maybe assign this to issueDescriptionIndices, not clear
    let issueDescriptionIndices = []
    issues.forEach((issue, i) => {
      if (i == 0) {
        issueDescriptionIndices.push(issue.title.length)
      } else {
        issueDescriptionIndices.push(issue.title.length)
      }
    })

    // TODO: splitting of descriptions needs to be fixed at smart contract level
    const issueDescriptions = issues.map(issue => issue.title).join('')
    /* TODO: The numbers below are supposedly coming from an eventual:
     issues.map(issue => web3.utils.hexToNum(web3.toHex(issue.repoId))) */
    const issueNumbers = issues.map(issue => issue.number)
    const emptyIntArray = new Array(issues.length).fill(0)
    const emptyAddrArray = [
      '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
      '0xd00cc82a132f421bA6414D196BC830Db95e2e7Dd',
      '0x89c199302bd4ebAfAa0B5Ee1Ca7028C202766A7F',
      '0xd28c35a207c277029ade183b6e910e8d85206c07',
      '0xee6bd04c6164d7f0fa1cb03277c855639d99a7f6',
      '0xb1d048b756f7d432b42041715418b48e414c8f50',
      '0x6945b970fa107663378d242de245a48c079a8bf6',
      '0x83ac654be75487b9cfcc80117cdfb4a4c70b68a1',
      '0x690a63d7023780ccbdeed33ef1ee62c55c47460d',
      '0xb1afc07af31795d61471c169ecc64ad5776fa5a1',
      '0x4aafed050dc1cf7e349accb7c2d768fd029ece62',
      '0xd7a5846dea118aa76f0001011e9dc91a8952bf19',
    ]

    this.props.app.curateIssues(
      emptyAddrArray.slice(0, issues.length),
      emptyIntArray,
      issueDescriptionIndices,
      issueDescriptions,
      emptyIntArray,
      issueNumbers,
      1
    )
  }

  closePanel = () => {
    this.setState({ panel: undefined, panelProps: undefined })
  }

  handleMenuPanelOpen = () => {
    console.log('Open menu')

    // this.props.onMessage({
    //   data: { from: 'app', name: 'menuPanel', value: true },
    // })
  }

  goToHome = () => {
    this.setState({
      navigationItems: ['Projects'],
      location: { screen: 'overview' },
    })
  }

  openIssueDetail = issue => {
    console.log('issue clicked:', issue)
    this.setState({
      navigationItems: ['Overview', 'Issue Details'],
      location: { screen: 'issue-detail' },
      issue,
    })
  }

  render() {
    const {
      activeIndex,
      animateScreens,
      panel,
      panelProps,
      navigationItems,
      location,
    } = this.state
    const { client: apolloClient, bountySettings } = this.props

    console.log('STATE:', this.state)
    console.log('PROPS:', this.props)
    console.log('tenemos token?', Boolean(this.props.github.token))

    return (
      <PublicUrl.Provider url={ASSETS_URL}>
        <BaseStyles />
        {/* <ApolloProvider client={apolloClient}> */}
        <ScrollTopElement
          ref={el => {
            this._scrollTopElement = el
          }}
        />


        {/* </AppView> */}
        <PanelManager
          onClose={this.closePanel}
          activePanel={panel}
          {...panelProps}
        />
        {/* </ApolloProvider> */}
      </PublicUrl.Provider>
    )
  }
}

const StyledAragonApp = styled(PublicUrl.Provider).attrs({
  url: ASSETS_URL,
})`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`



const AppBarTitle = styled.span`
  display: flex;
  align-items: center;
`

const AppBarLabel = styled.span`
  margin: 0 10px 0 8px;
  ${font({ size: 'xxlarge' })};
  ${breakpoint(
    'medium',
    `
      margin-left: 24px;
    `
  )};
`

// This element is only used to reset the view scroll using scrollIntoView()
const ScrollTopElement = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
`

export default observe(
  observable => observable.map(state => ({ ...state })),
  {}
)(hot(module)(App))

            // {/* <AppContent
            //   onIssueClicked={this.openIssueDetail}
            //   app={this.props.app}
            //   bountySettings={this.props.bountySettings}
            //   projects={this.props.repos !== undefined ? this.props.repos : []}
            //   bountySettings={
            //     bountySettings !== undefined ? bountySettings : {}
            //   }
            //   onNewProject={this.newProject}
            //   onRemoveProject={this.removeProject}
            //   onNewIssue={this.newIssue}
            //   onCurateIssues={this.curateIssues}
            //   onAllocateBounties={this.newBountyAllocation}
            //   onSelect={this.selectProject}
            //   activeIndex={activeIndex}
            //   changeActiveIndex={this.changeActiveIndex}
            // /> */}