import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Button } from '@aragon/ui'

export default class AppTitleButton extends React.Component {
  static propTypes = {
    caption: PropTypes.string,
    onClick: PropTypes.func,
  }
  render() {
    return (
      <StyledButton mode="strong" onClick={this.props.onClick}>
        {this.props.caption}
      </StyledButton>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}

const StyledButton = styled(Button)`
  position: absolute;
  top: 10px;
  right: 30px;
  z-index: 2;
`
