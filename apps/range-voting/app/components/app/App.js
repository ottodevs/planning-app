import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import {
  AppBar,
  BaseStyles,
  EmptyStateCard,
  observe,
  PublicUrl,
  SidePanel,
} from '@aragon/ui'
import { isBefore } from 'date-fns'
import styled from 'styled-components'

import tokenAbi from '../../../../shared/abi/token'
import { AppLayout, safeDiv } from '../../../../shared/ui'
import { newRangeVoteSvg } from '../../assets'
import { getQuorumProgress } from '../../utils/vote-utils'
import { Votes, Voting } from '../'

const ASSETS_URL = './aragon-ui-assets/'
const EmptyIcon = () => <img src={newRangeVoteSvg} alt="" />

const App = ({
  app,
  tokenAddress = '0x0',
  pctBase = 0,
  minParticipationPct = 0,
  userAccount,
  votes = [],
  voteTime = 0,
}) => {
  const [panelOpened, setPanelOpened] = useState(false)
  const [selectedVote, setSelectedVote] = useState()
  const [token, setToken] = useState()

  useEffect(() => {
    getTokenContract(tokenAddress)
  }, [tokenAddress])

  const preparedVotes =
    votes &&
    votes.map(vote => {
      const endDate = new Date(vote.data.startDate + voteTime)
      return {
        ...vote,
        endDate,
        // Open if not executed and now is still before end date
        open: !vote.data.executed && isBefore(new Date(), endDate),
        quorum: safeDiv(vote.data.minAcceptQuorum, pctBase),
        quorumProgress: getQuorumProgress(vote.data),
        description: vote.data.metadata,
      }
    })

  const panelTitle = selectedVote
    ? `${selectedVote.description} (${selectedVote.open ? 'Open' : 'Closed'})`
    : ''

  const getTokenContract = async tokenAddress => {
    const tokenContract = await app.external(tokenAddress, tokenAbi)
    setToken(tokenContract)
  }

  const handleVoteClick = id => {
    setSelectedVote(preparedVotes.find(vote => vote.voteId === id))
    setPanelOpened(true)
    console.log('voteId', id, selectedVote)
  }

  const handleVote = (voteId, supports) => {
    console.log('voting:', voteId, supports)
    // app.vote(voteId, supports)
    // setPanelOpened(false)
  }

  console.log('token is ready?', token)

  return (
    <StyledAragonApp publicUrl={ASSETS_URL}>
      <BaseStyles />
      <AppLayout>
        <AppLayout.Header>
          <AppBar title="Range Voting" />
        </AppLayout.Header>
        <AppLayout.Content>
          <AppLayout.ScrollWrapper>
            {votes.length ? (
              <Votes votes={preparedVotes} onSelectVote={handleVoteClick} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                }}
              >
                <EmptyStateCard
                  icon={<EmptyIcon />}
                  title="You have not created any range votes."
                  text="Use the Allocations app to get started."
                  action={null}
                />
              </div>
            )}
          </AppLayout.ScrollWrapper>

          {votes.length && (
            <SidePanel
              title={panelTitle}
              opened={panelOpened}
              onClose={() => setPanelOpened(false)}
            >
              {selectedVote && (
                <Voting
                  app={app}
                  minParticipationPct={minParticipationPct}
                  onVote={handleVote}
                  tokenContract={token}
                  userAccount={userAccount}
                  vote={selectedVote}
                />
              )}
            </SidePanel>
          )}
        </AppLayout.Content>
      </AppLayout>
    </StyledAragonApp>
  )
}

App.propTypes = {
  app: PropTypes.object.isRequired,
  tokenAddress: PropTypes.string,
  minParticipationPct: PropTypes.number,
  pctBase: PropTypes.number,
  votes: PropTypes.array,
  voteTime: PropTypes.number,
}

const StyledAragonApp = styled(PublicUrl.Provider).attrs({
  url: ASSETS_URL,
})`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`

// const Return = () => (
//   <AragonApp publicUrl="aragon-ui-assets/">
//     <AppLayout>
//       <AppLayout.Header>
//         <AppBar
//           title="Range Voting"
//           // endContent={barButton}
//         />
//       </AppLayout.Header>
//       <AppLayout.ScrollWrapper>
//         <AppLayout.Content>
//           <Decisions
//             onActivate={this.handlePanelOpen}
//             app={this.props.app}
//             votes={this.props.votes !== undefined ? this.props.votes : []}
//             voteTime={this.props.voteTime}
//             minParticipationPct={
//               this.props.minParticipationPct
//                 ? this.props.minParticipationPct.toFixed(2)
//                 : 'N/A'
//             }
//             tokenAddress={this.props.tokenAddress}
//             userAccount={this.props.userAccount}
//           />
//         </AppLayout.Content>
//       </AppLayout.ScrollWrapper>
//     </AppLayout>
//     <SidePanel
//       title={''}
//       opened={this.state.panelActive}
//       onClose={this.handlePanelClose}
//     >
//       <NewPayoutVotePanelContent />
//     </SidePanel>
//   </AragonApp>
// )

export default observe(
  observable => observable.map(state => ({ ...state })),
  {}
)(App)
