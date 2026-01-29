import { getInput } from '@actions/core'
const version = getInput('version', { required: true })
const config = getInput('config', { required: false })
const configPath = getInput('config-path', { required: false })

export default () => {
  if (version !== 'latest' && !version.match(/^v\d+\.\d+\.\d+$/)) {
    throw new Error('Version must be "latest" or in format "vX.Y.Z"')
  }

  if (config && configPath) {
    throw new Error('Both "config" and "config-path" inputs cannot be set at the same time')
  }

  return true
}