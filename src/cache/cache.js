import { restoreCache, saveCache } from '@actions/cache'
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, posix, win32 } from 'node:path'
import { getPlatform } from '../utils'

function getNucleiPaths(homeDir, env = process.env, platform = process.platform) {
  const paths = platform === 'win32' ? win32 : posix

  let dataHome
  let stateHome
  let cacheHome
  let dataDirs

  if (platform === 'darwin') {
    const applicationSupport = paths.join(homeDir, 'Library', 'Application Support')
    dataHome = applicationSupport
    stateHome = applicationSupport
    cacheHome = paths.join(homeDir, 'Library', 'Caches')
    dataDirs = ['/Library/Application Support', paths.join(homeDir, '.local', 'share')]
  } else if (platform === 'win32') {
    const localAppData = env.LOCALAPPDATA || paths.join(homeDir, 'AppData', 'Local')
    dataHome = localAppData
    stateHome = localAppData
    cacheHome = paths.join(localAppData, 'cache')
    dataDirs = [
      env.APPDATA || paths.join(homeDir, 'AppData', 'Roaming'),
      env.ProgramData || 'C:\\ProgramData'
    ]
  } else {
    dataHome = paths.join(homeDir, '.local', 'share')
    stateHome = paths.join(homeDir, '.local', 'state')
    cacheHome = paths.join(homeDir, '.cache')
    dataDirs = ['/usr/local/share', '/usr/share']
  }

  dataHome = getXDGPath(env.XDG_DATA_HOME, dataHome, homeDir, paths, platform)
  stateHome = getXDGPath(env.XDG_STATE_HOME, stateHome, homeDir, paths, platform)
  cacheHome = getXDGPath(env.XDG_CACHE_HOME, cacheHome, homeDir, paths, platform)
  dataDirs = getXDGPathList(env.XDG_DATA_DIRS, dataDirs, homeDir, paths, platform)

  return {
    paths,
    stateDir: paths.join(stateHome, 'nuclei'),
    cacheDir: paths.join(cacheHome, 'nuclei'),
    dataHome,
    dataDirs
  }
}

function getXDGPath(value, fallback, homeDir, paths, platform) {
  const expanded = expandHome(value, homeDir, paths, platform)
  return expanded && paths.isAbsolute(expanded) ? expanded : fallback
}

function getXDGPathList(value, fallback, homeDir, paths, platform) {
  const configured = (value || '')
    .split(paths.delimiter)
    .map((path) => expandHome(path, homeDir, paths, platform))
    .filter((path) => paths.isAbsolute(path))

  return configured.length > 0 ? [...new Set(configured)] : fallback
}

function expandHome(value, homeDir, paths, platform) {
  if (!value) {
    return value
  }

  if (platform === 'win32' && value.startsWith('%USERPROFILE%')) {
    return paths.join(homeDir, value.slice('%USERPROFILE%'.length))
  }
  if (platform !== 'win32' && value.startsWith('~')) {
    return paths.join(homeDir, value.slice(1))
  }
  if (platform !== 'win32' && value.startsWith('$HOME')) {
    return paths.join(homeDir, value.slice('$HOME'.length))
  }

  return value
}

export function getBasePaths(homeDir, env = process.env, platform = process.platform) {
  const { paths, stateDir, cacheDir } = getNucleiPaths(homeDir, env, platform)
  return [paths.join(stateDir, 'templates.json'), cacheDir]
}

function readTemplatesDir(statePath) {
  try {
    const rawState = readFileSync(statePath, { encoding: 'utf8' })
    const state = JSON.parse(rawState)

    const templatesDir = state['nuclei-templates-directory']
    return typeof templatesDir === 'string' && templatesDir ? templatesDir : null
  } catch (error) {
    return null
  }
}

export function getTemplatesDir(homeDir, env = process.env, platform = process.platform) {
  const { paths, stateDir, dataHome, dataDirs } = getNucleiPaths(homeDir, env, platform)
  if (env.NUCLEI_TEMPLATES_DIR) {
    return env.NUCLEI_TEMPLATES_DIR
  }

  const statePath = paths.join(stateDir, 'templates.json')
  if (existsSync(statePath)) {
    return readTemplatesDir(statePath)
  }

  const userRoot = paths.join(dataHome, 'nuclei', 'nuclei-templates')
  const templateRoots = [
    userRoot,
    ...dataDirs.map((dir) => paths.join(dir, 'nuclei', 'nuclei-templates'))
  ]
  for (const root of templateRoots) {
    try {
      if (existsSync(root)) {
        return statSync(root).isDirectory() ? root : null
      }
    } catch (error) {
      return null
    }
  }

  return userRoot
}

export function getTemplatesDirForSave(homeDir, env = process.env, platform = process.platform) {
  const { paths, stateDir } = getNucleiPaths(homeDir, env, platform)
  const statePath = paths.join(stateDir, 'templates.json')
  if (existsSync(statePath)) {
    const templatesDir = readTemplatesDir(statePath)
    if (templatesDir) {
      return templatesDir
    }
  }

  return getTemplatesDir(homeDir, env, platform)
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
  const templatesDir = getTemplatesDirForSave(homeDir)

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
