import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
const GITHUB_REPOSITORY_OWNER = process.env.GITHUB_REPOSITORY_OWNER;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY.replace(`${GITHUB_REPOSITORY_OWNER}/`, '');
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

export async function generateGithubReportFile(token, reportConfigFileName = 'github-report.yaml') {
    const gitHubRepoConfig = {
        username: GITHUB_ACTOR,
        owner: GITHUB_REPOSITORY_OWNER,
        token,
        "project-name": GITHUB_REPOSITORY,
    };

    let content = {};

    if (reportConfigFileName) {
        try {
            const data = await fs.promises.readFile(path.join(GITHUB_WORKSPACE, reportConfigFileName), 'utf8');
            const { github, ...rest } = yaml.load(data);
            content = { ...rest, github: { ...gitHubRepoConfig, ...github } };
        } catch (err) {
            throw new Error(`Error reading the passed report config file: ${err.message}`);
        }
    } else {
        content.github = gitHubRepoConfig;
    }

    const githubConfigYml = yaml.dump(content, { flowLevel: 3 });

    try {
        await fs.promises.writeFile(path.join(GITHUB_WORKSPACE, reportConfigFileName), githubConfigYml);
    } catch (err) {
        throw new Error(`Error writing the report config file: ${err.message}`);
    }
}