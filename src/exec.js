import { getInput, isDebug, setOutput } from '@actions/core'
import { exec as _exec } from '@actions/exec'
import { writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArgsStringToArgv } from 'string-argv'
const config = getInput('config', { required: false })
const configPath = getInput('config-path', { required: false })
const args = getInput('args', { required: false })

export default async () => {
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
    tmpFilePath = join(tmpdir(), tmpFileName)
    writeFileSync(tmpFilePath, config, { encoding: 'utf8' })
    execArgs.push('-config', tmpFilePath)
  }

  if (configPath) {
    execArgs.push('-config', configPath)
  }

  if (args) {
    execArgs.push(...parseArgsStringToArgv(args))
  }

  if (isDebug()) {
    execArgs.push('-debug')
    execArgs.push('-verbose')
  }

  try {
    await _exec('nuclei', execArgs, execOpts)
  } finally {
    if (tmpFilePath && existsSync(tmpFilePath)) {
      unlinkSync(tmpFilePath)
    }
  }

  setOutput('stdout', stdout)
  setOutput('stderr', stderr)
}