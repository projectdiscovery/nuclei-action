# Nuclei Cache Action

This sub-action restores and saves Nuclei template state, cache data, templates, and browser data.

## Cached data

The action caches these paths:

- `templates.json` under the Nuclei XDG state directory. Other state files, including resume and crash-recovery files, are excluded.
- The Nuclei directory under `XDG_CACHE_HOME`.
- The template root selected by `NUCLEI_TEMPLATES_DIR`, `templates.json`, or the XDG data directories.
- The Rod browser cache under `$HOME/.cache/rod/browser`.

Platform defaults apply when an XDG environment variable is not set.

Nuclei configuration files are not cached. This exclusion includes the user configuration directory (`XDG_CONFIG_HOME/nuclei` or `NUCLEI_CONFIG_DIR`), `XDG_CONFIG_DIRS`, and `/etc/nuclei/config.yaml` on Unix - because these files may contain credentials, private keys, or other sensitive information, and GitHub Actions caches can be read by pull requests that have access to the cache scope. See [GitHub's cache security guidance](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#best-practices-for-using-caches-securely).

## Usage

```yaml
- uses: projectdiscovery/nuclei-action/cache@v3

- run: nuclei -update-templates
```

Use this sub-action when you want Nuclei cache lifecycle management without downloading or running Nuclei through the main action.

If you combine `projectdiscovery/nuclei-action/cache@v3` with `projectdiscovery/nuclei-action@v3` in the same job, set `cache: false` on the main action to avoid duplicate cache restore/save work.

## Runs

This action is a `node24` action.
