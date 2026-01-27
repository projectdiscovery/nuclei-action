const core = require('@actions/core')
const exec = require('@actions/exec')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { parseArgsStringToArgv } = require('string-argv')
const config = core.getInput('config', { required: false })
const configPath = core.getInput('config-path', { required: false })
const args = core.getInput('args', { required: false })

module.exports = async () => {
  let stdout = ''
  let stderr = ''

  const execOpts = {
    cwd: process.env.GITHUB_WORKSPACE || process.cwd(),
    listeners: {
      stdout: (data) => {
        stdout += data.toString()
      },
      stderr: (data) => {
        stderr += data.toString()
      }
    }
  }
  const execArgs = []
  let tmpFilePath

  if (config) {
    const tmpFileName = `nuclei-config-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`
    tmpFilePath = path.join(os.tmpdir(), tmpFileName)
    fs.writeFileSync(tmpFilePath, config, { encoding: 'utf8' })
    execArgs.push('-config', tmpFilePath)
  }

  if (configPath) {
    execArgs.push('-config', configPath)
  }

  if (args) {
    execArgs.push(...parseArgsStringToArgv(args))
  }

  if (core.isDebug()) {
    execArgs.push('-debug')
    execArgs.push('-verbose')
  }

  try {
    await exec.exec('nuclei', execArgs, execOpts)
  } finally {
    if (tmpFilePath && fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath)
    }
  }

  core.setOutput('stdout', stdout)
  core.setOutput('stderr', stderr)
}