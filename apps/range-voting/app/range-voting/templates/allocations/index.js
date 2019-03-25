import ConfigureVotingName from './ConfigureVotingName'
import ConfigureVotingConditions from './ConfigureVotingConditions'
import ConfigureVotingDefaults from './ConfigureVotingDefaults'
import icon from './assets/icon.svg'
import {
  votePermissionItems,
  voteWeightItems,
  voteOutcomeItems,
} from './voting-conditions'

const isIntegerString = value => /^\d*$/.test(value)
const template = {
  name: 'allocations',
  label: 'Allocations',
  description: 'Determine how to share a budget across multiple projects',
  icon,
  fields: {
    voteName: {
      defaultValue: () => '',
      filter: value => ({ voteName: value.slice(0, 30) }),
    },
    voteDescription: {
      defaultValue: () => '',
      filter: value => ({ voteDescription: value }),
    },
    votePermission: {
      defaultValue: () => 0,
      items: votePermissionItems,
      filter: value => {
        if (!isIntegerString(value)) {
          return { votePermission: 0 }
        }
        if (value < 0 || value >= votePermissionItems.length) {
          return { votePermission: 0 }
        }
        return { votePermission: value }
      },
    },
    voteWeight: {
      defaultValue: () => 0,
      items: voteWeightItems,
      filter: value => {
        if (!isIntegerString(value)) {
          return { voteWeight: 0 }
        }
        if (value < 0 || value >= voteWeightItems.length) {
          return { voteWeight: 0 }
        }
        return { voteWeight: value }
      },
    },
    voteOutcome: {
      defaultValue: () => 0,
      items: voteOutcomeItems,
      filter: value => {
        if (!isIntegerString(value)) {
          return { voteOutcome: 0 }
        }
        if (value < 0 || value >= voteOutcomeItems.length) {
          return { voteOutcome: 0 }
        }
        return { voteOutcome: value }
      },
    },
    support: {
      defaultValue: () => -1,
      filter: (value, { minQuorum }) => {
        if (!isIntegerString(value)) {
          return { support: -1 }
        }
        const intValue = parseInt(value, 10)
        const support = isNaN(intValue) ? -1 : Math.min(100, Math.max(1, value))
        return {
          support,
          minQuorum: support < minQuorum ? support : minQuorum,
        }
      },
    },
    minQuorum: {
      defaultValue: () => -1,
      filter: (value, { support }) => {
        if (!isIntegerString(value)) {
          return { minQuorum: -1 }
        }
        const intValue = parseInt(value, 10)
        const minQuorum = isNaN(intValue)
          ? -1
          : Math.min(100, Math.max(0, value))
        return {
          minQuorum,
          support: support < minQuorum ? minQuorum : support,
        }
      },
    },
    voteDuration: {
      defaultValue: () => -1,
      filter: value => {
        if (!isIntegerString(value) || value === '') {
          return { voteDuration: -1 }
        }
        const voteDuration = parseInt(value, 10)
        if (isNaN(voteDuration)) {
          return null
        }
        if (voteDuration > Number.MAX_SAFE_INTEGER) {
          return null
        }
        return {
          voteDuration: Math.max(1, value),
        }
      },
    },
  },
  screens: [
    {
      screen: 'voting-name',
      validate: ({ voteName, voteDescription }) => {
        // votes names should probably be unique
        if (voteName === '' || voteDescription === '') {
          return false
        }
        return true
      },
      Component: ConfigureVotingName,
    },
    {
      screen: 'voting-conditions',
      validate: () => {
        // needs adding
        return true
      },
      Component: ConfigureVotingConditions,
    },
    {
      screen: 'voting-defaults',
      validate: ({ support, minQuorum, voteDuration }) => {
        if (support < 1 || support > 100) {
          return false
        }
        if (minQuorum < 0 || minQuorum > 100) {
          return false
        }
        if (voteDuration < 1) {
          return false
        }
        return true
      },
      Component: ConfigureVotingDefaults,
    },
  ],
  prepareData: ({
    voteName,
    voteDescription,
    support,
    minQuorum,
    voteDuration,
    votePermission,
    voteWeight,
    voteOutcome,
  }) => {
    return {
      voteName: voteName,
      voteDescription: voteDescription,
      supportNeeded: support,
      minAcceptanceQuorum: minQuorum,
      voteDuration: voteDuration,
      votePermission: votePermission,
      votePermissionText: votePermissionItems[votePermission],
      voteWeight: voteWeight,
      voteWeightText: voteWeightItems[voteWeight],
      voteOutcome: voteOutcome,
      voteOutcomeText: voteOutcomeItems[voteOutcome],
    }
  },
}

export default template
