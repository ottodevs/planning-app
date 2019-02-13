import React from 'react'
import { BaseStyles, PublicUrl } from '@aragon/ui'
import { ASSETS_URL } from '../utils/constants'

const AragonStyles = ({ children }) => {
  return (
    <PublicUrl.Provider url={ASSETS_URL}>
      <BaseStyles />
      {children}
    </PublicUrl.Provider>
  )
}

export default AragonStyles
