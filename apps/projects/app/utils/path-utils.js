const PATH_REGEX = /^\/(settings|issues)(?:\/([a-zA-Z0-9]{23})(?:\/(application|work)(?:\/([0-9]+)))?)?(?:\/)?$/

// TODO: Create filterSet path
// const filterSetFromPath = path => {}

const fromPath = path => {
  const [ , tab, issueId, panel, submissionId ] = path.match(PATH_REGEX) || []
  
  // TODO: In case the tab is issue detail, call filterSetFromPath here

  // Any undefined return must be considered non-matched for the passed path
  return { issueId, panel, submissionId, tab }
}

export { fromPath }