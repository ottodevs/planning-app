import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { Project, Empty } from '../Card'

export default class Overview extends React.Component {
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  }
  render() {
    const projectsEmpty = this.props.projects.length === 0
    if (projectsEmpty) {
      return <Empty action={this.props.onNewProject} />
    }
    const projectsMap = this.props.projects.map((project, index) => (
      <Project
        key={index}
        label={project.metadata.name}
        description={project.metadata.description}
        commits={project.metadata.commits}
        contributors={project.metadata.collaborators}
      />
    ))
    return <StyledProjects>{projectsMap}</StyledProjects>
  }
  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
}

const StyledProjects = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-auto-rows: auto;
  grid-gap: 2rem;
  justify-content: start;
  padding: 30px;
`
