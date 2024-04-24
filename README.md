# action-cache-r2

Cache workflow items for future re-use using CloudFlare's R2 service.

## Basic usage

The following workflow will try to restore cache entries from:

- `my-workflow-${{ runner.os }}-${{ github.ref }}` or
- `my-workflow-${{ runner.os }}-develop` or
- `my-workflow-${{ runner.os }}-main`

After the job finishes, it will save a cache entry for `my-workflow-${{ runner.os }}-${{ github.ref }}`. Overriding any existing cache entry with the same key.

```yaml
name: MyWorkflowWithCaching

on:
  pull_request:
  workflow_dispatch:
jobs:
  myWorkflowWithCaching:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # if possible these paths will be restored from a previous cache
      # in addition, a cache entry will be created for these paths after the job ends
      - name: Register cachable paths
        uses: tombailey/action-cache-r2@v0.2
        with:
          bucket: scratch
          endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
          accessKeyId: ...
          secretAccessKey: ...
          paths: |
            ~/example
            example.txt
          # for v0.2, the first key that exists will be restored so specify keys in order of preference
          restoreKeys: |
            my-workflow-${{ runner.os }}-${{ github.head_ref || github.ref_name }}
            my-workflow-${{ runner.os }}-develop
            my-workflow-${{ runner.os }}-main
          # will be saved after the action completes
          saveKey: my-workflow-${{ runner.os }}-${{ github.head_ref || github.ref_name }}

      - name: Create cachable content
        run: mkdir ~/example && echo "cached-value" > example.txt
```

### Rekey cache on merge

To maximize cache hits, when a branch is merged, its cache can be rekeyed.

For example the cache entry for `linux-feature/mybranch` should be rekeyed to `linux-develop` when `feature/mybranch` is merged into `develop`.

```yaml
name: Copy cache on merge

on:
  pull_request:
    branches:
      - main
      - develop
    types: [closed]
jobs:
  rekeyCache:
    runs-on: ubuntu-latest
    steps:
      - name: Register cachable paths
        uses: tombailey/action-cache-r2/dist/move@v0.2
        with:
          bucket: scratch
          endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
          accessKeyId: ...
          secretAccessKey: ...
          sourceKey: my-workflow-${{ runner.os }}-${{ github.head_ref }}
          targetKey: my-workflow-${{ runner.os }}-${{ github.base_ref }}
```

## Test

```shell
docker build . -t action-cache-r2-test
docker run --env R2_ENDPOINT=... --env R2_ACCESS_KEY_ID=... --env R2_SECRET_ACCESS_KEY=... --env R2_BUCKET=... -t action-cache-r2-test
```

## Future work

Make it possible to clear caches on-demand and stale caches periodically.
