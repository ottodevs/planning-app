import PropTypes from 'prop-types'
import React from 'react'

import styled from 'styled-components'
import { unselectable } from '@aragon/ui'

import EmptyStateCard from './EmptyStateCard'

const EmptyWrapper = styled.div`
  ${unselectable};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const EmptyContent = props => (
  <EmptyWrapper>
    <EmptyStateCard
      title={props.emptyState.title}
      text={props.emptyState.text}
      icon={props.emptyState.icon}
      actionText={props.emptyState.actionText}
      onActivate={props.emptyState.action}
    />
  </EmptyWrapper>
)

EmptyContent.propTypes = {
  emptyState: PropTypes.shape({
    action: PropTypes.func.isRequired,
    actionText: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
}

export default EmptyContent
