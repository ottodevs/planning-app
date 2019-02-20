import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { IconAdd, theme } from '@aragon/ui'
import MultiDropDown from './MultiDropdown'
import IconRemove from '../../../assets/components/IconRemove'

const OptionsInputDropdown = ({
  activeItem,
  entities,
  input,
  name,
  onChange,
  validator,
  value,
}) => {
  const addOption = () => {
    // TODO: Implement some rules about what an 'Option can be' duplicates, etc
    if (input && !validator(value, input.addr)) {
      onChange({ target: { name, value: [...value, input] } })
      onChange({
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
      onChange({ target: { name: 'addressError', value: true } })
      // console.log(
      //   'OptionsInputDropdown: The option is empty or already present'
      // )
    }
  }

  const removeOption = option => {
    let index = value.indexOf(option)
    !value.splice(index, 1) &&
      onChange({
        target: { name, value },
      })
    // console.log('Option Removed', option, value)
  }

  const loadOptions = value.map((option, index) => (
    <div className="option" key={option.addr}>
      <MultiDropDown
        name={name}
        index={index}
        // placeholder={placeholder}
        onChange={onChange}
        value={value}
        entities={entities}
        activeItem={value[index].index}
        validator={validator}
      />
      <IconRemove onClick={() => removeOption(option)} />
    </div>
  ))

  return (
    <StyledOptionsInput empty={!input.length}>
      {loadOptions}
      <div className="option">
        <MultiDropDown
          name={'optionsInput'}
          index={-1}
          // placeholder={placeholder}
          value={value}
          onChange={onChange}
          entities={entities}
          activeItem={activeItem}
          validator={validator}
        />
        <IconAdd onClick={addOption} />
      </div>
    </StyledOptionsInput>
  )
}

OptionsInputDropdown.propTypes = {
  input: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  activeItem: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  validator: PropTypes.func.isRequired,
  entities: PropTypes.object,
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
      color: ${theme.textSecondary};
      vertical-align: middle;
      transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
      :hover {
        color: ${({ empty }) =>
          empty ? theme.disabled : theme.contentBorderActive};
      }
      :active {
        color: ${({ empty }) =>
          empty ? theme.disabled : theme.contentBackgroundActive};
      }
    }
  }
`
// TODO: fix empty svg cursor and color:
/* cursor: ${({ empty }) => (empty ? 'not-allowed' : 'pointer')}; */
// color: ${({ empty }) => (empty ? disabled : textSecondary)};
export default OptionsInputDropdown
