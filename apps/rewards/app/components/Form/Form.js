import PropTypes from 'prop-types'
import React from 'react'
import { Button, Text, theme } from '@aragon/ui'

const Form = ({
  children,
  onSubmit,
  submitText,
  heading,
  subHeading,
  separator,
  submitDisabled,
}) => {
  return (
    // TODO: Fix the SidePanel 2 lines heading thing
    <React.Fragment>
      {heading && <Text size="xxlarge">{heading}</Text>}
      {subHeading && <Text color={theme.textTertiary}>{subHeading}</Text>}
      {separator && <div style={{ height: '1rem' }} />}
      {children}
      <Button
        style={{ userSelect: 'none' }}
        mode="strong"
        wide
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        {submitText}
      </Button>
    </React.Fragment>
  )
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  heading: PropTypes.string,
  separator: PropTypes.bool,
  subHeading: PropTypes.string,
  submitDisabled: PropTypes.bool,
}

Form.defaultProps = {
  separator: false,
  submitText: 'Submit',
  submitDisabled: false,
}

export default Form
