function getPlatform() {
  const runnerOS = process.env.RUNNER_OS || process.platform
  const runnerArch = process.env.RUNNER_ARCH || process.arch

  const os = runnerOS !== 'macOS' ? String(runnerOS).toLowerCase() : runnerOS;
  const arch = String(runnerArch).toLowerCase()
    .replace('x86', '386')
    .replace('x64', 'amd64')

  return { os, arch }
}

module.exports = {
  getPlatform
}