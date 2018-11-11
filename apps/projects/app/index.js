import React from 'react'
import { render } from 'react-dom'
import { ConnectedApp } from '@tpt/extras-ui'

const root = document.getElementById('projects')
render(<ConnectedApp />, root)
// import { setConfig, cold } from 'react-hot-loader'

// setConfig({
//   onComponentRegister: (type, name, file) =>
//     file.indexOf('node_modules') > 0 && cold(type),
// })

// const renderApp = () => {
//   const App = require('./components/App/ConnectedApp').default
//   render(<App />, root)
// }

// renderApp()
// module.hot.accept(renderApp)
