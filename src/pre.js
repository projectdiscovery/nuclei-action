const cache = require('@actions/cache')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const utils = require('./utils')

const main = async () => {
  const homeDir = os.homedir()
  const platform = utils.getPlatform()

  // Restore nuclei cache

  const basePaths = [
    path.join(homeDir, '.config', 'nuclei'),
    path.join(homeDir, '.cache', 'nuclei')
  ]

  try {
    await cache.restoreCache(basePaths, `nuclei-action-${platform.os}-${platform.arch}`)
  } catch (error) {
    // Ignore cache restore failures
  }

  // Restore nuclei-templates cache

  const templatesConfigPath = path.join(homeDir, '.config', 'nuclei', '.templates-config.json')
  if (fs.existsSync(templatesConfigPath)) {
    try {
      const rawConfig = fs.readFileSync(templatesConfigPath, { encoding: 'utf8' })
      const templatesConfig = JSON.parse(rawConfig)
      const templatesDir = templatesConfig['nuclei-templates-directory']

      if (templatesDir) {
        await cache.restoreCache([templatesDir], `nuclei-templates-${platform.os}-${platform.arch}`)
      }
    } catch (error) {
      // Ignore invalid config and skip restoring templates
    }
  }

  // Restore rod browser cache

  const rodBrowserPath = path.join(homeDir, '.cache', 'rod', 'browser')
  try {
    await cache.restoreCache([rodBrowserPath], `rod-browser-${platform.os}-${platform.arch}`)
  } catch (error) {
    // Ignore cache restore failures
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
