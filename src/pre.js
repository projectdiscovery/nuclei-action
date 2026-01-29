import { restoreCache } from '@actions/cache'
import { getBooleanInput, info } from '@actions/core'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { getPlatform } from './utils'
const shouldCache = getBooleanInput('cache', { required: false })

const main = async () => {
  if (!shouldCache) {
    info("Caching disabled; skipping restore step.")
    return
  }

  const homeDir = homedir()
  const platform = getPlatform()

  // Restore nuclei cache

  const basePaths = [
    join(homeDir, '.config', 'nuclei'),
    join(homeDir, '.cache', 'nuclei')
  ]

  try {
    await restoreCache(basePaths, `nuclei-action-${platform.os}-${platform.arch}`)
  } catch (error) {
    // Ignore cache restore failures
  }

  // Restore nuclei-templates cache

  const templatesConfigPath = join(homeDir, '.config', 'nuclei', '.templates-config.json')
  if (existsSync(templatesConfigPath)) {
    try {
      const rawConfig = readFileSync(templatesConfigPath, { encoding: 'utf8' })
      const templatesConfig = JSON.parse(rawConfig)
      const templatesDir = templatesConfig['nuclei-templates-directory']

      if (templatesDir) {
        await restoreCache([templatesDir], `nuclei-templates-${platform.os}-${platform.arch}`)
      }
    } catch (error) {
      // Ignore invalid config and skip restoring templates
    }
  }

  // Restore rod browser cache

  const rodBrowserPath = join(homeDir, '.cache', 'rod', 'browser')
  try {
    await restoreCache([rodBrowserPath], `rod-browser-${platform.os}-${platform.arch}`)
  } catch (error) {
    // Ignore cache restore failures
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
