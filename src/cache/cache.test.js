import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, win32 } from 'node:path'
import { getBasePaths, getTemplatesDir, getTemplatesDirForSave } from './cache'

const testDirs = []

afterEach(() => {
  for (const dir of testDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function makeTestDir() {
  const dir = mkdtempSync(join(tmpdir(), 'nuclei-action-'))
  testDirs.push(dir)
  return dir
}

describe('getBasePaths', () => {
  test('uses the Linux XDG defaults', () => {
    expect(getBasePaths('/home/runner', {}, 'linux')).toEqual([
      '/home/runner/.local/state/nuclei/templates.json',
      '/home/runner/.cache/nuclei'
    ])
  })

  test('uses storage environment overrides', () => {
    const env = {
      NUCLEI_CONFIG_DIR: '/nuclei/config',
      XDG_CONFIG_HOME: '/xdg/config',
      XDG_STATE_HOME: '/xdg/state',
      XDG_CACHE_HOME: '/xdg/cache'
    }

    expect(getBasePaths('/home/runner', env, 'linux')).toEqual([
      '/xdg/state/nuclei/templates.json',
      '/xdg/cache/nuclei'
    ])
  })

  test('uses the platform defaults on macOS and Windows', () => {
    expect(getBasePaths('/Users/runner', {}, 'darwin')).toEqual([
      '/Users/runner/Library/Application Support/nuclei/templates.json',
      '/Users/runner/Library/Caches/nuclei'
    ])

    expect(getBasePaths('C:\\Users\\runner', {}, 'win32')).toEqual([
      win32.join('C:\\Users\\runner', 'AppData', 'Local', 'nuclei', 'templates.json'),
      win32.join('C:\\Users\\runner', 'AppData', 'Local', 'cache', 'nuclei')
    ])
  })
})

describe('getTemplatesDir', () => {
  test('reads the current templates state from XDG_STATE_HOME', () => {
    const root = makeTestDir()
    const stateDir = join(root, 'state', 'nuclei')
    const templatesDir = join(root, 'templates')
    mkdirSync(stateDir, { recursive: true })
    writeFileSync(join(stateDir, 'templates.json'), JSON.stringify({
      'nuclei-templates-directory': templatesDir
    }))

    expect(getTemplatesDir(root, { XDG_STATE_HOME: join(root, 'state') }, 'linux')).toBe(templatesDir)
  })

  test('prefers NUCLEI_TEMPLATES_DIR to stored state', () => {
    const root = makeTestDir()
    const stateDir = join(root, 'state', 'nuclei')
    const templatesDir = join(root, 'templates')
    mkdirSync(stateDir, { recursive: true })
    writeFileSync(join(stateDir, 'templates.json'), JSON.stringify({
      'nuclei-templates-directory': join(root, 'stored-templates')
    }))

    const env = {
      NUCLEI_TEMPLATES_DIR: templatesDir,
      XDG_STATE_HOME: join(root, 'state')
    }
    expect(getTemplatesDir(root, env, 'linux')).toBe(templatesDir)
  })

  test('uses updated state when saving after an environment override', () => {
    const root = makeTestDir()
    const stateDir = join(root, 'state', 'nuclei')
    const envTemplatesDir = join(root, 'environment-templates')
    const stateTemplatesDir = join(root, 'state-templates')
    mkdirSync(stateDir, { recursive: true })
    writeFileSync(join(stateDir, 'templates.json'), JSON.stringify({
      'nuclei-templates-directory': stateTemplatesDir
    }))

    const env = {
      NUCLEI_TEMPLATES_DIR: envTemplatesDir,
      XDG_STATE_HOME: join(root, 'state')
    }
    expect(getTemplatesDir(root, env, 'linux')).toBe(envTemplatesDir)
    expect(getTemplatesDirForSave(root, env, 'linux')).toBe(stateTemplatesDir)
  })

  test('does not read legacy template state', () => {
    const root = makeTestDir()
    const configDir = join(root, 'config', 'nuclei')
    mkdirSync(configDir, { recursive: true })
    writeFileSync(join(configDir, '.templates-config.json'), JSON.stringify({
      'nuclei-templates-directory': join(root, 'legacy-templates')
    }))

    const env = {
      XDG_CONFIG_HOME: join(root, 'config'),
      XDG_STATE_HOME: join(root, 'state'),
      XDG_DATA_HOME: join(root, 'data')
    }
    expect(getTemplatesDir(root, env, 'linux')).toBe(
      join(root, 'data', 'nuclei', 'nuclei-templates')
    )
  })

  test('uses the XDG data-home template root before state exists', () => {
    const root = makeTestDir()
    const dataHome = join(root, 'data')

    expect(getTemplatesDir(root, { XDG_DATA_HOME: dataHome }, 'linux')).toBe(
      join(dataHome, 'nuclei', 'nuclei-templates')
    )
  })

  test('uses an existing XDG data-directory template root', () => {
    const root = makeTestDir()
    const dataDir = join(root, 'system-data')
    const templatesDir = join(dataDir, 'nuclei', 'nuclei-templates')
    mkdirSync(templatesDir, { recursive: true })

    const env = {
      XDG_DATA_HOME: join(root, 'user-data'),
      XDG_DATA_DIRS: dataDir
    }
    expect(getTemplatesDir(root, env, 'linux')).toBe(templatesDir)
  })
})
