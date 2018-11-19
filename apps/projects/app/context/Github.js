// const GithubContext = React.createContext('github')

// class GithubProvider extends React.Component {
//   static propTypes = {
//     storeToken: PropTypes.func.isRequired,
//     handleSignIn: PropTypes.func.isRequired,
//   }

//   componentDidMount() {
//     window.addEventListener('message', this.receiveMessage, false)
//     checkCode()
//   }

//   componentWillUnmount() {
//     window.removeEventListener('message', this.receiveMessage, false)
//   }

//   render() {
//     return (
//       <GithubContext.Provider
//         value={{
//           state: this.state,
//           handleSignIn: this.props.handleSignIn,
//         }}
//       >
//         {this.props.children}
//       </GithubContext.Provider>
//     )
//   }
// }

// const withGithub = Component => props => (
//   <GithubContext.Consumer>
//     {github => github.handleSignIn && <Component github={github} {...props} />}
//   </GithubContext.Consumer>
// )

// export { GithubProvider, STATUS, withGithub }
