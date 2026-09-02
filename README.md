<h1 align="center">
  <img src="https://github.com/projectdiscovery/nuclei/blob/main/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

This Nuclei Action makes it easy to orchestrate [Nuclei](https://github.com/projectdiscovery/nuclei) with [GitHub Action](https://github.com/features/actions).
Integrate all of your [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) into powerful continuous security workflows and make it part of your secure software development life cycle.

<img alt="Nuclei Action" src="https://github.com/user-attachments/assets/2eeaaeb8-23d4-40cf-a986-4b9825157922" />

## Compatibility

- `v3.0.0+` runs on Node.js v24 and adopts a CLI-first interface, accepting [inputs](#inputs) like `version`, `install-only`, `args`, etc., and [outputs](#outputs) only to `stdout` and `stderr`.
- `v2.0.0+` and `v2.x` relies on action-specific inputs such as `target`, `urls`, `templates`, `workflows`, `flags`, and various exporter/reporting toggles; `v2.x` are deprecated and unsupported after **March 1, 2026**. See [MIGRATION.md](MIGRATION.md) before upgrading.
- `v1+` runs on Node.js v16 and uses inputs like `target`, `urls`, `templates`, `workflows`, `output`, `json`, `include-rr`, `config`, `report-config`, `github-report`, `github-token`, `sarif-export`, `markdown-export`, and `flags`.

## Inputs

| name | description | required | default |
| --- | --- | --- | --- |
| `version` | <p>Setup with specific version ("latest" or in format "vX.Y.Z").</p> | `true` | `latest` |
| `install-only` | <p>Install Nuclei without running scans.</p> | `false` | `false` |
| `args` | <p>Arguments to pass to Nuclei.</p> | `false` | `""` |
| `config` | <p>Nuclei configuration file content.</p> | `false` | `""` |
| `config-path` | <p>Path to Nuclei configuration file.</p> | `false` | `""` |
| `cache` | <p>Enable caching of Nuclei template state, cache data, templates, and browser data.</p> | `false` | `true` |
| `token` | <p>GitHub Token. It is used to fetch Nuclei releases from GitHub.</p> | `true` | `${{ github.token }}` |

> [!IMPORTANT]
> * `config` and `config-path` **must not** be set together.
> * `args` **always take precedence** over `config` or `config-path`.

> [!NOTE]
> When [debug logging](https://docs.github.com/en/actions/how-tos/monitor-workflows/enable-debug-logging) is enabled, this action automatically adds `-debug` and `-verbose` flags to Nuclei.

## Outputs

| name | description |
| --- | --- |
| `stdout` | <p>The standard output from running Nuclei</p> |
| `stderr` | <p>The standard error from running Nuclei</p> |

## Runs

This action is a `node24` action.

## Caching

Caching includes Nuclei template state, regenerable cache data, templates, and Rod browser data. It does not include the user configuration directory (`XDG_CONFIG_HOME/nuclei` or `NUCLEI_CONFIG_DIR`), `XDG_CONFIG_DIRS`, or `/etc/nuclei/config.yaml` on Unix.

> [!WARNING]
> Do not store credentials, private keys, or other sensitive information in a cached path. For the exact cache scope and compatibility details, see the [cache sub-action documentation](cache/README.md).

## Usage

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version:
    # Setup with specific version ("latest" or in format "vX.Y.Z").
    #
    # Required: true
    # Default: latest

    install-only:
    # Install Nuclei without running scans.
    #
    # Required: false
    # Default: false

    args:
    # Arguments to pass to Nuclei.
    #
    # Required: false
    # Default: ""

    config:
    # Nuclei configuration file content.
    #
    # Required: false
    # Default: ""

    config-path:
    # Path to Nuclei configuration file.
    #
    # Required: false
    # Default: ""

    cache:
    # Enable caching of Nuclei template state, cache data, templates, and browser data.
    #
    # Required: false
    # Default: true

    token:
    # GitHub Token. It is used to fetch Nuclei releases from GitHub.
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

or install only and without cache:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: v3.6.0
    install-only: true
    cache: false

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
  env:
    GITHUB_BASE_URL: https://localhost:8443/github
    GITHUB_USERNAME: test-username
    GITHUB_OWNER: test-owner
    GITHUB_TOKEN: ${{ secrets.GITHUB_PAT }}
    GITHUB_PROJECT_NAME: test-project
```

<details>
<summary>Example <code>issue-tracker-config.yaml</code> (repository file):</summary>

```yaml
github:
 # base-url is the optional self-hosted GitHub application url
 base-url: $GITHUB_BASE_URL # read from environment variable
 # username is the username of the GitHub user
 username: $GITHUB_USERNAME # read from environment variable
 # owner is the owner name of the repository for issues
 owner: $GITHUB_OWNER # read from environment variable
 # token is the token for GitHub account
 token: $GITHUB_TOKEN # read from environment variable
 # project-name is the name of the repository
 project-name: $GITHUB_PROJECT_NAME # read from environment variable

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

## Contributing

We welcome contributions! Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details on how to get started.

## License

MIT. See [LICENSE](/LICENSE) for more details.
