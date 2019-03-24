import PropTypes from 'prop-types'
import React from 'react'
import { AppBar, NavigationBar } from '@aragon/ui'

const Navigation = ({ onClose }) => {
  return (
    <AppBar
      title={
        <NavigationBar items={['Projects', 'Issue Detail']} onBack={onClose} />
      }
    />
  )
}

Navigation.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default Navigation
