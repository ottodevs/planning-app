import React from 'react'
import { Button } from '@aragon/ui'
import { useGithub } from '../../hooks'

// const withCodeHandler = withHandlers({
//   handleSignIn: props => event => {
//     props.openPopup(githubPopup)
//   },
//   handleCode: props => event => {
//     console.log('handleCode:', event, props)
//   },
// })

// const withExternalPopup = withState('popup', 'openPopup', null)

// const withCodeListener = lifecycle({
//   componentDidMount() {
//     window.addEventListener('message', this.props.handleCode)
//   },
//   componentWillUnmount() {
//     window.removeEventListener('message', this.props.handleCode)
//   },
// })

// const SignIn = ({ handleSignIn, githubStatus, handleCode }) => (
//   <Button
//     wide
//     mode="strong"
//     // disabled={githubStatus === STATUS.WAITING_POPUP}
//     onClick={handleSignIn}
//   >
//     Github Sign In
//   </Button>
// )

const NewProject = props => {
  console.log('new project', props)
  return (
    <Button
      wide
      mode="strong"
      // disabled={githubStatus === STATUS.WAITING_POPUP}
      onClick={props.openPopup}
    >
      Github Sign In
    </Button>
  )
}

export default useGithub(NewProject)
// export default NewProject

// const enhance = compose(
//   withExternalPopup,
//   withCodeListener,
//   withCodeHandler
// )

// export default enhance(SignIn)

// const Loading = () => <div>Loading ...</div>

// const STATUS = {
//   INITIAL: 'initial',
//   WAITING_POPUP: 'waiting_popup',
// }

// // const withGithubRequest = lifecycle({
// //   componentDidMount() {
// //     // const delay = t => new Promise(resolve => setTimeout(resolve, t))
// //     // delay(3000).then(data =>
// //     this.setState({ githubStatus: STATUS.INITIAL })
// //     // )
// //   },
// // })

// const withGithubSignIn = branch(
//   ({ githubStatus }) => githubStatus === STATUS.INITIAL,
//   // if not logged in render the login component
//   renderComponent(SignIn)
// )

// const withLoading = branch(
//   ({ githubStatus }) => githubStatus === STATUS.WAITING_POPUP,
//   // if the condition does not meet
//   renderComponent(Loading)
// )

// // const withGithubAuth = withGithubSignIn(
// //   ({ githubStatus }) => githubStatus !== STATUS.INITIAL
// // )

// const withGithubData = compose(
//   withState('githubStatus', 'setGithubStatus', STATUS.INITIAL),
//   withHandlers({
//     handleSignIn: props => event => props.setGithubStatus(STATUS.WAITING_POPUP),
//   }),
//   withLoading,
//   withGithubSignIn
// )

// // In the render we should display the actual data styled
// const NewProject = withGithubData(data => (
//   <React.Fragment>You are in {JSON.stringify(data)}</React.Fragment>
// ))

// // import { withGithub, STATUS } from '../../context/Github'

// // const NewProject = props => {
// //   console.log('[projects->newproject.js->render()], props:', props)
// //   const SignIn = () => (
// //     <div>
// //       <Button wide mode="strong" onClick={props.onGithubSignIn}>
// //         Github Sign In
// //       </Button>
// //     </div>
// //   )

// //   return (
// //     <React.Fragment>
// //       {!props.githubToken ? <SignIn /> : <div>Repo List</div>}
// //     </React.Fragment>
// //   )
// // }

// // NewProject.propTypes = {
// //   handleSignIn: PropTypes.func,
// // }
// // export default withGithub(NewProject)
