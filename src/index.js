import dl from './download'
import exec from './exec'
import validate from './validate'
import { getBooleanInput, startGroup, setFailed, endGroup, info } from '@actions/core'
const installOnly = getBooleanInput('install-only', { required: false })

const main = async () => {
  if (!installOnly) {
    startGroup("Validating inputs")
    try {
      validate()
    } catch (error) {
      setFailed(error.message)
      endGroup()
      process.exit(1)
    }
    endGroup()
  }

  startGroup("Downloading Nuclei")
  try {
    await dl()
  } catch (error) {
    setFailed(error.message)
    endGroup()
    process.exit(1)
  }
  endGroup()

  if (installOnly) {
    info("Installation only; skipping execution step.")
    return
  }

  startGroup("Executing Nuclei")
  try {
    await exec()
  } catch (error) {
    setFailed(error.message)
    endGroup()
    process.exit(1)
  }
  endGroup()
}

main().catch((error) => {
  setFailed(error.message)
  process.exit(1)
})