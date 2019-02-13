import React from 'react'

import ethereumLoadingAnimation from '../../assets/svg/ethereum-loading.svg'

const Loading = () => {
  const centered = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  return (
    <div style={centered}>
      <img src={ethereumLoadingAnimation} />
      Loading...
    </div>
  )
}

export default Loading
