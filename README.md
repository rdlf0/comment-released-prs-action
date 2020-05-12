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
name: Comment released PRs

on:
  release:
    types:
      - published

jobs:
  comment:
    name: Comment released PRs
    runs-on: ubuntu-latest
    steps:
      - name: Comment released PRs
        uses: rdlf0/comment-released-prs-action@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```
The posted comment will look like this:  
![comment-preview](https://github.com/rdlf0/comment-released-prs-action/blob/master/assets/comment-preview.png)

## To-do
- Check if a PR has already been commented by this action
- When a released has been unpublished - delete comments

## License
The scripts and documentation in this project are released under the [MIT License](https://github.com/rdlf0/comment-released-prs-action/blob/master/LICENSE)
