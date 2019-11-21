/* eslint-disable import/no-unused-modules */
import React from 'react'
import ReactDOM from 'react-dom'

// stub out axe; not interested in dealing with this noise rn
// if (process.env.NODE_ENV !== 'production') {
//   var axe = require('react-axe')
//   axe(React, ReactDOM, 1000)
// }

import App from './App'

ReactDOM.render(<App />, document.querySelector('#projects')
)
