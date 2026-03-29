import { restoreCache, saveCache } from '@actions/cache'
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { getPlatform } from '../utils'

function getBasePaths(homeDir) {
  return [
    join(homeDir, '.config', 'nuclei'),
    join(homeDir, '.cache', 'nuclei')
  ]
}

function getTemplatesDir(homeDir) {
  const templatesConfigPath = join(homeDir, '.config', 'nuclei', '.templates-config.json')

  if (!existsSync(templatesConfigPath)) {
    return null
  }

  try {
    const rawConfig = readFileSync(templatesConfigPath, { encoding: 'utf8' })
    const templatesConfig = JSON.parse(rawConfig)

    return templatesConfig['nuclei-templates-directory'] || null
  } catch (error) {
    return null
  }
}

async function restoreBaseCache(homeDir, cacheKeyPrefix) {
  try {
    await restoreCache(getBasePaths(homeDir), cacheKeyPrefix)
  } catch (error) {
    // Ignore cache restore failures.
  }
}

async function restoreTemplatesCache(homeDir, cacheKeyPrefix) {
  const templatesDir = getTemplatesDir(homeDir)

  if (!templatesDir) {
    return
  }

  try {
    await restoreCache([templatesDir], cacheKeyPrefix)
  } catch (error) {
    // Ignore cache restore failures.
  }
}

async function restoreRodBrowserCache(homeDir, cacheKeyPrefix) {
  const rodBrowserPath = join(homeDir, '.cache', 'rod', 'browser')

  try {
    await restoreCache([rodBrowserPath], cacheKeyPrefix)
  } catch (error) {
    // Ignore cache restore failures.
  }
}

async function saveBaseCache(homeDir, cacheKeyPrefix) {
  const basePaths = getBasePaths(homeDir).filter((cachePath) => existsSync(cachePath))

  if (basePaths.length === 0) {
    return
  }

  await saveCache(basePaths, cacheKeyPrefix)
}

async function saveTemplatesCache(homeDir, cacheKeyPrefix) {
  const templatesDir = getTemplatesDir(homeDir)

  if (!templatesDir || !existsSync(templatesDir)) {
    return
  }

  await saveCache([templatesDir], cacheKeyPrefix)
}

async function saveRodBrowserCache(homeDir, cacheKeyPrefix) {
  const rodBrowserPath = join(homeDir, '.cache', 'rod', 'browser')

  if (!existsSync(rodBrowserPath)) {
    return
  }

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
      for (const stale of chromiumDirs.slice(1)) {
        rmSync(join(rodBrowserPath, stale.name), { recursive: true, force: true })
      }
    }

    await saveCache([rodBrowserPath], cacheKeyPrefix)
  } catch (error) {
    // Ignore cache save failures.
  }
}

export async function restoreCaches() {
  const homeDir = homedir()
  const { os, arch } = getPlatform()

  await restoreBaseCache(homeDir, `nuclei-action-${os}-${arch}`)
  await restoreTemplatesCache(homeDir, `nuclei-templates-${os}-${arch}`)
  await restoreRodBrowserCache(homeDir, `rod-browser-${os}-${arch}`)
}

export async function saveCaches() {
  const homeDir = homedir()
  const { os, arch } = getPlatform()

  await saveBaseCache(homeDir, `nuclei-action-${os}-${arch}`)
  await saveTemplatesCache(homeDir, `nuclei-templates-${os}-${arch}`)
  await saveRodBrowserCache(homeDir, `rod-browser-${os}-${arch}`)
}