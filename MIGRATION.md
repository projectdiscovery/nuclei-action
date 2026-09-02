# Migrating Guidelines

## From v2 to v3

This guide covers upgrading workflows from the v2 action contract (`main`, `v2`, and `v2.x`) to **`projectdiscovery/nuclei-action@v3`**.

### Quick checklist

- [ ] Change *`uses: projectdiscovery/nuclei-action@main`* or `@v2` to **`uses: projectdiscovery/nuclei-action@v3`**.
- [ ] Replace v2-specific scan inputs with one of these v3 entrypoints:
   - `args` for raw Nuclei CLI arguments.
   - `config` for inline Nuclei configuration content.
   - `config-path` for a Nuclei configuration file in your repository.
- [ ] Rename `nuclei-version` to `version`.
- [ ] If your v2 workflow used `config: path/to/config.yaml`, move that value to `config-path:`. In v3, `config` means file content, not a file path.
- [ ] If your workflow relied on `sarif_exists`, `json_exists`, or `jsonl_exists`, replace those checks with explicit file checks. v3 only exposes `stdout` and `stderr`.
- [ ] Decide whether to use the main action's built-in cache (`cache: true`, default) or the dedicated [cache sub-action](cache/README.md).

### What changed

- v2 exposed many action-specific inputs such as `target`, `urls`, `templates`, `workflows`, exporters, and reporting toggles.
- v3 is CLI-first. The action installs Nuclei and then runs the exact CLI arguments or configuration you provide.
- v2 treated `config` as a config file path. v3 treats `config` as inline YAML content and adds `config-path` for repository files.
- v2 always created default report files such as `nuclei.log`, `nuclei.sarif`, `nuclei.json`, and `nuclei.jsonl`. v3 only creates files you explicitly request through `args` or config.
- v2 set `sarif_exists`, `json_exists`, and `jsonl_exists`. v3 does not.
- v3 adds `install-only` and cache lifecycle support.
- v3 runs as a `node24` action instead of `node20`.

### Input mapping

| v2 input | v3 equivalent | Notes |
| --- | --- | --- |
| `target` | `args: -u https://example.com` or `config` / `config-path` | Pass scan targets directly to Nuclei. |
| `urls` | `args: -l urls.txt` or `config` / `config-path` | Use the Nuclei list input instead of an action-specific field. |
| `templates` | `args: -t path/to/templates` | If you used a template URL in v2, pass the corresponding Nuclei CLI flag in `args`. |
| `workflows` | `args: -w path/to/workflows` | Same behavior, now expressed as raw CLI arguments. |
| `output` | `args: -o nuclei.log` | v3 does not create a default output file unless you request one. |
| `json` | `args: -json` | Keep this with any other flags inside `args`. |
| `include-rr` | `args: -irr` | Still available through the CLI. |
| `omit-raw` | `args: -or` | Still available through the CLI. |
| `user-agent` | `args: -H "User-Agent: ..."` | Pass request headers directly as CLI arguments. |
| `config` | `config-path` or inline `config` | This is the most important semantic change. In v2 it was a file path. In v3 it is file content. |
| `report-config` | `config` / `config-path` | Set `report-config` inside the Nuclei config you pass to v3. |
| `github-report` | No direct input replacement | Create the report configuration yourself and pass it through `config` or `config-path`. |
| `github-token` | No direct reporting input replacement | In v3, reporting credentials should be provided via environment variables consumed by your Nuclei report config. |
| `sarif-export` | `args: -se results.sarif` or `config` / `config-path` | v3 only writes SARIF if you request it. |
| `json-export` | `args: -je results.json` or `config` / `config-path` | v3 only writes JSON if you request it. |
| `jsonl-export` | `args: -jle results.jsonl` or `config` / `config-path` | v3 only writes JSONL if you request it. |
| `markdown-export` | `args: -me results-markdown` or `config` / `config-path` | Same behavior, now expressed through Nuclei config or CLI flags. |
| `flags` | `args` | Fold every extra CLI flag into a single `args` string. |
| `nuclei-version` | `version` | `version` accepts `latest` or a `vX.Y.Z` tag. |

### Output changes

The v2 action emitted convenience outputs such as `sarif_exists`, `json_exists`, and `jsonl_exists` after always attempting those exports. v3 does not do that.

If you upload artifacts or SARIF in later steps, make the export explicit and then check for the file directly.

v2:

```yaml
- name: Nuclei - Vulnerability Scan
  id: nuclei_scan
  uses: projectdiscovery/nuclei-action@main
  with:
    target: https://example.com

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  if: steps.nuclei_scan.outputs.sarif_exists == 'true'
  with:
    sarif_file: nuclei.sarif
```

v3:

```yaml
- name: Nuclei - Vulnerability Scan
  uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u https://example.com -se results.sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  if: success() && hashFiles('results.sarif') != ''
  with:
    sarif_file: results.sarif
```

### Common migrations

#### Single target scan

v2:

```yaml
- uses: projectdiscovery/nuclei-action@main
  with:
    target: https://example.com
```

v3:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u https://example.com
```

#### URL list plus extra flags

v2:

```yaml
- uses: projectdiscovery/nuclei-action@main
  with:
    urls: urls.txt
    flags: -severity critical,high -stats
```

v3:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -l urls.txt -severity critical,high -stats
```

#### Templates and workflows

v2:

```yaml
- uses: projectdiscovery/nuclei-action@main
  with:
    target: https://example.com
    templates: custom_template_path
    workflows: custom_workflow_path
```

v3:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u https://example.com -t custom_template_path -w custom_workflow_path
```

#### Config file path

v2:

```yaml
- uses: projectdiscovery/nuclei-action@main
  with:
    urls: urls.txt
    config: config.yaml
```

v3:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    config-path: config.yaml
```

If you prefer to keep the configuration inline in the workflow, use `config` instead:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    config: |
      target:
        - https://example.com
      sarif-export: results.sarif
```

### GitHub issue reporting

v2 allowed convenience inputs such as `github-report`, `github-token`, and `report-config`. In v3, reporting is configured through Nuclei itself.

v2:

```yaml
- uses: projectdiscovery/nuclei-action@main
  with:
    target: https://example.com
    github-report: true
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

v3:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    args: -u https://example.com
    config: |
      report-config: issue-tracker-config.yaml
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_OWNER: ${{ github.repository_owner }}
    GITHUB_PROJECT_NAME: ${{ github.event.repository.name }}
```

Define the full issue tracker configuration in your repository, then reference any secrets or repository metadata through environment variables.

## New v3-only inputs

* `install-only` lets you install Nuclei without running a scan:

```yaml
- uses: projectdiscovery/nuclei-action@v3
  with:
    version: v3.6.0
    install-only: true
    cache: true

- run: nuclei -version
```

`cache` controls whether the main action restores and saves Nuclei template state, regenerable cache data, templates, and Rod browser data. It does not cache Nuclei configuration files. It defaults to `true`.

## Final check before switching to v3

Before merging the migration, confirm these points in your workflow:

- [ ] The `uses:` reference points to `projectdiscovery/nuclei-action@v3`.
- [ ] Every old v2 scan input has been moved into `args`, `config`, or `config-path`.
- [ ] Any old `config:` file path has been renamed to `config-path:`.
- [ ] Any later step that used v2 export outputs now checks for the generated file directly.
- [ ] If you use self-hosted runners, they support GitHub Actions running on `node24`.

For the current v3 interface and examples, see [README.md](README.md).
