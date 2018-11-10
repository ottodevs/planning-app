import React from 'react'
import { mount } from 'enzyme'
import { App } from '../../app/components/App'

describe('App', () => {
  it('renders projects app', () => {
    const wrapper = mount(<App />)
    expect(wrapper.find('#root').text()).toContain('Projects')
  })
})
