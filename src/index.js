const dl = require('./download')
const exec = require('./exec')
const validate = require('./validate')
const core = require('@actions/core')
const installOnly = core.getBooleanInput('install-only', { required: false })

const main = async () => {
  if (!installOnly) {
    core.startGroup("Validating inputs")
    try {
      validate()
    } catch (error) {
      core.setFailed(error.message)
      core.endGroup()
      process.exit(1)
    }
    core.endGroup()
  }

  core.startGroup("Downloading Nuclei")
  try {
    await dl()
  } catch (error) {
    core.setFailed(error.message)
    core.endGroup()
    process.exit(1)
  }
  core.endGroup()

  if (installOnly) {
    core.info("Installation only; skipping execution step.")
    return
  }

  core.startGroup("Executing Nuclei")
  try {
    await exec()
  } catch (error) {
    core.setFailed(error.message)
    core.endGroup()
    process.exit(1)
  }
  core.endGroup()
}

main().catch((error) => {
  core.setFailed(error.message)
  process.exit(1)
})