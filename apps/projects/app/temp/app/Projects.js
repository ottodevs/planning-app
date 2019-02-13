import React, { useEffect, useState } from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo-hooks'
import { AppBar, BaseStyles, PublicUrl } from '@aragon/ui'
import apolloClient from './utils/apolloClient'
import Unauthorized from './components/Content/Unauthorized'

const useGithub = userName => {
  const [user, setUser] = useState()
  useEffect(
    () => {
      fetch(`https://api.github.com/users/${userName}`)
        .then(r => r.json())
        .then(setUser)
    },
    [userName]
  )

  return user
}

function App() {
  const user = useGithub('ReeganExE')

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Hi Hello <b>{user.login}</b>
      <p>{user.bio}</p>
    </div>
  )
}

const client = new ApolloClient({
  uri: 'https://dog-graphql-api.glitch.me/graphql',
})
const Projects = ({ token }) => {
  const [githubPopup, setGithubPopup] = useState()

  console.log('projects props?', token)
  useEffect(() => {
    console.log('effect used')
    // /**
    //  * Acting as the redirect target it looks up for 'code' URL param on component mount
    //  * if it detects the code then sends to the opener window
    //  * via postMessage with 'popup' as origin and close the window (usually a popup)
    //  */
    // const code = getURLParam('code')
    // code &&
    //   window.opener.postMessage(
    //     { from: 'popup', name: 'code', value: code },
    //     '*'
    //   )
    // window.close()
  })

  const launchAuthPopup = () => {
    console.log('Popup incoming')
  }

  handleGithubSignIn = () => {
    // The popup is launched, its ref is checked and saved in the state in one step
    this.setState(({ oldPopup }) => ({ popup: githubPopup(oldPopup) }))
    // Listen for the github redirection with the auth-code encoded as url param
    console.log('adding messageListener')
    window.addEventListener('message', this.handlePopupMessage)
  }

  return (
    <ApolloProvider client={() => apolloClient(token)}>
      <div>
        <Suspense fallback={() => <div>Loading...</div>}>
          {' '}
          <PublicUrl.Provider>
            <BaseStyles />
            <AppBar />
            {Boolean(token) ? (
              <div>Content</div>
            ) : (
              <Unauthorized action={launchAuthPopup} />
            )}
          </PublicUrl.Provider>
        </Suspense>
      </div>
    </ApolloProvider>
  )
}

export default Projects
