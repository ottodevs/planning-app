import '@babel/polyfill'

const CLIENT_ID = 'd556542aa7a03e640409'
const GITHUB_URI = 'https://github.com/login/oauth/authorize'
const REDIRECT_URI = 'http://localhost:3333'
const AUTH_URI = 'http://localhost:9999/authenticate'

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  FINISHED_LOADING: 'finished_loading',
  AUTHENTICATED: 'authenticated',
}

const getPopupDimensions = () => {
  const { width, height } = getPopupSize()
  const { top, left } = getPopupOffset({ width, height })
  return `width=${width},height=${height},top=${top},left=${left}`
}

const getPopupSize = () => {
  return { width: 650, height: 850 }
}

const getPopupOffset = ({ width, height }) => {
  const wLeft = window.screenLeft ? window.screenLeft : window.screenX
  const wTop = window.screenTop ? window.screenTop : window.screenY

  const left = wLeft + window.innerWidth / 2 - width / 2
  const top = wTop + window.innerHeight / 2 - height / 2

  return { top, left }
}

// Oauth Step 1: Send cliend id to Github and ask for an auth code with REDIRECT_URI
const githubPopup = (popup = null) => {
  // Checks to save some memory if the popup exists as a window object
  if (!popup || popup === null || popup.closed) {
    // TODO: Improve readability here
    popup = window.open(
      // 'http://localhost:3333/?code=ab591bcfcfd9ebb47577#lol',
      `${REDIRECT_URI}/?code=232r3423`,
      // `${GITHUB_URI}?client_id=${CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`,
      'githubAuth',
      `scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no, ${getPopupDimensions()}`
    )
  } else popup.focus()
  return popup
}

// Oauth Step 2: Check for the auth code as a URL param after github auth redirect
const checkCode = () => {
  const code =
    window.location.href.match(/\?code=(.*)/) &&
    window.location.href.match(/\?code=(.*)/)[1]

  if (code) {
    console.log('CODE CATCHED in url, sending...', code)
    // When the code is detected it means the app acts a the popup
    // the code is sent back the to the main app window that has the script context
    console.log('window opener')

    window.opener.postMessage({ from: 'popup', name: 'code', value: code }, '*')
    window.close()
  }
}

// Oauth Step 3: Change the auth code for the user token
const getToken = async code => {
  console.log('getToken entered')

  // TODO: Manage when server does not respond
  const response = await fetch(`${AUTH_URI}/${code}`)
  const json = await response.json()
  // console.log('token arrived in getToken:', json.token)
  return json.token

  // if (response.ok) return await response.json().token
  // throw new Error(response.status)
}

// As the main window the app receives the code via postMessage and authenticates
// it with the external service that manages the github oauth app secret key
// const receiveMessage = ({ origin, data: { code } }) => {
// if (origin !== REDIRECT_URI || !code) return
// console.log('Code received via postMessage', code)
// const token = getToken(code)

// Aragon.js cache method is used to save the token in the local user cache with the rest of app settings
// if (token) this.props.storeToken(token)
// change status here
// }

export { checkCode, githubPopup, getToken, REDIRECT_URI }
