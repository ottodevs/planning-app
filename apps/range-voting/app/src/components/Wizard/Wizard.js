import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import { theme, Text } from '@aragon/ui'
// import ProgressBar from '../StepsBar'

class Wizard extends Component {
  render() {
    return (
      <Fragment>
        <Overlay>
          <Modal>
            {/* <ProgressBar /> */}
            <CloseButton>&times;</CloseButton>
            <StepsBar className="stepsbar">Steps Bar</StepsBar>
            <div className="content">Content</div>
            <div className="buttons">Buttons</div>
          </Modal>
        </Overlay>
      </Fragment>
    )
  }
}

const CloseButton = styled.div`
  color: grey;
  position: relative;
  align-self: flex-end;
  top: -15px;
`

const StepsBar = () => (
  <StyledStepsBar>
    <Step>
      <Text>Choose Template</Text>
      <Disc />
    </Step>
    <Step>
      <Text>Configure</Text>
      <Disc />
    </Step>
    <Step>
      <Text>Review</Text>
      <Disc />
    </Step>
    <Step>
      <Text>Launch</Text>
      <Disc />
    </Step>
    <Line />
  </StyledStepsBar>
)

const StyledStepsBar = styled.div`
  width: 80%;
  height: 35px;
  background: grey;
  align-items: center;
  display: grid;
  grid-template: 1fr 1fr / repeat(4, 2fr);
  grid-column-gap: ;
`
// Steps
const Step = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Disc = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: ${({ active }) =>
    active ? theme.accent : theme.contentBackgroundActive};
`
const Line = styled.div`
  height: 2px;
  background: ${theme.accent};
  justify-self: stretch;
  grid-area: 2 / 1 / 2 / 5;
`

// backdrop-filter: brightness(1.5) blur(1px);
const Overlay = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
`

const Modal = styled.div`
  box-shadow: rgba(1, 1, 1, 0.3) 0px 10px 28px 0px;
  background: white;
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #333;
  padding: 30px;
  border-radius: 3px;
  min-height: 400px;
  max-height: 660px;
  min-width: 800px;
  max-width: 1080px;
`

export default Wizard

// import React, { Fragment, PureComponent } from 'react'
// import styled from 'styled-components'

// import StepsBar from '../StepsBar'
// import PrevNext from '../PrevNext'

// this comes from former App.js, outside AppLayout and below SidePanel:
//       {/* { this.state.wizardActive && (
//         <Wizard
//           // visible={true}
//           // app={this.props.app}
//           closeWizardLink={this.closeWizard}
//           // wizardLaunchLink={this.wizardLaunch}
//         />
//       )} */}

// import React, { Fragment, PureComponent } from "react";
// import PropTypes from "prop-types";
// import styled from "styled-components";
// import { Motion, spring } from "react-motion";
// import { spring as springConf } from "@aragon/ui";

// const initialState = {}

// TODO: RESPONSIVE DESIGN??

// const wizardSteps = [
//     { name: "Choose Template" },
//     { name: "Configure" },
//     { name: "Review" },
//     { name: "Launch" }
// ];
//
// const WizardLayout = props => <Fragment />;
//
// const WizardStep = () => <div>I am WizardStep</div>;

// class Wizard extends PureComponent {
//   // static propTypes = {}
//   static defaultProps = {}

//   render() {
//     return (
//       <Fragment>
//         <Overlay />
//         <ModalPanel>
//           <StepsBar />
//           <CloseButton onClick={this.props.handleClose}>&times;</CloseButton>
//           <ModalContent />
//           <PrevNext />
//         </ModalPanel>
//       </Fragment>
//     )
//   }
// }

// const ModalContent = () => <div>Hello</div>

// OLD

// const StepsBar = styled.div`
//   width: 100%;
// `

// const Overlay = styled.div`
//   position: fixed;
//   left: 0;
//   top: 0;
//   height: 100vh;
//   width: 100vw;
//   background-color: rgba(0, 0, 0, 0.2);
//   transform: scale(1: 1);
//   transition: visibility 0s linear 0.25s, opacity 0.25s 0s, transform 0.25s;
//   z-index: 0;
// `

// const ModalPanel = styled.div`
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   background-color: white;
//   padding: 1rem 1.5rem;
//   min-width: 800px;
//   min-height: 100px;
//   ${'' /* width: 24rem; */};
// `

// const CloseButton = styled.div`
//   float: right;
//   width: 1.5rem;
//   line-height: 1.5rem;
//   text-align: center;
//   cursor: pointer;
//   color: lightgray;
//   &:hover {
//     color: darkgray;
//   }
// `
// export default Wizard
