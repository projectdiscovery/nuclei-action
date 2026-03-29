import { getBooleanInput, info } from '@actions/core'
import { restoreCaches } from './cache/cache'
const shouldCache = getBooleanInput('cache', { required: false })

const main = async () => {
  if (!shouldCache) {
    info("Caching disabled; skipping restore step.")
    return
  }

  await restoreCaches()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
