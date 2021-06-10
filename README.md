<h1 align="center">
  <img src="https://github.com/projectdiscovery/nuclei/blob/master/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

[Nuclei Action](https://github.com/projectdiscovery/nuclei-action) makes it easy to orchestrate [Nuclei](https://github.com/projectdiscovery/nuclei) with [GitHub Action](https://github.com/features/actions).
Integrate all of your [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) into powerful continuous security workflows and make it part of your secure software development life cycle.



Usage
-----

*.github/workflows/nuclei.yml*

```yaml
name: Nuclei - DAST

on:
  workflow_dispatch:
  schedule:
    - cron: "0 10 * * *"

jobs:
  worker:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2

      - uses: actions/cache@v2
        id: cache
        with:
          path: /home/runner/go/bin/nuclei
          key: ${{ runner.os }}-${{ hashFiles('/home/runner/go/bin/nuclei') }}

      - uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com
          output: "nuclei.log"

      - uses: actions/upload-artifact@v2
        with:
          name: nuclei.log
          path: nuclei.log
```

Example with nuclei generating an ISSUE with the report:

*.github/workflows/nuclei.yml*

```yaml
name: Nuclei - DAST

on:
  workflow_dispatch:
  schedule:
    - cron: "0 10 * * *"

jobs:
  worker:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2

      - uses: actions/cache@v2
        id: cache
        with:
          path: /home/runner/go/bin/nuclei
          key: ${{ runner.os }}-${{ hashFiles('/home/runner/go/bin/nuclei') }}

      - uses: projectdiscovery/nuclei-action@main
        with:
          target: https://example.com
          github-report: true
          report-token: ${{ secrets.GITHUB_TOKEN }}
```

Inputs
------

|       Key       |                   Description                    | Required |
| :-------------: | :----------------------------------------------: | :------: |
|    `target`     |           Target URL to run templates            |   true   |
|     `urls`      |          List of urls to run templates           |  false   |
|   `templates`   |      Custom templates to check across hosts      |  false   |
|    `output`     |            File to save output result            |  false   |
|  `include-rr`   |         Include request/response in log          |  false   |
|    `config`     |        Custom config file to use for scan        |  false   |
|  `user-agent`   |             Set a User-Agent header              |  false   |
| `github-report` | Set `true` for generate an issue with the report |  false   |
| `report-token`  |               Set the Github Token               |  false   |


