# GitHub Action - Adds release comments to PRs

This action iterates through all PRs that are part of a release and adds a comment to each of them containing information about the release.

## Inputs

### `repo-token`

**Required** The GITHUB_TOKEN secret.

## Outputs

### `pr-ids`

List of the IDs of the commented PRs

## Example usage
This action runs only when triggered by a `release` event and a `published` action.

```yml
name: Comment on released PRs

on:
  release:
    types:
      - published

jobs:
  comment:
    name: Comment on released PRs
    runs-on: ubuntu-latest
    steps:
      - name: Comment on released PRs
        uses: rdlf0/comment-released-prs-action@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Posted comment
The comment posted to the PRs will look like this:  
![comment-preview](https://github.com/rdlf0/comment-released-prs-action/blob/master/assets/comment-preview.png)

## License
The scripts and documentation in this project are released under the [MIT License](https://github.com/rdlf0/comment-released-prs-action/blob/master/LICENSE)
