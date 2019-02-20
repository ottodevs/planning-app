import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { IconAdd, theme } from '@aragon/ui'
import MultiDropDown from './MultiDropdown'
import IconRemove from '../../../assets/components/IconRemove'

const {
  disabled,
  contentBackgroundActive,
  contentBorderActive,
  // contentBorder,
  textSecondary,
} = theme

class OptionsInputDropdown extends React.Component {
  static propTypes = {
    input: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.array.isRequired,
    activeItem: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    validator: PropTypes.func.isRequired,
    entities: PropTypes.object,
  }

  state = {
    entities: this.props.entities,
  }

  addOption = () => {
    // TODO: Implement some rules about what an 'Option can be' duplicates, etc
    const { input, name, value } = this.props
    if (input && !this.props.validator(value, input.addr)) {
      this.props.onChange({ target: { name, value: [...value, input] } })
      this.props.onChange({
        target: {
          name: 'optionsInput',
          value: {
            addr: 0,
            index: 0,
          },
        },
      })
      // console.log('Option Added')
    } else {
      this.props.onChange({ target: { name: 'addressError', value: true } })
      console.log(
        'OptionsInputDropdown: The option is empty or already present'
      )
    }
  }

  removeOption = option => {
    const { name, value } = this.props
    let index = value.indexOf(option)
    // Double exclamation to make sure is removed
    !!value.splice(index, 1) &&
      this.props.onChange({
        target: { name, value },
      })
    // console.log('Option Removed', option, value)
  }

  render() {
    const loadOptions = this.props.value.map((option, index) => (
      <div className="option" key={option.addr}>
        <MultiDropDown
          name={this.props.name}
          index={index}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          value={this.props.value}
          entities={this.state.entities}
          activeItem={this.props.value[index].index}
          validator={this.props.validator}
        />
        <IconRemove onClick={() => this.removeOption(option)} />
      </div>
    ))
    return (
      <StyledOptionsInput empty={!this.props.input.length}>
        {loadOptions}
        <div className="option">
          <MultiDropDown
            name={'optionsInput'}
            index={-1}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
            entities={this.state.entities}
            activeItem={this.props.activeItem}
            validator={this.props.validator}
          />
          <IconAdd onClick={this.addOption} />
        </div>
      </StyledOptionsInput>
    )
  }
}

// const StyledInput = styled(TextInput)`
//   ${unselectable}; /* it is possible to select the placeholder without this */
//   ::placeholder {
//     color: ${theme.contentBorderActive};
//   }
//   :focus {
//     border-color: ${contentBorderActive};
//     ::placeholder {
//       color: ${contentBorderActive};
//     }
//   }
//   :read-only {
//     cursor: default;
//     :focus {
//       border-color: ${contentBorder};
//     }
//   }
// `

const StyledOptionsInput = styled.div`
  display: flex;
  flex-direction: column;
  > .option {
    display: flex;
    margin-bottom: 0.625rem;
    > :first-child {
      flex-grow: 1;
    }
    > svg {
      margin-left: 3px;
      margin-top: -3px;
      height: auto;
      width: 1.8rem;
      color: ${textSecondary};
      vertical-align: middle;
      transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
      :hover {
        color: ${({ empty }) => (empty ? disabled : contentBorderActive)};
      }
      :active {
        color: ${({ empty }) => (empty ? disabled : contentBackgroundActive)};
      }
    }
  }
`
// TODO: fix empty svg cursor and color:
/* cursor: ${({ empty }) => (empty ? 'not-allowed' : 'pointer')}; */
// color: ${({ empty }) => (empty ? disabled : textSecondary)};
export default OptionsInputDropdown
