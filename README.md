<h1 align="center">
  <img src="https://github.com/projectdiscovery/nuclei/blob/master/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

[Nuclei Action](https://github.com/projectdiscovery/nuclei-action) makes it easy to orchestrate [Nuclei](https://github.com/projectdiscovery/nuclei) with [GitHub Action](https://github.com/features/actions).
Integrate all of your [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) into powerful continuous security workflows and make it part of your secure software development life cycle.



Example Usage
-----

**GitHub Action running nuclei on single URL**

```yaml
      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@v1.0.1
        with:
          target: https://example.com
```

**GitHub Action running nuclei with custom templates**

```yaml
      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@v1.0.1
        with:
          target: https://example.com
          templates: custom_template_path
```

<ins>As default, all the default [nuclei-templates](https://github.com/projectdiscovery/nuclei-templates) are used for scan.</ins>

**GitHub Action running nuclei on multiple URLs**

```yaml
      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@v1.0.1
        with:
          urls: urls.txt
```

**GitHub Example Action running nuclei with GitHub Issue reporting**

```yaml
      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@v1.0.1
        with:
          target: https://example.com
          github-report: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
```


Workflow - `.github/workflows/nuclei.yml`


```yaml
name: Nuclei - DAST

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
          go-version: 1.15

      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@v1.0.1
        with:
          target: https://example.com

      - uses: actions/upload-artifact@v2
        with:
          name: nuclei.log
          path: nuclei.log
```

Available Inputs
------

| Key             | Description                                         | Required |
| --------------- | --------------------------------------------------- | -------- |
| `target`        | Target URL to run nuclei scan                       | true     |
| `urls`          | List of urls to run nuclei scan                     | false    |
| `templates`     | Custom templates directory/file to run nuclei scan  | false    |
| `output`        | File to save output result (default - nuclei.log)   | false    |
| `json`          | Write results in JSON format                        | false    |
| `include-rr`    | Include request/response in results                 | false    |
| `config`        | Set custom nuclei config file to use                | false    |
| `user-agent`    | Set custom user-agent header                        | false    |
| `github-report` | Set `true` to generate Github issue with the report | false    |
| `github-token`  | Set the Github Token                                | false    |
