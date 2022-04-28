import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
const GITHUB_REPOSITORY_OWNER = process.env.GITHUB_REPOSITORY_OWNER;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY.replace(`${GITHUB_REPOSITORY_OWNER}/`, '');
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

export async function generateGithubReportFile(token) {
        const content = {
            "github" : {
                "username": GITHUB_ACTOR,
                "owner": GITHUB_REPOSITORY_OWNER,
                token,
                "project-name": GITHUB_REPOSITORY,
                "issue-label": "Nuclei Report"
            }
        }
        const githubConfigYml = yaml.dump(content, {
            flowLevel: 3
        });

        fs.writeFileSync(path.join(GITHUB_WORKSPACE, 'github-report.yaml'), githubConfigYml, err => {
        if (err)
            reject(err);
    });
}