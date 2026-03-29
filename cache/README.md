# Nuclei Cache Action

This sub-action restores and saves Nuclei caches, configs, templates, and browser data.

## Usage

```yaml
- uses: projectdiscovery/nuclei-action/cache@v3

- run: nuclei -update-templates
```

Use this sub-action when you want Nuclei cache lifecycle management without downloading or running Nuclei through the main action.

If you combine `projectdiscovery/nuclei-action/cache@v3` with `projectdiscovery/nuclei-action@v3` in the same job, set `cache: false` on the main action to avoid duplicate cache restore/save work.

## Runs

This action is a `node24` action.