import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { EmptyStateCard, Text, unselectable } from '@aragon/ui'
import icon from '../../assets/svg/github.svg'

const Icon = () => <img src={icon} alt="Empty entities icon" />

const Unauthorized = ({ onLogin }) => (
  <EmptyWrapper>
    <EmptyStateCard
      // style={{ width: '349px', height: '382px', whiteSpace: 'pre-wrap' }}
      style={{ padding: '17px' }}
      title="Projects = Aragon + Github *"
      text="Sign in with Github to start managing your repositories as projects
          within aragon."
      icon={<Icon />}
      actionText="New Entity"
      onActivate={onLogin}
    />
    <Text size="xsmall">
      * Note: we plan to decouple from Github in the future!
    </Text>
  </EmptyWrapper>
)

Unauthorized.propTypes = {
  onLogin: PropTypes.func.isRequired,
}

const EmptyWrapper = styled.div`
  ${unselectable};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`

export default Unauthorized
