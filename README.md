# GitHub Action - Adds release comments to PRs

This action iterates through all PRs that are part of a release and adds a comment to each of them containing information about the release.

## Outputs

### `pr-ids`

List of the IDs of the commented PRs

## Example usage

```yml
uses: rdlf0/comment-released-prs-action@v1
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
