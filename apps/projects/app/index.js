import React from 'react'
import ReactDOM from 'react-dom'
import Aragon, { providers } from '@aragon/client'
import App from './components/App/App'

// import { projectsMockData } from './utils/mockData'

// if (process.env.NODE_ENV !== 'production') {
//   const { whyDidYouUpdate } = require('why-did-you-update')
//   whyDidYouUpdate(React)
// }

// TODO: Convert to stateless functional component
class ConnectedApp extends React.Component {
  state = {
    app: new Aragon(new providers.WindowMessage(window.parent)),
    observable: null,
    userAccount: '',
    // ...projectsMockData,
  }
  componentDidMount() {
    window.addEventListener('message', this.handleWrapperMessage)
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleWrapperMessage)
  }
  // handshake between Aragon Core and the iframe,
  // since iframes can lose messages that were sent before they were ready
  handleWrapperMessage = ({ data }) => {
    const {app} = this.state
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
          userAccount: accounts[0] || '',
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
ReactDOM.render(<ConnectedApp />, document.getElementById('projects'))


// import React from 'react'
// import ReactDOM from 'react-dom'

// import App from './components/App/App'
// import {
//   compose,
//   lifecycle,
//   mapPropsStreamWithConfig,
//   withHandlers,
//   withState,
//   withProps,
//   withPropsOnChange,
//   componentFromStreamWithConfig,
//   setObservableConfig,
// } from 'recompose'
// // import rxjsConfig from 'recompose'
// import {
//   handleWrapperMessage,
//   newAragonAppInstance,
//   useMessageListener,
//   initPerformanceProfiler,
// } from './hooks'

// import { from, interval } from 'rxjs'
// // import { map, startWith, distinctUntilChanged } from 'rxjs/operators'

// initPerformanceProfiler()
// const root = document.getElementById('projects')

// const setApp = args => console.log('setApp calld:', args)

// const useAragonConnector = compose(
//   // This should have the ability to reconnect to the wrapper
//   withPropsOnChange(
//     (oldProps, newProps) => newProps.app !== oldProps.app,
//     () => ({ app: newAragonAppInstance() })
//   ),
//   // withState('observable', 'setObservable', null),
//   withState('userAccount', 'setUserAccount', ''),
//   withHandlers({
//     initAppConnection: () => {
//       console.log('initAppConnection triggered, props:')
//     },
//   }),
//   useMessageListener(handleWrapperMessage('ready', () => {})),
//   withProps(p => console.log('current props:', p))
// )

// const mapPropsStream = mapPropsStreamWithConfig({
//   fromESObservable: from,
//   toESObservable: stream => stream,
// })

// // setObservableConfig(rxjsConfig)

// const Account = props => <h1>Account: {props.account}</h1>

// // const StreamingAccounts = ({ accounts$ }) => {
// //   console.log('accoounts:', accounts$)
// //   return <h1>Accs</h1>
// // }

// const withAccount = mapPropsStream(props$ => {
//   console.log('mapProps', props$)
//   return <h1>Hia</h1>
// })

// // const ProjectsApp = connected(() => <App {...this.state}>)
// const ProjectsApp = useAragonConnector(
//   ({ app }) => withAccount(Account)
//   // <App />
// )

// ReactDOM.render(<ProjectsApp />, root)

// //   handleWrapperReady() {
// //     this.setState({
// //       // The observable keeps the script state synced with app's props
// //       observable: this.state.app.state(),
// //     })
// //     github
// //     if (!this.state.token) {
// //       this.state.app.state().subscribe(workerState => {
// //         if (!workerState) return
// //         workerState.token && this.setState({ token: workerState.token })
// //       })
// //     }
// //   }

// //   listenFromWrapper(data) {
// //     if (data.from !== 'wrapper') return
// //     // if (data.name === 'ready') performStateSync()
// //   }

// //   componentDidMount() {
// //     window.addEventListener('message', this.handleMessage)
// //   }
// //   componentWillUnmount() {
// //     window.removeEventListener('message', this.handleMessage)
// //   }

// //   shouldComponentUpdate(_, nextState) {
// //     return nextState.token !== this.state.token
// //   }
// //   // handshake between Aragon Core and the iframe,
// //   // since iframes can lose messages that were sent before they were ready
// //   handleMessage = async ({ data }) => {
// //     console.log(
// //       'handleMessage(): is data from popup or wrapper?',
// //       !(data.from !== 'wrapper' && data.from !== 'popup')
// //     )
// //     this.listenFromWrapper(data)
// //     // this.listenFromPopup(data)
// //     // Only listen to wrapper or popup messages, return otherwise
// //     if (data.from !== 'wrapper' && data.from !== 'popup') return
// //     if (data.from === 'popup' && data.name === 'code') {
// //       const token = await getToken(data.value)
// //       this.state.app.cache('state', { token: token })
// //     }
// //   }
