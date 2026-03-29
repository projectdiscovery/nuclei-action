import { info } from '@actions/core'

const main = async () => {
  info('Nuclei cache action active; restore runs before this step and save runs after the job completes.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})