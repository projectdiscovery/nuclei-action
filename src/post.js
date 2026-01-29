import { saveCache } from '@actions/cache'
import { getBooleanInput, info } from '@actions/core'
import { existsSync, readFileSync, readdirSync, statSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { getPlatform } from './utils'
const shouldCache = getBooleanInput('cache', { required: false })

const main = async () => {
  if (!shouldCache) {
    info("Caching disabled; skipping save step.")
    return
  }

  const homeDir = homedir()
  const platform = getPlatform()

  // Cache nuclei directories

  const basePaths = [
    join(homeDir, '.config', 'nuclei'),
    join(homeDir, '.cache', 'nuclei')
  ].filter((cachePath) => existsSync(cachePath))

  if (basePaths.length > 0) {
    await saveCache(basePaths, `nuclei-action-${platform.os}-${platform.arch}`)
  }

  // Cache nuclei-templates directory

  const templatesConfigPath = join(homeDir, '.config', 'nuclei', '.templates-config.json')
  if (existsSync(templatesConfigPath)) {
    try {
      const rawConfig = readFileSync(templatesConfigPath, { encoding: 'utf8' })
      const templatesConfig = JSON.parse(rawConfig)
      const templatesDir = templatesConfig['nuclei-templates-directory']

      if (templatesDir && existsSync(templatesDir)) {
        await saveCache([templatesDir], `nuclei-templates-${platform.os}-${platform.arch}`)
      }
    } catch (error) {
      // Ignore invalid config and skip caching templates.
    }
  }

  // Clean up stale rod browsers & cache the latest one

  const rodBrowserPath = join(homeDir, '.cache', 'rod', 'browser')
  if (existsSync(rodBrowserPath)) {
    try {
      const entries = readdirSync(rodBrowserPath, { withFileTypes: true })
      const chromiumDirs = entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium-'))
        .map((entry) => ({
          name: entry.name,
          mtime: statSync(join(rodBrowserPath, entry.name)).mtimeMs
        }))
        .sort((a, b) => b.mtime - a.mtime)

      if (chromiumDirs.length > 1) {
        const staleDirs = chromiumDirs.slice(1)
        for (const stale of staleDirs) {
          rmSync(join(rodBrowserPath, stale.name), { recursive: true, force: true })
        }
      }

      await saveCache([rodBrowserPath], `rod-browser-${platform.os}-${platform.arch}`)
    } catch (error) {
      // Ignore cache save failures
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})