import { getBooleanInput, info } from '@actions/core'
import { saveCaches } from './cache/cache'
const shouldCache = getBooleanInput('cache', { required: false })

const main = async () => {
  if (!shouldCache) {
    info("Caching disabled; skipping save step.")
    return
  }

  await saveCaches()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})