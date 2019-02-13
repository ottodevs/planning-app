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

const EmptyContent = ({ title, action }) => {
  console.log('empty props:', title)
  return (
    <EmptyWrapper>
      <div>Shit</div>
      {/* <EmptyStateCard onActivate={() => {}} title="text" /> */}
    </EmptyWrapper>
  )
}

EmptyContent.propTypes = {
  // title: PropTypes.string,
  // text: PropTypes.string,
  // icon: PropTypes.node,
  // action: PropTypes.func,
  // actionText: PropTypes.string,
}

export default EmptyContent
