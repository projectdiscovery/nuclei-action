<h1 align="left">
  <img src="https://github.com/projectdiscovery/nuclei/blob/master/static/nuclei-logo.png" alt="nuclei" width="200px"></a>
  <br>
</h1>

[Nuclei](https://github.com/projectdiscovery/nuclei) is an open-source web application security scanner developed by [ProjectDiscovery.io](https://twitter.com/pdiscoveryio). Its template engine empowers a community of cybersecurity researchers to keep up the exploit database.

## Usage

[.github/workflows/nuclei.yml](https://github.com/secopslab/appsec-actions/blob/master/.github/workflows/nuclei.yml)

```
name: "DAST with Nuclei"

on:
  workflow_dispatch:
  schedule:
    - cron: "0 10 * * *"

jobs:
  worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: secopslab/nuclei-action@v1
        with:
          urls-txt: ".github/nuclei.txt"
          custom-templates: ".github/custom-templates/"
          user-agent: "Explore https://github.com/secopslab/"

      - uses: actions/upload-artifact@v2
        with:
          name: nuclei.log
          path: nuclei.log

      - uses: secopslab/appsec-etl@v1
        with:
          tool: nuclei
          slack-token: ${{ secrets.SLACK_TOKEN }}
          slack-channel: ${{ secrets.SLACK_CHANNEL_NUCLEI }}
          dd-api-key: ${{ secrets.DD_API_KEY }}
```

## Arguments

| Input  | Description | Usage |
| :---:     |     :---:   |    :---:   |
| `urls-txt`  | List of urls to run templates  | Required
| `custom-templates`  | Custom templates to check on urls  | Optional
| `user-agent`  | Set a User-Agent header | Optional
| `tool`  | Set a User-Agent header | Required
| `slack-token`  | Authentication token bearing required scopes | Optional
| `slack-channel`  | Channel, private group, or IM channel to send message to. Can be an encoded ID, or a name | Optional
| `dd-api-key` | An API key is required by the Datadog Agent to submit metrics and events to Datadog | Optional

## Contributing

Contributions are welcome!

## License

The code in this project is released under the [MIT License](LICENSE).
