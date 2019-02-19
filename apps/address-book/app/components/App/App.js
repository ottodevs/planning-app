import { AragonApp, observe, SidePanel } from '@aragon/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Entities from './Entities'
import NewEntityButton from './NewEntityButton'
import NewEntity from '../Panel/NewEntity'
import { Title } from '../Shared'

const ASSETS_URL = 'aragon-ui-assets/'

class App extends React.Component {
  static propTypes = {
    app: PropTypes.object.isRequired,
    // TODO: Shape and use this or remove
    // entities: PropTypes.arrayOf(PropTypes.object),
  }

  state = {
    panelVisible: false,
  }

  createEntity = entity => {
    this.props.app.addEntry(entity.address, entity.name, entity.type)
    this.closePanel()
  }

  removeEntity = address => {
    this.props.app.removeEntry(address)
  }

  newEntity = () => {
    this.setState({
      panelVisible: true,
    })
  }

  closePanel = () => {
    this.setState({ panelVisible: false })
  }

  render() {
    const { panelVisible } = this.state
    const { entries } = this.props

    return (
      <StyledAragonApp>
        <Title text="Address Book" />
        <NewEntityButton onClick={this.newEntity} />

        <ScrollWrapper>
          <Content>
            <Entities
              entities={entries || []}
              onNewEntity={this.newEntity}
              onRemoveEntity={this.removeEntity}
            />
          </Content>
        </ScrollWrapper>

        <SidePanel
          title="New entity"
          opened={panelVisible}
          onClose={this.closePanel}
        >
          <NewEntity onCreateEntity={this.createEntity} />
        </SidePanel>
      </StyledAragonApp>
    )
  }
}

const StyledAragonApp = styled(AragonApp).attrs({
  publicUrl: ASSETS_URL,
})`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
`
const ScrollWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  overflow: auto;
  flex-grow: 1;
`
const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  flex-grow: 1;
`
export default observe(
  observable => observable.map(state => ({ ...state })),
  {}
)(App)
