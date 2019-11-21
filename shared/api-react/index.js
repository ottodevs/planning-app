import {
  AragonApi,
  useAragonApi as useProductionApi,
  useNetwork as useProductionNetwork,
} from '@aragon/api-react'
// TODO: This is importing the root @aragon/api-react so it is causing errors if the aragon/api-react version is not hoisted
// the current implementation seems too brittle to be used

export default ({ initialState = {}, functions = (() => {}) }) => {
  let useAragonApi = useProductionApi
  let useNetwork = useProductionNetwork

  if (process.env.NODE_ENV !== 'production') {
    const inIframe = () => {
      try {
        return window.self !== window.top
      } catch (e) {
        return true
      }
    }

    if (!inIframe()) {
      useAragonApi = require('./useStubbedApi')({ initialState, functions })
      useNetwork = require('./useStubbedNetwork')
    }
  }

  return { AragonApi, useAragonApi, useNetwork }
}
