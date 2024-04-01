import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as installer from './installer';
import { generateGithubReportFile } from './yaml';
import { parseFlagsToArray } from './utils';

const target = core.getInput('target', { required: false });
const urls = core.getInput('urls', { required: false });
const templates = core.getInput('templates', { required: false });
const workflows = core.getInput('workflows', { required: false });
const sarifExport = core.getInput('sarif-export', { required: false });
const markdownExport = core.getInput('markdown-export', { required: false });
const reportConfig = core.getInput('report-config', { required: false });
const config = core.getInput('config', { required: false });
const userAgent = core.getInput('user-agent', { required: false });
const flags = core.getInput('flags', { required: false });
const output = core.getInput('output', { required: false });

const json = core.getBooleanInput('json', { required: false });
const includeRR = core.getBooleanInput('include-rr', { required: false });
const omitRaw = core.getBooleanInput('omit-raw', { required: false });

const githubReport = core.getBooleanInput('github-report', { required: false });
const githubToken = core.getInput('github-token', { required: false });

const nucleiVersion = core.getInput('nuclei-version', { required: false });

let execOutput = '';
let execError = '';

const options = {};
options.listeners = {
  stdout: (data) => {
    execOutput += data.toString();
  },
  stderr: (data) => {
    execError += data.toString();
  }
};

async function run() {
	try {
		// download and install
		const binPath = await installer.downloadAndInstall(nucleiVersion);
    const params = [];

    if (!target && !urls) {
      core.setFailed('You need to set a target or provide a list of urls for Nuclei.');
      return
    }

    // Setting up params
    if (target) params.push(`-target=${target}`);
    if (urls) params.push(`-list=${urls}`);
    if (templates) {
      try {
        new URL(templates)
        params.push(`-turl=${templates}`);
      }
      catch(_) {
        params.push(`-t=${templates}`);
      }
    }
    if (workflows) params.push(`-w=${workflows}`);
    params.push(`-se=${sarifExport ? sarifExport : 'nuclei.sarif'}`);
    if (markdownExport) params.push(`-me=${markdownExport}`);
    if (reportConfig) params.push(`-rc=${reportConfig}`);
    if (config) params.push(`-config=${config}`);
    if (userAgent) params.push(`-H=${userAgent}`);
    params.push(`-o=${ output ? output : 'nuclei.log' }`);
    if (json) params.push('-json');
    if (includeRR) params.push('-irr');
    if (omitRaw) params.push('-or');

    if (flags) params.push(...parseFlagsToArray(flags));

    // If everything is fine and github-report is set, generate the yaml config file.
    if (githubReport) {
      await generateGithubReportFile(githubToken);
      params.push(`-rc=github-report.yaml`);
    }

		// run tool
    delete process.env.GITHUB_TOKEN
    exec.exec(binPath, params, options);
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
