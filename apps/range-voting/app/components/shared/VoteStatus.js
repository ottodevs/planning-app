import React from 'react'
import { theme, IconTime, IconCross, IconCheck } from '@aragon/ui'

import {
  VOTE_STATUS_ONGOING,
  VOTE_STATUS_SUCCESSFUL,
  VOTE_STATUS_FAILED,
} from '../../utils/vote-types'
import { getVoteStatus } from '../../utils/vote-utils'

const ATTRIBUTES = {
  [VOTE_STATUS_ONGOING]: {
    label: 'Ongoing',
    Icon: IconTime,
    color: theme.textSecondary,
  },
  [VOTE_STATUS_SUCCESSFUL]: {
    label: 'Approved',
    Icon: IconCheck,
    color: theme.positive,
  },
  [VOTE_STATUS_FAILED]: {
    label: 'Rejected',
    Icon: IconCross,
    color: theme.negative,
  },
}

const VoteStatus = ({ vote: { data, support, quorum } }) => {
  const status = getVoteStatus(data, support, quorum)
  const { color, label, Icon } = ATTRIBUTES[status]
  return (
    <span style={{ whiteSpace: 'nowrap', color: color }}>
      <Icon />
      <span style={{ marginLeft: '10px' }}>{label}</span>
    </span>
  )
}

export default VoteStatus
