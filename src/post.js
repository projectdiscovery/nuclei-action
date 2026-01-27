const cache = require('@actions/cache')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const utils = require('./utils')

const main = async () => {
  const homeDir = os.homedir()
  const platform = utils.getPlatform()

  // Cache nuclei directories

  const basePaths = [
    path.join(homeDir, '.config', 'nuclei'),
    path.join(homeDir, '.cache', 'nuclei')
  ].filter((cachePath) => fs.existsSync(cachePath))

  if (basePaths.length > 0) {
    await cache.saveCache(basePaths, `nuclei-action-${platform.os}-${platform.arch}`)
  }

  // Cache nuclei-templates directory

  const templatesConfigPath = path.join(homeDir, '.config', 'nuclei', '.templates-config.json')
  if (fs.existsSync(templatesConfigPath)) {
    try {
      const rawConfig = fs.readFileSync(templatesConfigPath, { encoding: 'utf8' })
      const templatesConfig = JSON.parse(rawConfig)
      const templatesDir = templatesConfig['nuclei-templates-directory']

      if (templatesDir && fs.existsSync(templatesDir)) {
        await cache.saveCache([templatesDir], `nuclei-templates-${platform.os}-${platform.arch}`)
      }
    } catch (error) {
      // Ignore invalid config and skip caching templates.
    }
  }

  // Clean up stale rod browsers & cache the latest one

  const rodBrowserPath = path.join(homeDir, '.cache', 'rod', 'browser')
  if (fs.existsSync(rodBrowserPath)) {
    try {
      const entries = fs.readdirSync(rodBrowserPath, { withFileTypes: true })
      const chromiumDirs = entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium-'))
        .map((entry) => ({
          name: entry.name,
          mtime: fs.statSync(path.join(rodBrowserPath, entry.name)).mtimeMs
        }))
        .sort((a, b) => b.mtime - a.mtime)

      if (chromiumDirs.length > 1) {
        const staleDirs = chromiumDirs.slice(1)
        for (const stale of staleDirs) {
          fs.rmSync(path.join(rodBrowserPath, stale.name), { recursive: true, force: true })
        }
      }

      await cache.saveCache([rodBrowserPath], `rod-browser-${platform.os}-${platform.arch}`)
    } catch (error) {
      // Ignore cache save failures
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})