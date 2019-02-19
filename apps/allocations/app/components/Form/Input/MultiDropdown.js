import PropTypes from 'prop-types'
import React from 'react'
import { DropDown } from '@aragon/ui'

class MultiDropdown extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    entities: PropTypes.object,
    value: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    activeItem: PropTypes.number.isRequired,
    validator: PropTypes.func.isRequired,
  }

  onChangeInput = (index, items) => {
    const { name, value, entities } = this.props
    let newValue = {
      addr: entities[index].addr,
      index: index,
    }
    if (this.props.validator(value, newValue.addr)) {
      this.props.onChange({ target: { name: 'addressError', value: true } })
    } else {
      this.props.onChange({ target: { name: 'addressError', value: false } })
    }
    this.setState({ activeItem: index })
    if (name === 'optionsInput') {
      this.props.onChange({ target: { name: 'optionsInput', value: newValue } })
    } else {
      value[this.props.index] = newValue
      this.props.onChange({ target: { name, value: value } })
    }
  }

  nameWrapper = name => <span style={{ whiteSpace: 'normal' }}>{name}</span>

  render() {
    return (
      <DropDown
        items={this.props.entities.map(entity =>
          this.nameWrapper(entity.data.name)
        )}
        active={this.props.activeItem}
        onChange={this.onChangeInput}
        wide
      />
    )
  }
}

export default MultiDropdown
