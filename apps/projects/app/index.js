import 'react-devtools'
import React from 'react'
import ReactDOM from 'react-dom'
import Aragon, { providers } from '@aragon/client'

import App from './components/App/App'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React)
}

const app = new Aragon(new providers.WindowMessage(window.parent))

// TODO: Convert to stateless functional component
class ProjectsApp extends React.PureComponent {
  componentDidMount() {
    window.addEventListener('message', this.handleWrapperMessage)
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleWrapperMessage)
  }
  handleWrapperMessage = ({ data }) => {
    if (data.from !== 'wrapper') {
      return
    }
    if (data.name === 'ready') {
      this.sendMessageToWrapper('ready', true)
      this.setState({
        observable: app.state(),
      })
      app.accounts().subscribe(accounts => {
        this.setState({
          userAccount: accounts[0],
        })
      })
      app.rpc
        .sendAndObserveResponses('cache', ['get', 'github'])
        .pluck('result')
        .subscribe(github => {
          // console.log('github object received from backend cache:', github)

          this.setState({
            github: github,
          })
        })
    }
  }
  sendMessageToWrapper = (name, value) => {
    window.parent.postMessage({ from: 'app', name, value }, '*')
  }
  render() {
    return <App {...this.state} />
  }
}

const domTarget = document.getElementById('projects')

ReactDOM.render(<ProjectsApp />, domTarget)
