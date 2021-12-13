<h1 align="center">
  <img src="https://github.com/projectdiscovery/nuclei/blob/master/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

This Nuclei Action makes it easy to orchestrate [Nuclei](https://github.com/projectdiscovery/nuclei) with [GitHub Action](https://github.com/features/actions).
Integrate all of your [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) into powerful continuous security workflows and make it part of your secure software development life cycle.

Example Usage
-----

**Workflow** - `.github/workflows/nuclei.yml`

```yaml
name: Nuclei - DAST Scan

on:
    schedule:
      - cron: '0 0 * * *'
    workflow_dispatch:

jobs:
  nuclei-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
        with:
          go-version: 1.17

      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com

      - name: GitHub Workflow artifacts
        uses: actions/upload-artifact@v2
        with:
          name: nuclei.log
          path: nuclei.log

      - name: GitHub Security Dashboard Alerts update
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: nuclei.sarif
```

**GitHub Action running Nuclei on single URL**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com
```

**GitHub Action running Nuclei with custom templates**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com
          templates: custom_template_path
```

<ins>As default, all the default [nuclei-templates](https://github.com/projectdiscovery/nuclei-templates) are used for scan.</ins>

**GitHub Action running Nuclei on multiple URLs**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          urls: urls.txt
```

**GitHub Action running Nuclei with CLI flags**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          urls: urls.txt
          flags: "-severity critical,high,medium,low -stats"
```

**GitHub Action running Nuclei with Custom UA**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          urls: urls.txt
          user-agent: "User-Agent:'Nuclei - DAST Scan (Have a nice day)'"
```

**GitHub Action running Nuclei with Config files**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          urls: urls.txt
          config: config.yaml
          report-config: issues.yaml
```

**GitHub Example Action running Nuclei with GitHub Issue reporting**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com
          github-report: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**GitHub Example Action running Nuclei with GitHub Security Dashboard reporting**

```yaml
      - name: Nuclei - DAST Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com

      - name: GitHub Security Dashboard Alerts
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: nuclei.sarif
```

Available Inputs
------

| Key               | Description                                         | Required |
| ----------------- | --------------------------------------------------- | -------- |
| `target`          | Target URL to run nuclei scan                       | true     |
| `urls`            | List of urls to run nuclei scan                     | false    |
| `templates`       | Custom templates directory/file to run nuclei scan  | false    |
| `output`          | File to save output result (default - nuclei.log)   | false    |
| `json`            | Write results in JSON format                        | false    |
| `include-rr`      | Include request/response in results                 | false    |
| `config`          | Set custom nuclei config file to use                | false    |
| `user-agent`      | Set custom user-agent header                        | false    |
| `report-config`   | Issue reporting configuration file                  | false    |
| `github-report`   | Set `true` to generate Github issue with the report | false    |
| `github-token`    | Set the Github Token                                | false    |
| `sarif-export`    | File to export result (default - sarif.nuclei)      | false    |
| `markdown-export` | Directory to export markdown results                | false    |
| `nuclei-flags`    | More Nuclei CLI flags to use                        | false    |
