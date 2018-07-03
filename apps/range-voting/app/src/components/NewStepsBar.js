import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { theme, Text } from '@aragon/ui'

const StyledStepsBar = styled.ul`
  :after {
    content: '';
    height: 2px;
    width: 25%;
    background-color: ${theme.accent};
    z-index: 999;
    margin-left: 12.5%;
    display: block;
    transform: translateY(1300%) scaleX(${props => props.currentStep});
    transform-origin: 0;
    transition: transform 1s cubic-bezier(0.2, 1, 0.35, 1);
  }
`

const StyledStep = styled.li`
  text-transform: uppercase;
  color: ${theme.textTertiary}
  list-style-type: none;
  font-size: 12px;
  text-align: center;
  width: 25%;
  position: relative;
  float: left;
  :after {
    display: block;
    content: "";
    width: 10px;
    height: 10px;
    background-color: ${theme.accent};
    border-radius: 5px;
    margin: 8px auto;
  }
  ~ li:before {
    background-color: ${theme.textTertiary};
    content: "";
    width: 100%;
    height: 2px;
    position: absolute;
    left: -50%;
    bottom: 12px;
    z-index: -1;
  }
  &.active {
    color: ${theme.accent};
    ~ li:after,
    ~ li:before {
      background-color: ${theme.textTertiary};
    }
  }
`

class App extends React.Component {
  state = { currentStep: 0 }

  nextStep = () => {
    this.setState(prevState => ({ currentStep: prevState.currentStep + 1 }))
  }

  prevStep = () => {
    this.setState(prevState => ({ currentStep: prevState.currentStep - 1 }))
  }

  render() {
    return (
      <div className="App">
        <h1 onClick={this.nextStep}>
          Hello CodeSandbox {this.state.currentStep}
        </h1>
        <h2 onClick={this.prevStep}>Start editing to see some magic happen!</h2>
        <StyledStepsBar currentStep={this.state.currentStep}>
          <StyledStep>
            <Text>Choose Template</Text>
          </StyledStep>
          <StyledStep>
            <Text>Configure</Text>
          </StyledStep>
          <StyledStep>
            <Text>Review</Text>
          </StyledStep>
          <StyledStep className="active">
            <Text>Launch</Text>
          </StyledStep>
        </StyledStepsBar>
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
