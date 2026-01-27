const core = require('@actions/core')
const github = require('@actions/github')
const tc = require('@actions/tool-cache')
const path = require('node:path')
const utils = require('./utils')
let version = core.getInput('version', { required: true })
const token = core.getInput('token', { required: true })

module.exports = async () => {
  const { os, arch } = utils.getPlatform()
  const repo = {owner: 'projectdiscovery', repo: 'nuclei'}
  const octokit = github.getOctokit(token)

  try {
    if (version === 'latest') {
      core.debug('Getting latest release...')
      const latestRelease = await octokit.rest.repos.getLatestRelease(repo)
      version = latestRelease.data.tag_name
      core.debug(`Found latest release: ${version}`)
    } else {
      core.debug(`Getting "${version}" tag...`)
      await octokit.rest.repos.getReleaseByTag({...repo, tag: version})
    }
  } catch (error) {
    throw new Error(`Could not get "${version}" tag: ${error.message}`)
  }

  const asset = `nuclei_${version.replace(/^v/, '')}_${os}_${arch}.zip`
  const assetURL = `https://github.com/${repo.owner}/${repo.repo}/releases/download/${version}/${asset}`

  core.debug(`Checking cache for nuclei...`)
  let nucleiPath = tc.find('nuclei', version, arch)

  if (nucleiPath) {
    core.notice(`nuclei ${version} found in cache`)
  } else {
    nucleiPath = path.join(process.env.GITHUB_WORKSPACE, '../', 'nuclei')

    let zipPath
    try {
      core.debug(`Downloading nuclei ${version} for ${os}/${arch}...`)
      zipPath = await tc.downloadTool(assetURL)
    } catch (error) {
      throw new Error(`Could not download nuclei: ${error.message}`)
    }

    let extractedPath
    try {
      core.debug('Extracting nuclei...')
      extractedPath = await tc.extractZip(zipPath, nucleiPath)
    } catch (error) {
      throw new Error(`Could not extract nuclei: ${error.message}`)
    }

    core.debug('Caching nuclei...')
    nucleiPath = await tc.cacheDir(extractedPath, 'nuclei', version, arch)
  }

  core.debug('Adding nuclei to PATH...')
  core.addPath(nucleiPath)
  core.info(`nuclei ${version} has been installed successfully`)
}