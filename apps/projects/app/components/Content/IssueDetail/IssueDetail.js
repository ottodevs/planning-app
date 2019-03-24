import PropTypes from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'
import { theme } from '@aragon/ui'

import { Detail, Navigation } from './components'

const modalRoot = document.querySelector('#projects')

const issueDetailStyle = {
  position: 'absolute',
  top: '0',
  height: '100vh',
  zIndex: '2',
  width: '100vw',
  overflowX: 'hidden',
  background: theme.mainBackground,
}

// TODO: Much better to pass only a issueId and populate and cache data from the component, but current code is only for UI layout
export default class IssueDetail extends React.Component {
  static propTypes = {
    issue: PropTypes.object.isRequired,
    onAllocateSingleBounty: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onReviewApplication: PropTypes.func.isRequired,
    onRequestAssignment: PropTypes.func.isRequired,
    onSubmitWork: PropTypes.func.isRequired,
    onReviewWork: PropTypes.func.isRequired,
  }

  el = document.createElement('div')

  componentDidMount() {
    modalRoot.append(this.el)
  }
  componentWillUnmount() {
    modalRoot.removeChild(this.el)
  }

  render() {
    const {
      onClose,
      issue,
      onReviewApplication,
      onRequestAssignment,
      onSubmitWork,
      onAllocateSingleBounty,
      onReviewWork,
    } = this.props

    return createPortal(
      <div style={issueDetailStyle}>
        <Navigation onClose={onClose} />
        <Detail
          {...issue}
          onReviewApplication={onReviewApplication}
          onRequestAssignment={onRequestAssignment}
          onSubmitWork={onSubmitWork}
          onAllocateSingleBounty={onAllocateSingleBounty}
          onReviewWork={onReviewWork}
        />
      </div>,
      this.el
    )
  }
}
