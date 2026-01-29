import { getInput, debug, notice, addPath, info } from '@actions/core'
import { getOctokit } from '@actions/github'
import { find, downloadTool, extractZip, cacheDir } from '@actions/tool-cache'
import { join } from 'node:path'
import { getPlatform } from './utils'
let version = getInput('version', { required: true })
const token = getInput('token', { required: true })

export default async () => {
  const { os, arch } = getPlatform()
  const repo = {owner: 'projectdiscovery', repo: 'nuclei'}
  const octokit = getOctokit(token)

  try {
    if (version === 'latest') {
      debug('Getting latest release...')
      const latestRelease = await octokit.rest.repos.getLatestRelease(repo)
      version = latestRelease.data.tag_name
      debug(`Found latest release: ${version}`)
    } else {
      debug(`Getting "${version}" tag...`)
      await octokit.rest.repos.getReleaseByTag({...repo, tag: version})
    }
  } catch (error) {
    throw new Error(`Could not get "${version}" tag: ${error.message}`)
  }

  const asset = `nuclei_${version.replace(/^v/, '')}_${os}_${arch}.zip`
  const assetURL = `https://github.com/${repo.owner}/${repo.repo}/releases/download/${version}/${asset}`

  debug(`Checking cache for nuclei...`)
  let nucleiPath = find('nuclei', version, arch)

  if (nucleiPath) {
    notice(`nuclei ${version} found in cache`)
  } else {
    nucleiPath = join(process.env.GITHUB_WORKSPACE, '../', 'nuclei')

    let zipPath
    try {
      debug(`Downloading nuclei ${version} for ${os}/${arch}...`)
      zipPath = await downloadTool(assetURL)
    } catch (error) {
      throw new Error(`Could not download nuclei: ${error.message}`)
    }

    let extractedPath
    try {
      debug('Extracting nuclei...')
      extractedPath = await extractZip(zipPath, nucleiPath)
    } catch (error) {
      throw new Error(`Could not extract nuclei: ${error.message}`)
    }

    debug('Caching nuclei...')
    nucleiPath = await cacheDir(extractedPath, 'nuclei', version, arch)
  }

  debug('Adding nuclei to PATH...')
  addPath(nucleiPath)
  info(`nuclei ${version} has been installed successfully`)
}