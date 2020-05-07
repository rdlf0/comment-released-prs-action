# GitHub Action - Adds release comments to PRs

This action iterates through all PRs that are part of a release and adds a comment to each of them containing information about the release.

## Inputs

### `release-id`

**Required** The ID of the release.

## Outputs

### `pr-ids`

List of the IDs of the commented PRs

## Example usage

```
uses: rdlf0/comment-released-prs-action@v1
with:
  release-id: ${{ github.event.release.id }}
```
