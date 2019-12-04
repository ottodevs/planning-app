import ApolloClient from 'apollo-boost'

// TODO: Get the token from the appState instead of needing to pass every time here
export const initApolloClient = token =>
  new ApolloClient({
    uri: 'https://api.github.com/graphql',
    request: operation => {
      if (token) {
        operation.setContext({
          headers: {
            accept: 'application/vnd.github.starfire-preview+json', // needed to create issues
            authorization: `bearer ${token}`,
          },
        })
      }
    },
  })
