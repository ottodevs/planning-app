import PropTypes from 'prop-types'
import React from 'react'

import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo-hooks'

// import here individual minor components

// TODO: extract and import the css layout style components here
import styled from 'styled-components'

import {
  AppBar,
  AppView,
  BaseStyles,
  BreakPoint,
  breakpoint,
  font,
  NavigationBar,
  observe,
  PublicUrl,
} from '@aragon/ui'

export const GET_ISSUE = gql`
  query getIssueById($id: ID!) {
    node(id: $id) {
      ... on Issue {
        title
        repository {
          name
        }
        number
      }
    }
  }
`

const mock = {
  data: {
    description: 'hello',
  },
  // error: {
  //   errormsg: 'wowow'
  // }
}

const IssueDetail = props => {
  console.log('issue detail props:', props)
  const {
    issue: { id },
  } = props
  const { data, loading, error } = useQuery(GET_ISSUE, {
    variables: { id },
  })

  if (error) {
    return <div>Errror! {error}</div>
  }

  if (loading) {
    return <div>Loading!</div>
  }
  console.log('before return:', props, id, data, error, data.node.title)
  return (
    <React.Fragment>
      <div>
        Hello
        {/* Hello issue detail {JSON.stringify(props)} */}
        {/* <div>DATA: {data.node.title}</div> */}
      </div>
      }
    </React.Fragment>
  )
}

export default IssueDetail
