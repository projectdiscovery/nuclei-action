const core = require('@actions/core')
const version = core.getInput('version', { required: true })
const config = core.getInput('config', { required: false })
const configPath = core.getInput('config-path', { required: false })

module.exports = () => {
  if (version !== 'latest' && !version.match(/^v\d+\.\d+\.\d+$/)) {
    throw new Error('Version must be "latest" or in format "vX.Y.Z"')
  }

  if (config && configPath) {
    throw new Error('Both "config" and "config-path" inputs cannot be set at the same time')
  }

  return true
}