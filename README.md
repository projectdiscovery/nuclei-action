<h1 align="left">
  <img src="https://github.com/projectdiscovery/nuclei/blob/master/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

[Nuclei Action](https://github.com/projectdiscovery/nuclei-action) is a GitHub Action to integrate [Nuclei](https://github.com/projectdiscovery/nuclei) scanning to a workflow.

Usage
-----

*.github/workflows/nuclei.yml*
```
on:
  workflow_dispatch:
  schedule:
    - cron: "0 10 * * *"

jobs:
  worker:
    runs-on: ubuntu-latest
    steps:      
      - uses: actions/checkout@v2      

      - uses: projectdiscovery/nuclei-action@main
        with:
          urls: "urls.txt"
          output: "output.txt"

      - uses: actions/upload-artifact@v2
        with:
          name: output.txt
          path: output.txt
```

Inputs
------

| Key  | Description | Required |
| :---:     |     :---:   |    :---:   |
| `urls`  | List of urls to run templates | true
| `templates`  | Templates input file/files to check across hosts | false
| `output`  | File to save output result | false
| `user-agent`  | Set a User-Agent header | false