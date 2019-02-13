import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { Text, theme, Badge } from '@aragon/ui'

import { CheckButton } from '../Shared'

const StyledIssue = styled.div`
  flex: 1;
  width: 100%;
  background: ${theme.contentBackground};
  display: flex;
  margin-bottom: -1px;
  padding-left: 10px;
  height: 112px;
  align-items: center;
  border: 1px solid ${theme.contentBorder};
  position: relative;
  :active {
    border-width: 2px;
    border-color: ${theme.accent};
  }
  > :first-child {
    margin-right: 21.5px;
    justify-content: center;
    z-index: 2;
  }
  > :nth-child(2) {
    height: 100%;
    padding: 10px;
    flex: 1 1 auto;
  }
`
const IssueDetails = styled.div`
  display: flex;
`

const ClickArea = styled.div`
  width: 95.5%;
  left: 30px;
  /* right: 30px; */
  position: fixed;
  background: transparent;
  height: 110px;
  z-index: 1;
  :hover {
    cursor: pointer;
  }
`

// TODO: @aragon/ui Table?
const Issue = ({
  title,
  repo,
  number,
  labels,
  isSelected,
  onSelect,
  onClick,
}) => (
  <StyledIssue>
    <CheckButton checked={isSelected} onChange={onSelect} />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        height: '90px',
        flex: '1',
      }}
    >
      <div>
        <Text
          color={theme.textPrimary}
          size="large"
          style={{ marginRight: '5px' }}
        >
          {title}
        </Text>
      </div>
      <IssueDetails>
        <Text color={theme.textSecondary}>
          {repo} #{number}
        </Text>
        <Text size="small" color={theme.textTertiary}>
          {labels.totalCount
            ? labels.edges.map(label => (
              <Badge
                key={label.node.id}
                style={{ marginLeft: '5px' }}
                background={'#' + label.node.color}
                foreground={'#000'}
              >
                {label.node.name}
              </Badge>
            ))
            : ''}
        </Text>
      </IssueDetails>
    </div>
    <ClickArea onClick={onClick} />
  </StyledIssue>
)

Issue.propTypes = {
  title: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
}

export default Issue
