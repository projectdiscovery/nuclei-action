<h1 align="center">
  <img src="https://github.com/projectdiscovery/nuclei/blob/main/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

This Nuclei Action makes it easy to orchestrate [Nuclei](https://github.com/projectdiscovery/nuclei) with [GitHub Action](https://github.com/features/actions).
Integrate all of your [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) into powerful continuous security workflows and make it part of your secure software development life cycle.

## Inputs

| name | description | required | default |
| --- | --- | --- | --- |
| `version` | <p>Setup with specific version ("latest" or in format "vX.Y.Z")</p> | `true` | `latest` |
| `install-only` | <p>Install Nuclei without running scans</p> | `false` | `false` |
| `args` | <p>Arguments to pass to Nuclei</p> | `false` | `""` |
| `config` | <p>Nuclei configuration file content</p> | `false` | `""` |
| `config-path` | <p>Path to Nuclei configuration file</p> | `false` | `""` |
| `token` | <p>GitHub Token</p> | `true` | `${{ github.token }}` |

> [!IMPORTANT]
> * `config` and `config-path` **must not** be set together.
> * `args` **always take precedence** over `config` or `config-path`.

> [!NOTE]
> When [debug logging](https://docs.github.com/en/actions/how-tos/monitor-workflows/enable-debug-logging) is enabled, this action automatically adds `-debug` and `-verbose` arguments to Nuclei.

## Outputs

| name | description |
| --- | --- |
| `stdout` | <p>The standard output from running Nuclei</p> |
| `stderr` | <p>The standard error from running Nuclei</p> |

## Runs

This action is a `node24` action.

## Usage

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version:
    # Setup with specific version ("latest" or in format "vX.Y.Z")
    #
    # Required: true
    # Default: latest

    install-only:
    # Install Nuclei without running scans
    #
    # Required: false
    # Default: false

    args:
    # Arguments to pass to Nuclei
    #
    # Required: false
    # Default: ""

    config:
    # Nuclei configuration file content
    #
    # Required: false
    # Default: ""

    config-path:
    # Path to Nuclei configuration file
    #
    # Required: false
    # Default: ""

    token:
    # GitHub Token
    #
    # Required: true
    # Default: ${{ github.token }}
```

### Example

**Default setup (latest Nuclei)**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u http://scanme.sh
```

**Setup with specific version**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: v3.6.0
    args: -u http://scanme.sh
```

**Setup or install Nuclei without running scans**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: v3.6.0
    install-only: true

- run: nuclei -version
```

**Setup with Nuclei configuration**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: latest
    config: |
      target:
        - http://scanme.sh
      sarif-export: results.sarif
```

or pass it via [variables](https://docs.github.com/actions/learn-github-actions/variables):

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: latest
    config: ${{ vars.NUCLEI_CONFIG }}
```

or via repo-managed config file:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: latest
    config-path: path/to/nuclei.yaml
```

**Setup with [GitHub code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/about-code-scanning)**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: latest
    config: |
      target:
        - http://scanme.sh
      sarif-export: results.sarif

- uses: github/codeql-action/upload-sarif@v3
  if: success()
  with:
    sarif_file: results.sarif
    category: nuclei-results
```

**Setup with reporting**

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u http://scanme.sh
    config: |
      report-config: issue-tracker-config.yaml
```

<details>
<summary>Example <code>issue-tracker-config.yaml</code> (repository file):</summary>

```yaml
github:
 # base-url is the optional self-hosted GitHub application url
 base-url: https://localhost:8443/github
 # username is the username of the GitHub user
 username: test-username
 # owner is the owner name of the repository for issues
 owner: test-owner
 # token is the token for GitHub account
 token: test-token
 # project-name is the name of the repository
 project-name: test-project
 # issue-label is the label of the created issue type
 issue-label: bug
 # allow-list sets a tracker level filter to only create issues for templates with
 # these severity labels or tags (does not affect exporters. set those globally)
 allow-list:
   severity: high, critical
   tags: network
 # deny-list sets a tracker level filter to never create issues for templates with
 # these severity labels or tags (does not affect exporters. set those globally)
 deny-list:
   severity: low
 # duplicate-issue-check flag to enable duplicate tracking issue check.
 duplicate-issue-check: false
```

Refer to https://github.com/projectdiscovery/nuclei/blob/dev/cmd/nuclei/issue-tracker-config.yaml.
</details>

## License

MIT. See [LICENSE](/LICENSE).